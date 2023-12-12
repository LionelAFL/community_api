const db = require("../models");
const moment = require("moment-timezone");
const HttpCodes = require("http-codes");
const s3Service = require("../services/s3.service");
const { Op } = require("sequelize");
const { isValidURL } = require("../utils/profile");
const { LabEmails, ProfileSettings } = require("../enum");
const smtpService = require("../services/smtp.service");

const Advertisement = db.Advertisement;
const User = db.User;
const AdvertisementImpression = db.AdvertisementImpression;
const AdvertisementClick = db.AdvertisementClick;

const AdvertisementController = () => {
  const getAdvertisementsTodayByPage = async (req, res) => {
    const { page } = req.query;
    const { id: UserId } = req.token;

    const dateToday = moment().tz("America/Los_Angeles").startOf("day");

    try {
      const advertisement = await Advertisement.findAll({
        where: {
          startDate: {
            [Op.lte]: dateToday,
          },
          endDate: {
            [Op.gte]: dateToday,
          },
          page,
          status: "active",
        },
      });

      const advertisementIds = advertisement.map((ad) => ad.toJSON().id);

      const advertisementImpressions = advertisementIds.map((AdvertisementId) =>
        AdvertisementImpression.create({
          AdvertisementId,
          UserId,
        })
      );

      await Promise.all(advertisementImpressions);

      return res.status(HttpCodes.OK).json({ advertisement });
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal server error",
        error,
      });
    }
  };

  const getAdvertisementByAdvertiser = async (req, res) => {
    const { UserId } = req.params;

    try {
      const advertisements = await Advertisement.findAll({
        where: {
          UserId,
        },
        order: [["createdAt", "ASC"]],
        include: [
          {
            model: AdvertisementImpression,
            attributes: ["id"],
          },
          {
            model: AdvertisementClick,
            attributes: ["id"],
          },
        ],
      });

      return res.status(HttpCodes.OK).json({ advertisements });
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal server error",
        error,
      });
    }
  };

  const calculateCosts = (page, adDurationByDays) => {
    let totalCredits = 0;
    let adCostPerDay = 0;

    switch (page) {
      case "home":
      case "conference-library":
        if (adDurationByDays > 0) {
          if (adDurationByDays <= 7) {
            totalCredits = adDurationByDays * 7;
            adCostPerDay = 7;
          } else if (adDurationByDays >= 8 && adDurationByDays <= 14) {
            totalCredits = adDurationByDays * 6;
            adCostPerDay = 6;
          } else {
            totalCredits = adDurationByDays * 5;
            adCostPerDay = 5;
          }
        }
        break;
      case "events":
      case "project-x":
        if (adDurationByDays > 0) {
          if (adDurationByDays <= 7) {
            totalCredits = adDurationByDays * 5;
            adCostPerDay = 5;
          } else if (adDurationByDays >= 8 && adDurationByDays <= 14) {
            totalCredits = adDurationByDays * 4;
            adCostPerDay = 4;
          } else {
            totalCredits = adDurationByDays * 3;
            adCostPerDay = 3;
          }
        }
        break;
      default:
    }

    return [totalCredits, adCostPerDay];
  };

  const createAdvertisement = async (req, res) => {
    const data = req.body;
    const { id, advertisementCredits } = req.user;
    // check if user is an advertiser

    try {
      const transformedData = {
        ...data,
        UserId: id,
      };

      const [totalCredits, adCostPerDay] = calculateCosts(
        transformedData.page,
        transformedData.adDurationByDays
      );

      if (advertisementCredits < totalCredits) {
        return res
          .status(HttpCodes.ACCEPTED)
          .json({ msg: "You don't have enough credits." });
      }
      transformedData["adCostPerDay"] = adCostPerDay;

      const advertisementsCount = await Advertisement.count({
        where: {
          [Op.or]: [
            {
              datesBetweenStartDateAndEndDate: {
                [Op.contains]: [transformedData.startDate],
              },
            },
            {
              datesBetweenStartDateAndEndDate: {
                [Op.contains]: [transformedData.endDate],
              },
            },
          ],
          page: transformedData.page,
        },
      });

      const numOfAdvertisementLimitPerPage = 3;
      const isOverLimit = advertisementsCount >= numOfAdvertisementLimitPerPage;

      if (isOverLimit) {
        return res
          .status(HttpCodes.ACCEPTED)
          .json({ msg: "Chosen date slot is full." });
      }

      if (transformedData.image && !isValidURL(transformedData.image)) {
        transformedData.adContentLink =
          await s3Service().getAdvertisementImageUrl("", transformedData.image);
      }

      const result = await db.sequelize.transaction(async (t) => {
        let advertisement = await Advertisement.create(transformedData, {
          transaction: t,
        });

        advertisement = advertisement.toJSON();
        advertisement = {
          ...advertisement,
          AdvertisementImpressions: [],
          AdvertisementClicks: [],
        };

        let user = {
          ...req.user.toJSON(),
          password: null,
        };

        if (transformedData.status === "active") {
          [user] = await User.decrement(
            { advertisementCredits: totalCredits },
            {
              where: {
                id,
              },
              attributes: { exclude: ["password"] },
              returning: true,
              plain: true,
            }
          );

          user = user[0];

          const startDate = moment.tz(
            transformedData.startDate,
            "America/Los_Angeles"
          );

          const endDate = moment.tz(
            transformedData.endDate,
            "America/Los_Angeles"
          );

          const mailOptions = {
            from: process.env.SEND_IN_BLUE_SMTP_SENDER,
            to: user.email,
            subject: LabEmails.ADVERTISEMENT_CAMPAIGN_ACTIVE.subject(),
            html: LabEmails.ADVERTISEMENT_CAMPAIGN_ACTIVE.body({
              user,
              startDate: startDate.format("LL"),
              startTime: startDate.format("HH:mm"),
              endDate: endDate.format("LL"),
              endTime: endDate.format("HH:mm"),
              days: transformedData.adDurationByDays,
              creditsUsed: totalCredits,
              creditsLeft: user.advertisementCredits,
              page: transformedData.page,
              link: transformedData.advertisementLink,
            }),
            contentType: "text/html",
          };

          smtpService().sendMailUsingSendInBlue(mailOptions);
        }

        return {
          advertisement,
          user,
        };
      });

      return res.status(HttpCodes.OK).json(result);
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal server error",
        error,
      });
    }
  };

  const editAdvertisement = async (req, res) => {
    const _advertisement = req.body;
    const { AdvertisementId } = req.params;
    const { id, advertisementCredits } = req.user;

    try {
      const advertisement = await Advertisement.findOne({
        where: {
          id: AdvertisementId,
        },
      });

      if (!advertisement) {
        return res
          .status(HttpCodes.BAD_REQUEST)
          .json({ msg: "Advertisement not found." });
      }

      const [totalCredits, adCostPerDay] = calculateCosts(
        advertisement.dataValues.page,
        advertisement.dataValues.adDurationByDays
      );

      const advertisementsCount = await Advertisement.count({
        where: {
          [Op.or]: [
            {
              datesBetweenStartDateAndEndDate: {
                [Op.contains]: [advertisement.startDate],
              },
            },
            {
              datesBetweenStartDateAndEndDate: {
                [Op.contains]: [advertisement.endDate],
              },
            },
          ],
          page: advertisement.page,
          id: {
            [Op.ne]: advertisement.id,
          },
        },
      });

      const numOfAdvertisementLimitPerPage = 3;
      const isOverLimit = advertisementsCount >= numOfAdvertisementLimitPerPage;

      if (isOverLimit) {
        return res
          .status(HttpCodes.ACCEPTED)
          .json({ msg: "Chosen date slot is full." });
      }

      if (_advertisement.image && !isValidURL(_advertisement.image)) {
        _advertisement.adContentLink =
          await s3Service().getAdvertisementImageUrl("", _advertisement.image);
      }

      const result = await db.sequelize.transaction(async (t) => {
        await Advertisement.update(
          _advertisement,
          {
            where: {
              id: advertisement.id,
            },
            returning: true,
            plain: true,
          },
          {
            transaction: t,
          }
        );

        const fetchedAdvertisement = await Advertisement.findOne(
          {
            where: {
              id: advertisement.id,
            },
            include: [
              {
                model: AdvertisementImpression,
                attributes: ["id"],
              },
              {
                model: AdvertisementClick,
                attributes: ["id"],
              },
            ],
          },
          { transaction: t }
        );

        let user = {
          ...req.user.toJSON(),
          password: null,
        };

        if (_advertisement.status === "active") {

          if(_advertisement.status === "active" && advertisement.dataValues.status === "draft"){
      
            if (advertisementCredits < totalCredits) {
              return res
                .status(HttpCodes.ACCEPTED)
                .json({ msg: "You don't have enough credits." });
            }
            _advertisement["adCostPerDay"] = adCostPerDay;

            [user] = await User.decrement(
              { advertisementCredits: totalCredits },
              {
                where: {
                  id,
                },
                attributes: { exclude: ["password"] },
                returning: true,
                plain: true,
              }
            );

            user = user[0];
        }

          const isDraft = advertisement.status === "draft";

          // from draft to active
          if (isDraft) {
            const startDate = moment.tz(
              fetchedAdvertisement.toJSON().startDate,
              "America/Los_Angeles"
            );

            const endDate = moment.tz(
              fetchedAdvertisement.toJSON().endDate,
              "America/Los_Angeles"
            );

            const mailOptions = {
              from: process.env.SEND_IN_BLUE_SMTP_SENDER,
              to: user.email,
              subject: LabEmails.ADVERTISEMENT_CAMPAIGN_ACTIVE.subject(),
              html: LabEmails.ADVERTISEMENT_CAMPAIGN_ACTIVE.body({
                user,
                startDate: startDate.format("LL"),
                startTime: startDate.format("HH:mm"),
                endDate: endDate.format("LL"),
                endTime: endDate.format("HH:mm"),
                days: fetchedAdvertisement.toJSON().adDurationByDays,
                creditsUsed: totalCredits,
                creditsLeft: user.advertisementCredits,
                page: fetchedAdvertisement.toJSON().page,
                link: fetchedAdvertisement.toJSON().advertisementLink,
              }),
              contentType: "text/html",
            };

            smtpService().sendMailUsingSendInBlue(mailOptions);
          }
        }

        return {
          affectedRows: fetchedAdvertisement.toJSON(),
          user,
        };
      });

      return res.status(HttpCodes.OK).json(result);
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal server error",
        error,
      });
    }
  };

  const getAllActiveAdvertisements = async (req, res) => {
    try {
      const advertisements = await Advertisement.findAll({
        where: {
          status: "active",
        },
      });

      return res.status(HttpCodes.OK).json({ advertisements });
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal server error",
        error,
      });
    }
  };

  const getAdvertisementById = async (req, res) => {
    const { advertisementId } = req.params;

    try {
      const advertisement = await Advertisement.findOne({
        where: {
          id: advertisementId,
        },
      });

      if (!advertisement) {
        return res.status(HttpCodes.NOT_FOUND).json({
          msg: "Advertisement not found.",
          error,
        });
      }

      return res.status(HttpCodes.OK).json({ advertisement });
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal server error",
        error,
      });
    }
  };

  const createAdvertisementClick = async (req, res) => {
    const { id } = req.token;
    const { advertisementId } = req.body;

    try {
      await AdvertisementClick.create({
        UserId: id,
        AdvertisementId: advertisementId,
      });

      return res.status(HttpCodes.OK).json({});
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal server error",
        error,
      });
    }
  };

  const changeAdvertisementStatusToEndedWhenCampaignEnds = async () => {
    try {
      const date = moment()
        .tz("America/Los_Angeles")
        .subtract(1, "day")
        .endOf("day");

      const advertisements = await Advertisement.findAll({
        where: {
          status: "active",
          endDate: date.format(),
        },
        include: [
          {
            model: User,
          },
          {
            model: AdvertisementImpression,
            separate: true,
            include: [
              {
                model: User,
              },
            ],
          },
          {
            model: AdvertisementClick,
            separate: true,
            include: [
              {
                model: User,
              },
            ],
          },
        ],
      });

      const changeStatus = advertisements.map((advertisement) => {
        const _advertisement = advertisement.toJSON();

        const user = _advertisement.User;
        const impressions = _advertisement.AdvertisementImpressions;
        const clicks = _advertisement.AdvertisementClicks;

        const mailOptions = {
          from: process.env.SEND_IN_BLUE_SMTP_SENDER,
          to: user.email,
          subject: LabEmails.ADVERTISEMENT_CAMPAIGN_END.subject(),
          html: LabEmails.ADVERTISEMENT_CAMPAIGN_END.body(
            user.firstName,
            impressions.length,
            clicks.length
          ),
          contentType: "text/html",
        };

        smtpService().sendMailUsingSendInBlue(mailOptions);

        return Advertisement.update(
          { status: "ended" },
          {
            where: {
              id: _advertisement.id,
            },
          }
        );
      });

      await Promise.all(changeStatus);

      // advertisements.forEach((advertisement) => {
      // const _advertisement = advertisement.toJSON();
      // const impressions = _advertisement.AdvertisementImpressions;
      // const clicks = _advertisement.AdvertisementClicks;

      // const jobLevelsImpression = {};
      // const jobLevelsClicks = {};

      // const sizeOfOrganizationImpression = {};
      // const sizeOfOrganizationClicks = {};

      // const countriesImpression = {};
      // const countriesClicks = {};

      // impressions.forEach((impression) => {
      //   const user = impression.User;

      //   if (jobLevelsImpression.hasOwnProperty(user.recentJobLevel)) {
      //     jobLevelsImpression[user.recentJobLevel] =
      //       jobLevelsImpression[user.recentJobLevel] + 1;
      //   } else {
      //     jobLevelsImpression[user.recentJobLevel] = 1;
      //   }

      //   if (
      //     sizeOfOrganizationImpression.hasOwnProperty(user.sizeOfOrganization)
      //   ) {
      //     sizeOfOrganizationImpression[user.sizeOfOrganization] =
      //       sizeOfOrganizationImpression[user.sizeOfOrganization] + 1;
      //   } else {
      //     sizeOfOrganizationImpression[user.sizeOfOrganization] = 1;
      //   }

      //   const country = ProfileSettings.COUNTRIES.find(
      //     (c) => c.value === user.location
      //   );

      //   if (sizeOfOrganizationImpression.hasOwnProperty(country.text)) {
      //     countriesImpression[country.text] =
      //       countriesImpression[country.text] + 1;
      //   } else {
      //     countriesImpression[country.text] = 1;
      //   }
      // });

      // clicks.forEach((click) => {
      //   const user = click.User;

      //   if (user.completed) {
      //     if (jobLevelsImpression.hasOwnProperty(user.recentJobLevel)) {
      //       jobLevelsClicks[user.recentJobLevel] =
      //         jobLevelsClicks[user.recentJobLevel] + 1;
      //     } else {
      //       jobLevelsClicks[user.recentJobLevel] = 1;
      //     }

      //     if (
      //       sizeOfOrganizationImpression.hasOwnProperty(
      //         user.sizeOfOrganization
      //       )
      //     ) {
      //       sizeOfOrganizationClicks[user.sizeOfOrganization] =
      //         sizeOfOrganizationClicks[user.sizeOfOrganization] + 1;
      //     } else {
      //       sizeOfOrganizationClicks[user.sizeOfOrganization] = 1;
      //     }

      //     const country = ProfileSettings.COUNTRIES.find(
      //       (c) => c.value === user.location
      //     );

      //     if (sizeOfOrganizationImpression.hasOwnProperty(country.text)) {
      //       countriesClicks[country.text] = countriesClicks[country.text] + 1;
      //     } else {
      //       countriesClicks[country.text] = 1;
      //     }
      //   }
      // });
      // });
    } catch (error) {
      console.log(error);
    }
  };

  const sendEmailWhenCampaignStarts = async () => {
    const date = moment().tz("America/Los_Angeles").startOf("day");

    try {
      const advertisements = await Advertisement.findAll({
        where: {
          status: "active",
          startDate: date.format(),
        },
        include: [
          {
            model: User,
          },
        ],
      });

      advertisements.forEach((advertisement) => {
        const user = advertisement.User;

        const mailOptions = {
          from: process.env.SEND_IN_BLUE_SMTP_SENDER,
          to: user.email,
          subject: LabEmails.ADVERTISEMENT_CAMPAIGN_START.subject(),
          html: LabEmails.ADVERTISEMENT_CAMPAIGN_START.body(user),
          contentType: "text/html",
        };

        smtpService().sendMailUsingSendInBlue(mailOptions);
      });
    } catch (error) {
      console.log(error);
    }
  };

  return {
    getAdvertisementsTodayByPage,
    getAdvertisementByAdvertiser,
    createAdvertisement,
    getAdvertisementById,
    getAllActiveAdvertisements,
    editAdvertisement,
    createAdvertisementClick,
    changeAdvertisementStatusToEndedWhenCampaignEnds,
    sendEmailWhenCampaignStarts,
  };
};

module.exports = AdvertisementController;
