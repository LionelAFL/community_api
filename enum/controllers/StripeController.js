const db = require("../models");
const HttpCodes = require("http-codes");
const UserRoles = require("../enum").USER_ROLE;
const smtpService = require("../services/smtp.service");
const { LabEmails } = require("../enum");
const UserController = require("../controllers/UserController");

const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SK_KEY, {
  maxNetworkRetries: 3,
});

const moment = require("moment");

const User = db.User;

const StripeController = () => {
  /**
   * Function to create stripe checkout session object
   * and return to redirect.
   * @param {*} req
   * @param {*} res
   */
  const createCheckoutSession = async (req, res) => {
    const {
      prices,
      user,
      isBuyingSimulations = false,
      isAdvertisement = false,
      isBuyingCredits = false,
      credits = 0,
      simulations = 0,
      isPaidEvent = false,
      event = {},
      callback_url,
    } = req.body;
    const { id } = req.token;

    if (prices) {
      let checkoutSessionPrices = [];

      if (isPaidEvent) {
        prices.map((item) =>
          checkoutSessionPrices.push({
            price_data: item.price_data,
            quantity: 1,
          })
        );
      } else {
        prices.map((item) =>
          checkoutSessionPrices.push({ price: item, quantity: 1 })
        );
      }

      const user = await User.findOne({
        where: {
          id,
        },
      });

      try {
        let sessionData = {
          success_url: callback_url || process.env.STRIPE_CALLBACK_URL,
          cancel_url: callback_url || process.env.STRIPE_CALLBACK_URL,
          payment_method_types: ["card"],
          line_items: checkoutSessionPrices,
          mode: "subscription",
          allow_promotion_codes: true,
        };

        if (isAdvertisement) {
          sessionData = {
            ...sessionData,
            mode: "payment",
            payment_intent_data: {
              metadata: {
                isAdvertisement: true,
              },
            },
          };
        }

        if (isBuyingCredits) {
          sessionData = {
            ...sessionData,
            mode: "payment",
            payment_intent_data: {
              metadata: {
                credits,
                isBuyingCredits: true,
              },
            },
          };
        }

        if (isBuyingSimulations) {
          sessionData = {
            ...sessionData,
            mode: "payment",
            payment_intent_data: {
              metadata: {
                simulations,
                isBuyingSimulations: true,
              },
            },
          };
        }
        if (isPaidEvent) {
          sessionData = {
            ...sessionData,
            success_url: callback_url,
            cancel_url: callback_url,
            mode: "payment",
            payment_intent_data: {
              metadata: {
                isPaidEvent: true,
                eventTitle: event.title,
                eventId: event.id,
                eventTimezone: event.timezone,
                userTimezone: event.userTimezone,
              },
            },
          };
        }

        const customers = await stripe.customers.list({
          email: user.email,
          limit: 1,
        });

        let subscriptionExists = false;

        if (customers.data.length > 0) {
          const customer = customers.data[0];
          sessionData["customer"] = customer.id;
          if (customer.subscriptions.data.length > 0) {
            for (let subscription of customer.subscriptions.data) {
              if (
                prices.indexOf(subscription.items.data[0].price.id) > -1 &&
                subscription.status == "active"
              ) {
                subscriptionExists = true;
                break;
              }
            }
          }
        } else {
          sessionData["customer_email"] = user.email;
        }
        if (!subscriptionExists) {
          const session = await stripe.checkout.sessions.create(sessionData);
          return res.status(HttpCodes.OK).json(session);
        } else {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "The subscription is already active." });
        }
      } catch (err) {
        console.log(err);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: err.message });
      }
    }

    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Internal server error" });
  };
  /**
   * Function to get customer portal session object
   * and return to redirect.
   * @param {*} req
   * @param {*} res
   */
  const createPortalSession = async (req, res) => {
    const { id } = req.token;

    const user = await User.findOne({
      where: {
        id,
      },
    });

    try {
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      });
      if (customers.data.length > 0) {
        const customer = customers.data[0];
        const session = await stripe.billingPortal.sessions.create({
          customer: customer.id,
          return_url: process.env.STRIPE_CALLBACK_URL,
        });

        return res.status(HttpCodes.OK).json({ session });
      } else {
        return res
          .status(HttpCodes.OK)
          .json({ session: null, subscription: null });
      }
    } catch (err) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };
  /**
   * Function to get customer portal session object
   * and return to redirect.
   * @param {*} req
   * @param {*} res
   */
  const getSubscription = async (req, res) => {
    const { id } = req.token;

    const user = await User.findOne({
      where: {
        id,
      },
    });

    try {
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      });
      if (customers.data.length > 0) {
        const customer = customers.data[0];
        let subscription = null;
        let premiumPrices = [
          process.env.REACT_APP_STRIPE_YEARLY_USD_PRICE_ID,
          process.env.REACT_APP_STRIPE_YEARLY_INR_PRICE_ID,
          process.env.REACT_APP_STRIPE_YEARLY_NGN_PRICE_ID,
        ];

        for (let itemPremium of premiumPrices) {
          if (customer.subscriptions.data.length > 0) {
            for (let subItemPremium of customer.subscriptions.data) {
              if (subItemPremium.items.data[0].price.id === itemPremium) {
                subscription = subItemPremium;
                break;
              }
            }
          }
        }

        return res.status(HttpCodes.OK).json({ subscription });
      } else {
        return res
          .status(HttpCodes.OK)
          .json({ session: null, subscription: null });
      }
    } catch (err) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  /**
   * Function to manage stripe events
   * @param {*} req
   * @param {*} res
   */
  const webhook = async (req, res) => {
    const { type, data } = req.body;

    try {
      let newUserData = {};
      if (
        type === "customer.subscription.updated" ||
        type === "invoice.payment_succeeded" ||
        type === "customer.subscription.deleted" ||
        type === "charge.succeeded"
      ) {
        const { customer, metadata, paid, status } = data.object;

        const customerInformation = await stripe.customers.retrieve(customer);
        const email = customerInformation.email.toLowerCase();

        const user = await User.findOne({
          where: {
            email,
          },
        });

        const premiumData = await premiumValidation(user, customer);
        newUserData = { ...newUserData, ...premiumData };

        const channelData = await channelsValidation(user, customerInformation);
        newUserData = { ...newUserData, ...channelData };

        const recruiterData = await recruiterValidation(
          user,
          customerInformation
        );
        newUserData = { ...newUserData, ...recruiterData, email };
        newUserData = { ...newUserData, email };

        if (
          metadata.isAdvertisement === "true" &&
          paid &&
          status === "succeeded"
        ) {
          const advertiserData = await advertiserValidation(
            user,
            customerInformation
          );
          newUserData = { ...newUserData, ...advertiserData };
        }

        if (
          metadata.isBuyingCredits === "true" &&
          paid &&
          status === "succeeded"
        ) {
          const data = await advertisementCreditsValidation(
            user,
            customerInformation,
            metadata.credits
          );

          newUserData = { ...newUserData, ...data };
        }

        if (
          metadata.isBuyingSimulations === "true" &&
          paid &&
          status === "succeeded"
        ) {
          const data = await simulationsSprintValidation(
            user,
            customerInformation,
            metadata.simulations
          );

          newUserData = { ...newUserData, ...data };
        }

        if (metadata.isPaidEvent === "true" && paid && status === "succeeded") {
          await paidEventValidation(user, customerInformation, {
            id: metadata.eventId,
            timezone: metadata.eventTimezone,
            userTimezone: metadata.userTimezone,
          });
        }

        console.log(`***** newUserData:`, newUserData);
      }
      return res.status(HttpCodes.OK).json({ newUserData });
    } catch (err) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const advertisementCreditsValidation = async (
    user,
    customerInformation,
    credits = 0
  ) => {
    let newUserData = {};

    try {
      const totalCreditsPurchased =
        (+customerInformation.metadata.totalCreditsPurchased || 0) + +credits;

      await stripe.customers.update(customerInformation.id, {
        metadata: { totalCreditsPurchased },
      });

      await User.increment(
        {
          advertisementCredits: +credits,
        },
        {
          where: {
            email: user.email,
          },
        }
      );

      const mailOptions = {
        from: process.env.SEND_IN_BLUE_SMTP_SENDER,
        to: user.email,
        subject: LabEmails.USER_PURCHASE_ADVERTISEMENT_CREDITS.subject(credits),
        html: LabEmails.USER_PURCHASE_ADVERTISEMENT_CREDITS.body(
          user.firstName,
          credits
        ),
      };

      await smtpService().sendMailUsingSendInBlue(mailOptions);

      return newUserData;
    } catch (error) {
      console.log(error);
      return {};
    }
  };

  const simulationsSprintValidation = async (
    user,
    customerInformation,
    simulations = 0
  ) => {
    let newUserData = {};

    try {
      const totalSimulationsPurchased =
        (+customerInformation.metadata.totalSimulationsPurchased || 0) +
        +simulations;

      await stripe.customers.update(customerInformation.id, {
        metadata: { totalSimulationsPurchased },
      });

      await User.increment(
        {
          simulationSprintsAvailable: +simulations,
        },
        {
          where: {
            email: user.email,
          },
        }
      );

      const mailOptions = {
        from: process.env.SEND_IN_BLUE_SMTP_SENDER,
        to: user.email,
        subject: LabEmails.USER_PURCHARSE_SIMULATIONS_SPRINTS.subject(
          user.firstName,
          simulations
        ),
        html: LabEmails.USER_PURCHARSE_SIMULATIONS_SPRINTS.body(
          user.firstName,
          simulations
        ),
      };

      await smtpService().sendMailUsingSendInBlue(mailOptions);

      return newUserData;
    } catch (error) {
      console.log(error);
      return {};
    }
  };

  const paidEventValidation = async (user, customerInformation, event) => {
    try {
      await stripe.customers.update(customerInformation.id, {
        metadata: {
          isPaidEvent: true,
          eventTitle: event.title,
          eventId: event.id,
        },
      });

      await UserController()._addEvent(event, user.id, user);
    } catch (error) {
      console.log(error);
      return {};
    }
  };

  const advertiserValidation = async (user, customerInformation) => {
    let newUserData = {};

    try {
      await stripe.customers.update(customerInformation.id, {
        metadata: { isAdvertiser: true },
      });

      const mailOptions = {
        from: process.env.SEND_IN_BLUE_SMTP_SENDER,
        to: user.email,
        subject: LabEmails.USER_BECOME_ADVERTISER.subject(),
        html: LabEmails.USER_BECOME_ADVERTISER.body(user.firstName),
      };

      smtpService().sendMailUsingSendInBlue(mailOptions);

      newUserData["isAdvertiser"] = "TRUE";
      newUserData["advertiserSubscriptionDate"] = moment().format(
        "YYYY-MM-DD HH:mm:ss"
      );

      const update = User.update(newUserData, {
        where: {
          email: user.email,
        },
      });

      const increment = User.increment(
        {
          advertisementCredits: 40,
        },
        {
          where: { email: user.email },
        }
      );

      await Promise.all([update, increment]);

      return newUserData;
    } catch (error) {
      console.log(error);
      return {};
    }
  };

  /**
   * Function to validate premium subscription status
   * @param {*} user
   * @param {*} customerInformation
   */
  const premiumValidation = async (user, customer) => {
    let newUserData = {};
    let isSubscribed = false;
    let sendPremiumEmail = false;
    let sendRenewEmail = false;
    try {
      const subscriptionInformation = await stripe.subscriptions.list({
        customer,
        price: process.env.REACT_APP_STRIPE_YEARLY_USD_PRICE_ID,
        status: "all",
      });

      if (subscriptionInformation.data.length > 0) {
        if (subscriptionInformation.data[0].status === "active") {
          isSubscribed = true;
          newUserData["memberShip"] = "premium";
          newUserData["subscription_startdate"] = moment
            .unix(subscriptionInformation.data[0].current_period_start)
            .format("YYYY-MM-DD HH:mm:ss");
          newUserData["subscription_enddate"] = moment
            .unix(subscriptionInformation.data[0].current_period_end)
            .format("YYYY-MM-DD HH:mm:ss");

          if (user.subscription_enddate != null) {
            if (
              moment
                .unix(subscriptionInformation.data[0].current_period_end)
                .format("YYYY-MM-DD") >
                moment(user.subscription_enddate).format("YYYY-MM-DD") &&
              user.memberShip === "premium"
            ) {
              sendRenewEmail = true;
            }
          }
          if (user.memberShip === "free") {
            sendPremiumEmail = true;
          }
        }

        if(subscriptionInformation.data[0].cancel_at_period_end){
          sendRenewEmail = false;
          sendPremiumEmail = false;
        }
      } else if (
        subscriptionInformation.data[0].status === "past_due" ||
        subscriptionInformation.data[0].status === "canceled"
      ) {
        isSubscribed = true;
        newUserData["memberShip"] = "free";
        if (
          user.memberShip === "premium" &&
          subscriptionInformation.data[0].status === "past_due"
        ) {
          stripe.subscriptions.update(subscriptionInformation.data[0].id, {
            proration_behavior: "none",
            cancel_at: moment().add(1, "minutes").unix(),
          });
        }
      }

      if (!isSubscribed && user.memberShip === "premium") {
        newUserData["memberShip"] = "free";
      }

      try{
        const paymentIntents = await stripe.paymentIntents.list({
          customer,
          limit: 3,
        });

        const paymentIntent2 = await stripe.paymentIntents.confirm(
          paymentIntents.data[0].id,
        );

        console.log("////////////this-workin")

        if(paymentIntent2.status !== "succeeded"){
          sendRenewEmail = false;
          sendPremiumEmail = false;
        }
      }catch(error){
        console.log("//////////error-test-payment" + error)
      }

      await User.update(newUserData, {
        where: { id: user.id },
      });

      if (sendPremiumEmail === true) {
        try {
          const mailOptions = {
            from: process.env.SEND_IN_BLUE_SMTP_SENDER,
            to: user.email,
            subject: LabEmails.USER_BECOME_PREMIUM.subject(),
            html: LabEmails.USER_BECOME_PREMIUM.body(user),
          };
          await smtpService().sendMailUsingSendInBlue(mailOptions);
        } catch (error) {
          console.log(error);
        }
      }

      if (sendRenewEmail === true) {
        try {
          const mailOptions = {
            from: process.env.SEND_IN_BLUE_SMTP_SENDER,
            to: user.email,
            subject: LabEmails.USER_RENEW_PREMIUM.subject(),
            html: LabEmails.USER_RENEW_PREMIUM.body(user),
          };
          await smtpService().sendMailUsingSendInBlue(mailOptions);
        } catch (error) {
          console.log(error);
        }
      }

      return newUserData;
    } catch (error) {
      console.log(error);
      return { error };
    }
  };

  /**
   * Function to validate channel subscription status
   * @param {*} user
   * @param {*} customerInformation
   */
  const channelsValidation = async (user, customerInformation) => {
    let newUserData = {};
    let isSubscribed = false;
    try {
      let channelsPrices = [
        process.env.REACT_APP_STRIPE_YEARLY_USD_PRICE_CHANNELS_ID,
        process.env.REACT_APP_STRIPE_YEARLY_INR_PRICE_CHANNELS_ID,
        process.env.REACT_APP_STRIPE_YEARLY_NGN_PRICE_CHANNELS_ID,
      ];

      console.log(
        `***** CHANNELS -- channelsSubscription: ${user.channelsSubscription} ******`
      );

      for (let channelsItem of channelsPrices) {
        if (customerInformation.subscriptions.data.length > 0) {
          for (let subChannelsItem of customerInformation.subscriptions.data) {
            subChannelsItem.items.data.map(async (itemSubscription) => {
              console.log(
                `***** CHANNELS -- Price: ${itemSubscription.price.id} /`,
                channelsItem,
                ` - status: ${subChannelsItem.status} ******`
              );
              if (
                itemSubscription.price.id === channelsItem &&
                subChannelsItem.status === "active"
              ) {
                isSubscribed = true;
                newUserData["channelsSubscription"] = true;
                if (user.role !== "admin") {
                  newUserData["role"] = UserRoles.CHANNEL_ADMIN;
                }
                newUserData["channelsSubscription_startdate"] = moment
                  .unix(subChannelsItem.current_period_start)
                  .format("YYYY-MM-DD HH:mm:ss");
                newUserData["channelsSubscription_enddate"] = moment
                  .unix(subChannelsItem.current_period_end)
                  .format("YYYY-MM-DD HH:mm:ss");

                if (user.channelsSubscription === false) {
                  try {
                    const mailOptions = {
                      from: process.env.SEND_IN_BLUE_SMTP_SENDER,
                      to: user.email,
                      subject: LabEmails.USER_BECOME_CREATOR.subject(),
                      html: LabEmails.USER_BECOME_CREATOR.body(user),
                    };

                    await smtpService().sendMailUsingSendInBlue(mailOptions);
                  } catch (error) {
                    console.log(error);
                  }
                }
              } else if (
                (itemSubscription.price.id === channelsItem &&
                  subChannelsItem.status === "past_due") ||
                (itemSubscription.price.id === channelsItem &&
                  subChannelsItem.status === "canceled")
              ) {
                isSubscribed = true;
                newUserData["channelsSubscription"] = false;
                if (user.role !== "admin") {
                  newUserData["role"] = UserRoles.USER;
                }
                if (
                  user.channelsSubscription === true &&
                  subChannelsItem.status === "past_due"
                ) {
                  stripe.subscriptions.update(subChannelsItem.id, {
                    proration_behavior: "none",
                    cancel_at: moment().add(5, "minutes").unix(),
                  });
                }
              }
            });
          }
        }
      }
      if (!isSubscribed && user.channelsSubscription === true) {
        newUserData["channelsSubscription"] = false;
      }

      await User.update(newUserData, {
        where: { email: user.email },
      });

      return newUserData;
    } catch (error) {
      console.log(error);
      return {};
    }
  };

  /**
   * Function to validate recruiter subscription status
   * @param {*} user
   * @param {*} customerInformation
   */
  const recruiterValidation = async (user, customerInformation) => {
    let newUserData = {};
    let isSubscribed = false;
    try {
      let recruiterPrices = [
        process.env.REACT_APP_STRIPE_YEARLY_USD_PRICE_RECRUITER_ID,
      ];

      console.log(
        `***** RECRUITER -- recruiterSubscription: ${user.recruiterSubscription} ******`
      );

      for (let recruiterItem of recruiterPrices) {
        if (customerInformation.subscriptions.data.length > 0) {
          for (let subRecruiterItem of customerInformation.subscriptions.data) {
            subRecruiterItem.items.data.map(async (itemSubscription) => {
              console.log(
                `***** RECRUITER -- Price: ${itemSubscription.price.id} /`,
                recruiterItem,
                ` - status: ${subRecruiterItem.status} ******`
              );
              if (
                itemSubscription.price.id === recruiterItem &&
                subRecruiterItem.status === "active"
              ) {
                isSubscribed = true;
                newUserData["recruiterSubscription"] = true;
                newUserData["recruiterSubscription_startdate"] = moment
                  .unix(subRecruiterItem.current_period_start)
                  .format("YYYY-MM-DD HH:mm:ss");
                newUserData["recruiterSubscription_enddate"] = moment
                  .unix(subRecruiterItem.current_period_end)
                  .format("YYYY-MM-DD HH:mm:ss");

                if (user.recruiterSubscription === false) {
                  try {
                    const mailOptions = {
                      from: process.env.SEND_IN_BLUE_SMTP_SENDER,
                      to: user.email,
                      subject: LabEmails.USER_BECOME_RECRUITER.subject(),
                      html: LabEmails.USER_BECOME_RECRUITER.body(user),
                    };

                    await smtpService().sendMailUsingSendInBlue(mailOptions);
                  } catch (error) {
                    console.log(error);
                  }
                }
              } else if (
                (itemSubscription.price.id === recruiterItem &&
                  subRecruiterItem.status === "past_due") ||
                (itemSubscription.price.id === recruiterItem &&
                  subRecruiterItem.status === "canceled")
              ) {
                isSubscribed = true;
                if (user.role !== "admin") {
                  newUserData["role"] = UserRoles.USER;
                }
                newUserData["recruiterSubscription"] = false;
                if (
                  user.recruiterSubscription === true &&
                  subRecruiterItem.status === "past_due"
                ) {
                  stripe.subscriptions.update(subRecruiterItem.id, {
                    proration_behavior: "none",
                    cancel_at: moment().add(1, "minutes").unix(),
                  });
                }
              }
            });
          }
        }
      }

      if (!isSubscribed && user.recruiterSubscription === true) {
        newUserData["recruiterSubscription"] = false;
      }

      await User.update(newUserData, {
        where: { email: user.email },
      });

      return newUserData;
    } catch (error) {
      console.log(error);
      return {};
    }
  };

  const updateEmail = async (oldEmail, newEmail) => {
    try {
      const customers = await stripe.customers.list({
        email: oldEmail,
        limit: 1,
      });
      if (customers.data.length > 0) {
        await stripe.customers.update(customers.data[0].id, {
          email: newEmail,
        });
      }
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  /*
  const upgradeSubscription = async (req, res) => {
    //Old price
    let price = "price_1K1CJqDpOfzNo2tyT9NSKNVe";
    let customerIds = [];
    const subscriptions = await stripe.subscriptions.list({
      //Filter by customer only for tests
      //customer: "cus_Lq8yePhHUriaGh",
      price,
      limit: 200,
    });
    console.log(subscriptions);
    for (let item of subscriptions.data) {
      const subscription = await stripe.subscriptions.retrieve(item.id);
      for (let i of subscription.items.data) {
        let itemId = null;
        if (i.price.id === price) {
          itemId = i.id;
        }
        if (itemId != null) {
          // New Price
          stripe.subscriptions.update(item.id, {
            proration_behavior: "none",
            items: [
              {
                id: itemId,
                price: "price_1LG9vFDpOfzNo2tyX2nnHqmu",
              },
            ],
          });
          customerIds.push(item.customer);
          break;
        }
      }
    }
    return res.status(HttpCodes.OK).json({ customerIds });
  };*/

  return {
    createCheckoutSession,
    createPortalSession,
    getSubscription,
    webhook,
    updateEmail,
  };
};

module.exports = StripeController;
