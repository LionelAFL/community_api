const db = require("../models");
const profileUtils = require("../utils/profile");
const HttpCodes = require("http-codes");
const s3Service = require("../services/s3.service");
const Sequelize = require("sequelize");
const smtpService = require("../services/smtp.service");
const moment = require("moment-timezone");
const TimeZoneList = require("../enum/TimeZoneList");
const { readExcelFile, progressLog } = require("../utils/excel");
const { USER_ROLE, EmailContent } = require("../enum");
const bcryptService = require("../services/bcrypt.service");
const {
  getEventPeriod,
  convertToLocalTime,
  convertToCertainTime,
} = require("../utils/format");
const omit = require("lodash/omit");
const { AWSConfig } = require("../enum");
const FroalaEditor = require("wysiwyg-editor-node-sdk/lib/froalaEditor");
const { isEmpty, compact } = require("lodash");
const { LabEmails } = require("../enum");
const { googleCalendar, yahooCalendar } = require("../utils/generateCalendars");
const StripeController = require("./StripeController");
const {
  ACCEPT_USER_APPLY_PARTNER_BUSSINESS,
  REJECT_USER_APPLY_PARTNER_BUSSINESS,
} = require("../enum/Emails");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SK_KEY, {
  maxNetworkRetries: 3,
});

const { literal, Op, QueryTypes } = Sequelize;
const User = db.User;
const Event = db.Event;
const AnnualConference = db.AnnualConference;
const Bonfire = db.Bonfire;
const Channel = db.Channel;

const UserController = () => {
  const getUser = async (req, res) => {
    const { id } = req.token;

    if (id) {
      try {
        const user = await User.findOne({
          where: {
            id,
          },
        });

        if (!user) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Bad Request: User not found" });
        }

        const learningBadgesHours = await getLearningBadgesHoursByUser(
          req.user.id
        );

        return res
          .status(HttpCodes.OK)
          .json({ user: { ...user.dataValues, learningBadgesHours } });
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    } else {
      return res
        .status(HttpCodes.BAD_REQUEST)
        .json({ msg: "Bad Request: user id is wrong" });
    }
  };

  const getUserById = async (req, res) => {
    const { id } = req.params;

    if (id) {
      try {
        const user = await User.findOne({
          attributes: [
            "id",
            "email",
            "memberShip",
            "subscription_startdate",
            "subscription_enddate",
            "external_payment",
            "councilMember",
          ],
          where: {
            id,
          },
        });

        if (!user) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Bad Request: User not found" });
        }

        return res.status(HttpCodes.OK).json({ user });
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    } else {
      return res
        .status(HttpCodes.BAD_REQUEST)
        .json({ msg: "Bad Request: user id is wrong" });
    }
  };

  const updateUser = async (req, res) => {
    let user = req.body;
    const { id } = req.token;

    if (user) {
      try {
        const prevUser = await User.findOne({
          where: {
            id,
          },
        });
        if (!prevUser) {
          return res
            .status(HttpCodes.BAD_REQUEST)
            .json({ msg: "Bad Request: data is wrong" });
        }

        // in case of email update
        if (user.email.toLowerCase() !== prevUser.email) {
          const existing = await User.findOne({
            where: {
              email: user.email.toLowerCase(),
            },
          });

          if (existing) {
            return res
              .status(HttpCodes.BAD_REQUEST)
              .json({ msg: "This email was used by someone." });
          }
        }

        // in case of profile picture
        if (user.imageStr) {
          const imageUrl = await s3Service().getUserImageUrl(
            user.img,
            user.imageStr
          );
          user.img = imageUrl;
        }
        user.percentOfCompletion = profileUtils.getProfileCompletion(user);
        user.completed = user.percentOfCompletion === 100;
        user.abbrName = `${(user.firstName || "").slice(0, 1).toUpperCase()}${(
          user.lastName || ""
        )
          .slice(0, 1)
          .toUpperCase()}`;

        const [numberOfAffectedRows, affectedRows] = await User.update(
          {
            ...user,
            email: user.email.toLowerCase(),
          },
          {
            where: { id },
            returning: true,
            plain: true,
          }
        );

        await StripeController().updateEmail(
          prevUser.email,
          user.email.toLowerCase()
        );

        return res
          .status(HttpCodes.OK)
          .json({ numberOfAffectedRows, affectedRows });
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    } else {
      return res
        .status(HttpCodes.BAD_REQUEST)
        .json({ msg: "Bad Request: data is wrong" });
    }
  };

  const updateUserAdmin = async (req, res) => {
    let user = req.body;
    const { id } = req.params;

    if (user && id) {
      try {
        const prevUser = await User.findOne({
          where: {
            id: parseInt(id),
          },
        });
        if (!prevUser) {
          return res
            .status(HttpCodes.BAD_REQUEST)
            .json({ msg: "Bad Request: data is wrong" });
        }
        const [numberOfAffectedRows, affectedRows] = await User.update(
          {
            ...user,
          },
          {
            where: { id },
            returning: true,
            plain: true,
          }
        );

        return res
          .status(HttpCodes.OK)
          .json({ numberOfAffectedRows, affectedRows });
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    } else {
      return res
        .status(HttpCodes.BAD_REQUEST)
        .json({ msg: "Bad Request: data is wrong" });
    }
  };

  const upgradePlan = async (req, res) => {
    let data = req.body;
    const { id } = req.token;

    if (data && data.memberShip) {
      try {
        const [numberOfAffectedRows, affectedRows] = await User.update(
          { memberShip: data.memberShip },
          {
            where: { id },
            returning: true,
            plain: true,
          }
        );

        return res
          .status(HttpCodes.OK)
          .json({ numberOfAffectedRows, affectedRows });
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    } else {
      return res
        .status(HttpCodes.BAD_REQUEST)
        .json({ msg: "Bad Request: data is wrong" });
    }
  };

  const getEventDescription = (rawData) => {
    if (rawData) {
      if (rawData.blocks) {
        return rawData.blocks.map((item) => item.text).join(`/n`);
      }
    }
    return "";
  };

  const generateAttendEmail = async (user, tz, event, 
    // newUrl
    ) => {
    let userTimezone = TimeZoneList.find(
      (item) => item.value === tz || item.text === tz
    );

    if (!userTimezone) {
      userTimezone = tz;
    } else {
      userTimezone = userTimezone.utc[0];
    }
    try {
      const calendarInvite = event.startAndEndTimes.map((time, index) => {
        try {
          let startTime = convertToLocalTime(
            time.startTime,
            event.timezone,
            userTimezone
          );
          let endTime = convertToLocalTime(
            time.endTime,
            event.timezone,
            userTimezone
          );

          if (
            userTimezone === "America/Los_Angeles" &&
            moment(endTime).month() >= 2 &&
            moment(endTime).month() <= 10
          ) {
            userTimezone = "America/phoenix";
          }

          return smtpService().generateCalendarInvite(
            startTime,
            endTime,
            event.title,
            `${getEventDescription(event.description)} Link to connect: ${event.link}`,
            "",
            // event.location,
            `${process.env.DOMAIN_URL}${event.id}`,
            event.organizer,
            process.env.SEND_IN_BLUE_SMTP_SENDER,
            userTimezone
          );
        } catch (error) {
          console.log(error);
        }
      });

      const mailOptions = {
        from: process.env.SEND_IN_BLUE_SMTP_SENDER,
        to: user.email,
        subject: `CONFIRMATION – You Are Attending: "${event.title}"`,
        html: EmailContent.EVENT_ATTEND_EMAIL(user, event, getEventPeriod,
          // newUrl
        ),
        contentType: "text/calendar",
      };

      let icsContent = calendarInvite.map((calendar) => {
        return calendar.toString();
      });

      icsContent = icsContent.map((content) => {
        content = content.replace(
          "BEGIN:VEVENT",
          `METHOD:REQUEST\r\nBEGIN:VEVENT`
        );

        return content;
      });

      if (!isEmpty(calendarInvite)) {
        let newArray = calendarInvite.map((calendar, index) => {
          return {
            filename:
              event.startAndEndTimes.length > 1
                ? `Day-${index + 1}-invite.ics`
                : "invite.ics",
            content: icsContent[index],
            contentType: "application/ics; charset=UTF-8; method=REQUEST",
            contentDisposition: "inline",
          };
        });
        mailOptions["attachments"] = [...newArray, 
          // {
          //   filename: "Confirmation-event1.png",
          //   path: newUrl,
          // },
        ]
      }else{

      }

      let sentResult = null;
      try {
        sentResult = await smtpService().sendMailUsingSendInBlue(mailOptions);
      } catch (err) {
        console.log(err);
      }

      return sentResult;
    } catch (error) {
      console.log(error);
    }
  };

  const addEvent = async (req, res) => {
    let event = req.body;
    // let newUrl;
    const { id } = req.token;
    const { user: prevUser } = req;

    try {

      // if (event.imageEmail) {
      //   newUrl = await s3Service().getEventEmailUrl(
      //     "",
      //     event.imageEmail
      //   );
      // }

      const { numberOfAffectedRows, affectedRows } = await _addEvent(
        event,
        id,
        prevUser,
        // newUrl,
      );

      return res
        .status(HttpCodes.OK)
        .json({ numberOfAffectedRows, affectedRows });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const _addEvent = async (event, id, prevUser,
    // newUrl
    ) => {

    try {
      const [rows, user] = await User.update(
        {
          events: Sequelize.fn(
            "array_append",
            Sequelize.col("events"),
            event.id
          ),
          attended: {
            ...prevUser.attended,
            [event.id]: moment().format(),
          },
        },
        {
          where: { id },
          returning: true,
          plain: true,
        }
      );

      // update users and status field from Events model
      const prevEvent = await Event.findOne({ where: { id: event.id } });
      const [numberOfAffectedRows, affectedRows] = await Event.update(
        {
          users: Sequelize.fn("array_append", Sequelize.col("users"), id),
          status: { ...prevEvent.status, [id]: "going" },
        },
        {
          where: { id: event.id },
          returning: true,
          plain: true,
        }
      );

      const affectedRows_ = {
        ...affectedRows.dataValues,
        startAndEndTimes: compact(affectedRows.dataValues.startAndEndTimes),
      };

      generateAttendEmail(user, event.userTimezone, affectedRows_, 
        // newUrl
        );

      return { numberOfAffectedRows, affectedRows };
    } catch (error) {
      console.log(error);
    }
  };

  const removeEvent = async (req, res) => {
    let event = req.body;
    const { id } = req.token;

    try {
      const prevUser = await User.findOne({
        where: { id },
      });
      await User.update(
        {
          events: Sequelize.fn(
            "array_remove",
            Sequelize.col("events"),
            event.id
          ),
          attended: omit(prevUser.attended, event.id),
        },
        {
          where: { id },
          returning: true,
          plain: true,
        }
      );

      const prevEvent = await Event.findOne({ where: { id: event.id } });
      const [numberOfAffectedRows, affectedRows] = await Event.update(
        {
          users: Sequelize.fn("array_remove", Sequelize.col("users"), id),
          status: omit(prevEvent.status, id),
        },
        {
          where: { id: event.id },
          returning: true,
          plain: true,
          raw: true,
        }
      );

      const affectedRows_ = {
        ...affectedRows,
        startAndEndTimes: compact(affectedRows.startAndEndTimes),
      };

      return res
        .status(HttpCodes.OK)
        .json({ numberOfAffectedRows, affectedRows: affectedRows_ });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const getMyEvents = async (req, res) => {
    const { id } = req.token;

    try {
      let query = `
        SELECT public."Events".*
        FROM public."Events" JOIN public."Users" ON public."Events".id = ANY (public."Users".events) 
        WHERE public."Users".id = ${id} AND public."Events".level = 0 ORDER BY "startDate";
      `;
      const results = await db.sequelize.query(query, {
        type: QueryTypes.SELECT,
      });

      return res.status(HttpCodes.OK).json({
        myEvents: results.map((item) => ({
          ...item,
          credit: null,
        })),
      });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const importUsers = async (fileName, startDate, endDate) => {
    const users = readExcelFile(fileName);

    try {
      for (let index = 0; index < users.length; index++) {
        const username = users[index].first_name
          ? users[index].first_name.split(" ")
          : [""];
        let userInfo = {
          email: users[index].email.toLowerCase(),
          password: bcryptService().password("12345678"),
          firstName: username[0],
          lastName: username.length > 1 ? username[1] : "",
          role: USER_ROLE.USER,
          subscription_startdate: startDate,
          subscription_enddate: endDate,
          external_payment: 1,
          memberShip: "premium",
        };

        userInfo.percentOfCompletion =
          profileUtils.getProfileCompletion(userInfo);
        userInfo.completed = userInfo.percentOfCompletion === 100;
        userInfo.abbrName = `${(userInfo.firstName || "")
          .slice(0, 1)
          .toUpperCase()}${(userInfo.lastName || "")
          .slice(0, 1)
          .toUpperCase()}`;

        await User.create(userInfo);

        progressLog(`${index + 1} / ${users.length} created.`);
      }

      console.log("Done.");
    } catch (error) {
      console.log(error);
    }
  };

  const deleteUser = async (req, res) => {

      const { id, email } = req.user.dataValues;

      try {

        // const customers = await stripe.customers.list({
        //   email: email,
        //   limit: 1,
        // });

        // if(customers.data.id !== undefined && customers.data.id !== null){

        //   const customerInformation = await stripe.customers.retrieve(customers.data.id);

        //   console.log("/////////////////////////////////////////////")

        //   console.log(customerInformation)

        //   const subscriptionInformation = await stripe.subscriptions.list({
        //     customer: customers.data.id,
        //     price: process.env.REACT_APP_STRIPE_YEARLY_USD_PRICE_ID,
        //     status: "all",
        //   });

        //   if(subscriptionInformation.data[0].id !== undefined && subscriptionInformation.data[0].id !== null){
        //     stripe.subscriptions.update(subscriptionInformation.data[0].id, {
        //       proration_behavior: "none",
        //       cancel_at: moment().add(1, "minutes").unix(),
        //     });
        //   }

        //   if (customerInformation.subscriptions.data.length > 0) {
        //     for (let subChannelsItem of customerInformation.subscriptions.data) {
        //       stripe.subscriptions.update(subChannelsItem.id, {
        //         proration_behavior: "none",
        //         cancel_at: moment().add(5, "minutes").unix(),
        //       });
        //     }
        //   }
        // }

        // await User.destroy({where: {id: id,email: email}})

        return res.status(HttpCodes.OK).json({})

      } catch (error) {
          console.log(error);
          return res
              .status(HttpCodes.INTERNAL_SERVER_ERROR)
              .json({ msg: "Internal server error" });
      }
  }

  const getAll = async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: {
          include: [
            [
              literal(`(
              select
                    SUM(main_data.duration) / 60 as hours
                from
                    (
                    select
                        'podcastseries' as element,
                        cast(coalesce(ps."durationLearningBadges", '0') as float) as duration,
                        ps.id,
                        psd.key,
                        psd.value
                    from
                        "PodcastSeries" ps
                    join jsonb_each_text(ps.viewed) psd on
                        true
                union
                    select
                        'conference_library' as element,
                        cast(coalesce(cl.duration, '0') as float) as duration,
                        cl.id,
                        cld.key,
                        cld.value
                    from
                        "ConferenceLibraries" cl
                    join jsonb_each_text(cl.viewed) cld on
                        true
                union
                    select
                        'library' as element,
                        cast(coalesce(l.duration, '0') as float) as duration,
                        l.id,
                        ld.key,
                        ld.value
                    from
                        "Libraries" l
                    join jsonb_each_text(l.viewed) ld on
                        true
                union
                    select
                        'podcast' as element,
                        cast(coalesce(p.duration, '0') as float) as duration,
                        p.id,
                        pd.key,
                        pd.value
                    from
                        "Podcasts" p
                    join jsonb_each_text(p.viewed) pd on
                        true
                ) main_data
                inner join "Users" u on
                    main_data.key = cast(u.id as varchar)
                where
                    u.id="User".id and
                    main_data.value = 'mark'
                group by
                    u.id
                order by
                    hours desc
              )`),
              "learningBadgesHours",
            ],
          ],
        },
      }).catch(function(error) {
        //respuesta de error al crear usuario en base de datos
        console.log(error)
      });

      if (!users) {
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Bad Request: Users not found" });
      }

      return res.status(HttpCodes.OK).json({ users });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };
  /**
   * This function generate and send invitation email
   * @param {*} req
   * @param {*} res
   * @returns
   */
  const generateInvitationEmail = async (req, res) => {
    const { user } = req;
    let { email } = req.body;
    try {
      email = email.split(",");

      let listPromises = [];

      email.map((item) => {
        const mailOptions = {
          from: process.env.SEND_IN_BLUE_SMTP_SENDER,
          to: item.trim(),
          subject: `${user.firstName} thought you’d like to join the best platform for HR pros`,
          html: EmailContent.INVITE_EMAIL(user),
          contentType: "text/html",
        };
        listPromises.push(smtpService().sendMailUsingSendInBlue(mailOptions));
      });

      await Promise.all(listPromises);

      return res.status(HttpCodes.OK).send();
    } catch (err) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const searchUser = async (req, res) => {
    const {
      search,
      location,
      recentJobLevel,
      titleProfessions,
      topicsOfInterest,
      sizeOfOrganization,
      offset,
      limit,
      typeUser,
      channel,
      userAdmin
    } = req.query;

    const where = {};

    if (search || titleProfessions) {
      where[Op.or] = [
        {
          firstName: {
            [Op.iLike]: `%${search}%`,
          },
        },
        {
          email: {
            [Op.iLike]: `%${search}%`,
          },
        },
        {
          lastName: {
            [Op.iLike]: `%${search}%`,
          },
        },
        {
          company: {
            [Op.iLike]: `%${search}%`,
          },
        },
        {
          titleProfessions: {
            [Op.iLike]: search ? `%${search}%` : `%${titleProfessions}%`,
          },
        },
        {
          city: {
            [Op.iLike]: `%${search}%`,
          },
        },
        {
          location: {
            [Op.iLike]: search ? `%${search}%` : `%${location}%`,
          },
        },
        {
          topicsOfInterest: {
            [Op.overlap]: search ? [`${search}`] : topicsOfInterest,
          },
        },
        {
          recentJobLevel: {
            [Op.iLike]: search ? `%${search}%` : `%${recentJobLevel}%`,
          },
        },
        {
          sizeOfOrganization: {
            [Op.iLike]: search ? `%${search}%` : `%${sizeOfOrganization}%`,
          },
        },
      ];
    }

    if(channel){
      where[Op.and] = []
      if(search !== undefined){
        where[Op.or] = []
        where[Op.or] = [
          {
            firstName: {
              [Op.iLike]: `%${search}%`,
            },
          },
          {
            email: {
              [Op.iLike]: `%${search}%`,
            },
          },
          {
            lastName: {
              [Op.iLike]: `%${search}%`,
            },
          },
        ]
      }
      if(location !== undefined){
        where[Op.and] = [
          ...where[Op.and],
          {
            location: {
              [Op.like]: { [Op.any]: location },
            },
          },
        ]
      }
      if(sizeOfOrganization !== undefined){
        where[Op.and] = [
          ...where[Op.and],
          {
            sizeOfOrganization: {
              [Op.like]: { [Op.any]: sizeOfOrganization },
            },
          },
        ]
      }
      if(recentJobLevel !== undefined){
        where[Op.and] = [
          ...where[Op.and],
          {
            recentJobLevel: {
              [Op.like]: { [Op.any]: recentJobLevel },
            },
          },
        ]
      }
      if(topicsOfInterest !== undefined){
        where[Op.and] = [
          ...where[Op.and],
          {
            topicsOfInterest: {
              [Op.overlap]: [topicsOfInterest],
            },
          },
        ]
      }
    }

    if (!titleProfessions && !channel && !userAdmin) {
      for (const key in req.query) {
        if (
          key !== "search" &&
          key !== "titleProfessions" &&
          key !== "limit" &&
          key !== "offset" &&
          key !== "typeUser"
        ) {
          where[Op.and] = where[Op.and]
            ? [
                ...where[Op.and],
                {
                  [key]: {
                    [Op.in]: JSON.parse(req.query[key]),
                  },
                },
              ]
            : [
                {
                  [key]: {
                    [Op.in]: JSON.parse(req.query[key]),
                  },
                },
              ];
        } else if (typeUser && typeUser === "online") {
          where[Op.and] = where[Op.and]
            ? [
                ...where[Op.and],
                {
                  isOnline: true,
                },
              ]
            : [
                {
                  isOnline: true,
                },
              ];
        }
      }
    }

    let limiters = {
      offset: offset || 0,
      limit: limit || 50,
    }

    if(userAdmin){
      limiters = {}
    }

    try {
      const count = await User.count({
        where,
      });
      const users = await User.findAll({
        where,
        order: [[Sequelize.fn("RANDOM")]],
        ...limiters
      });

      return res.status(HttpCodes.OK).json({ users, count });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const setAttendedToConference = async (req, res) => {
    const { user } = req;
    try {
      const [numberOfAffectedRows, affectedRows] = await User.update(
        {
          attendedToConference: user.attendedToConference === 0 ? 1 : 0,
        },
        {
          where: { id: user.id },
          returning: true,
          plain: true,
        }
      );

      return res.status(HttpCodes.OK).json({ user: affectedRows });
    } catch (error) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const addSession = async (req, res) => {
    const { user } = req;
    const { id } = req.params;

    try {
      const query = `
      SELECT public."AnnualConferences"."startTime" FROM public."Users" 
      LEFT JOIN public."AnnualConferences" ON public."AnnualConferences".id = ANY (public."Users".sessions::int[]) 
      WHERE public."Users"."id" = ${user.id}
    `;

      const userSessions = await db.sequelize.query(query, {
        type: QueryTypes.SELECT,
      });

      const sessionToSchedule = await AnnualConference.findOne({
        where: { id },
        attributes: ["startTime"],
      });

      const { dataValues: userToJoin } = await User.findOne({
        where: { id: user.id },
      });

      for (const session of userSessions) {
        if (session.startTime === sessionToSchedule.dataValues.startTime) {
          return res.status(HttpCodes.BAD_REQUEST).json({
            msg: "You already have another session scheduled at the same time and date",
          });
        }
      }

      if (userToJoin.addedFirstSession) {
        await User.increment(
          {
            pointsConferenceLeaderboard: +20,
          },
          {
            where: { id: user.id },
          }
        );
      } else {
        await User.increment(
          {
            pointsConferenceLeaderboard: +50,
          },
          {
            where: { id: user.id },
          }
        );
      }
      const [numberOfAffectedRows, affectedRows] = await User.update(
        {
          sessions: Sequelize.fn("array_append", Sequelize.col("sessions"), id),
          addedFirstSession: true,
        },
        {
          where: { id: user.id },
          returning: true,
          plain: true,
        }
      );

      return res.status(HttpCodes.OK).json({ user: affectedRows });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const sessionUserJoined = async (req, res) => {
    const { user } = req;
    const { id } = req.params;

    try {
      const session = await AnnualConference.findOne({
        where: {
          id,
        },
      });

      let totalUsers;

      if (session.type === "Roundtable") {
        totalUsers = await User.findAndCountAll({
          where: {
            sessionsJoined: {
              [Op.overlap]: [id],
            },
          },
          offset: 10,
          limit: 2,
        });
      }

      if (totalUsers && totalUsers?.count >= 30) {
        return res.status(HttpCodes.BAD_REQUEST).json({
          msg: "This session has reached the limit of users that can join",
        });
      }

      const [numberOfAffectedRows, affectedRows] = await User.update(
        {
          sessionsJoined: Sequelize.fn(
            "array_append",
            Sequelize.col("sessionsJoined"),
            id
          ),
          addedFirstSession: true,
        },
        {
          where: { id: user.id },
          returning: true,
          plain: true,
        }
      );

      return res.status(HttpCodes.OK).json({ user: affectedRows });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const removeSession = async (req, res) => {
    const { user } = req;
    const { id } = req.params;

    try {
      const [numberOfAffectedRows, affectedRows] = await User.update(
        {
          sessions: Sequelize.fn("array_remove", Sequelize.col("sessions"), id),
        },
        {
          where: { id: user.id },
          returning: true,
          plain: true,
        }
      );

      return res.status(HttpCodes.OK).json({ user: affectedRows });
    } catch (error) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const getSessionUsers = async (req, res) => {
    try {
      const users = await User.findAll({
        where: {
          attendedToConference: 1,
        },
      });

      return res.status(HttpCodes.OK).json({ users });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const removeSessionUser = async (req, res) => {
    const { id } = req.params;

    try {
      const [numberOfAffectedRows, affectedRows] = await User.update(
        {
          attendedToConference: 0,
          sessions: [],
        },
        {
          where: { id },
          returning: true,
          plain: true,
        }
      );

      return res
        .status(HttpCodes.OK)
        .json({ numberOfAffectedRows, affectedRows });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const addBonfire = async (req, res) => {
    const { user } = req;
    const { id } = req.params;
    const { userTimezone } = req.body;

    try {
      const query = `
      SELECT public."Bonfires"."startTime" FROM public."Users" 
      LEFT JOIN public."Bonfires" ON public."Bonfires".id = ANY (public."Users".bonfires::int[]) 
      WHERE public."Users"."id" = ${user.id}
    `;

      const userBonfires = await db.sequelize.query(query, {
        type: QueryTypes.SELECT,
      });

      const { dataValues: bonfireToJoin } = await Bonfire.findOne({
        where: { id },
      });

      const { dataValues: bonfireCreator } = await User.findOne({
        where: {
          id: bonfireToJoin.bonfireCreator,
        },
      });

      for (const bonfire of userBonfires) {
        if (bonfire.startTime === bonfireToJoin.startTime) {
          return res.status(HttpCodes.BAD_REQUEST).json({
            msg: "You already joined another bonfire at the same time and date",
          });
        }
      }
      const [numberOfAffectedRows, affectedRows] = await User.update(
        {
          bonfires: Sequelize.fn("array_append", Sequelize.col("bonfires"), id),
        },
        {
          where: { id: user.id },
          returning: true,
          plain: true,
        }
      );

      await Bonfire.update(
        {
          joinedUsers: Sequelize.fn(
            "array_append",
            Sequelize.col("joinedUsers"),
            affectedRows.dataValues.id
          ),
        },
        {
          where: { id },
          returning: true,
          plain: true,
        }
      );

      await User.increment(
        {
          pointsConferenceLeaderboard: +200,
        },
        {
          where: { id: user.id },
        }
      );

      const targetBonfireDate = convertToLocalTime(
        bonfireToJoin.startTime,
        bonfireToJoin.timezone,
        userTimezone
      );

      const convertedEndTime = convertToLocalTime(
        bonfireToJoin.endTime,
        bonfireToJoin.timezone,
        userTimezone
      );

      await Promise.resolve(
        (() => {
          const googleLink = googleCalendar(
            bonfireToJoin,
            bonfireToJoin.timezone,
            userTimezone
          );
          const yahooLink = yahooCalendar(
            bonfireToJoin,
            bonfireToJoin.timezone,
            userTimezone
          );

          const calendarInvite = smtpService()
            .generateCalendarInvite(
              targetBonfireDate,
              convertedEndTime,
              bonfireToJoin.title,
              bonfireToJoin.description,
              "",
              bonfireToJoin.link,
              bonfireCreator.firstName,
              process.env.SEND_IN_BLUE_SMTP_SENDER,
              userTimezone
            )
            .toString();

          let icsContent = calendarInvite.replace(
            "BEGIN:VEVENT",
            `METHOD:REQUEST\r\nBEGIN:VEVENT`
          );

          let mailOptions = {
            from: process.env.SEND_IN_BLUE_SMTP_SENDER,
            to: affectedRows.dataValues.email,
            subject: LabEmails.BONFIRE_JOINING.subject(
              affectedRows.dataValues.firstName
            ),
            html: LabEmails.BONFIRE_JOINING.body(
              affectedRows.dataValues.firstName,
              bonfireToJoin,
              bonfireCreator,
              targetBonfireDate.format("MMM DD"),
              targetBonfireDate.format("h:mm a"),
              bonfireToJoin.link,
              userTimezone
            ),
            contentType: "text/calendar",
          };

          mailOptions["attachments"] = [
            {
              filename: "invite.ics",
              content: icsContent,
              contentType: "application/ics; charset=UTF-8; method=REQUEST",
              contentDisposition: "inline",
            },
          ];
          console.log("***** mailOptions ", mailOptions);

          return smtpService().sendMailUsingSendInBlue(mailOptions);
        })()
      );

      return res.status(HttpCodes.OK).json({ user: affectedRows });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const removeBonfire = async (req, res) => {
    const { user } = req;
    const { id } = req.params;

    try {
      const [numberOfAffectedRows, affectedRows] = await User.update(
        {
          bonfires: Sequelize.fn("array_remove", Sequelize.col("bonfires"), id),
        },
        {
          where: { id: user.id },
          returning: true,
          plain: true,
        }
      );

      await Bonfire.update(
        {
          joinedUsers: Sequelize.fn(
            "array_remove",
            Sequelize.col("joinedUsers"),
            affectedRows.dataValues.id
          ),
        },
        {
          where: { id },
          returning: true,
          plain: true,
        }
      );

      return res.status(HttpCodes.OK).json({ user: affectedRows });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const uploadResume = async (req, res, next) => {
    const { user } = req;

    try {
      const { resume } = req.files || {};
      if (resume) {
        const uploadRes = await s3Service().uploadResume(resume, user);
        const [rows, updatedUser] = await User.update(
          {
            resumeFileName: resume.name,
            resumeUrl: uploadRes.Location,
          },
          {
            where: { id: user.id },
            returning: true,
            plain: true,
          }
        );
        res.status(HttpCodes.OK).json({ user: updatedUser });
      }

      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "File not found!" });
    } catch (error) {
      next(error);
    }
  };

  const deleteResume = async (req, res, next) => {
    const { user } = req;

    try {
      if (user.resumeFileName) {
        await s3Service().deleteResume(user.resumeUrl);
        const [rows, updatedUser] = await User.update(
          {
            resumeFileName: "",
            resumeUrl: "",
          },
          {
            where: { id: user.id },
            returning: true,
            plain: true,
          }
        );
        res.status(HttpCodes.OK).json({ user: updatedUser });
      }

      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "File not found!" });
    } catch (error) {
      next(error);
    }
  };

  const getEditorSignature = async (req, res) => {
    const EditorConfig = {
      bucket: AWSConfig.S3.EDITOR_BUCKET_NAME,
      region: "us-east-2",
      keyStart: "editor/",
      acl: "public-read",
      accessKey: process.env.AWS_ACCESS_KEY_ID,
      secretKey: process.env.AWS_SECRET_ACCESS_KEY,
    };

    const s3Hash = FroalaEditor.S3.getHash(EditorConfig);

    return res.status(HttpCodes.OK).json({ s3Hash });
  };

  const createInvitation = async (req, res) => {
    const { usersInvited, hostUserId } = req.body;

    try {
      const userAlreadyRegistered = await Promise.all(
        usersInvited.map((user) => {
          return User.findOne({
            where: {
              email: user.email,
            },
          });
        })
      );

      for (const userRegistered of userAlreadyRegistered) {
        if (userRegistered) {
          return res
            .status(HttpCodes.CONFLICT)
            .json({ msg: "Some user has already been registered" });
        }
      }

      const hostUser = await User.increment(
        {
          pointsConferenceLeaderboard: 100 * usersInvited.length,
        },
        {
          where: { id: hostUserId },
          returning: true,
        }
      );

      await Promise.all(
        usersInvited.map((user) => {
          const link = `${process.env.DOMAIN_URL}invitation/${hostUserId}/${user.email}`;

          let mailOptions = {
            from: process.env.SEND_IN_BLUE_SMTP_SENDER,
            to: user.email,
            subject: LabEmails.INVITATION_TO_JOIN.subject(
              hostUser[0][0][0],
              user
            ),
            html: LabEmails.INVITATION_TO_JOIN.body(
              hostUser[0][0][0],
              user,
              link
            ),
          };

          console.log("***** mailOptions ", mailOptions);

          return smtpService().sendMailUsingSendInBlue(mailOptions);
        })
      );

      return res
        .status(HttpCodes.OK)
        .json({ msg: `Users invited succesfully` });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const acceptInvitationJoin = async (req, res) => {
    const { hostUserId } = req.query;

    try {
      const { dataValues: user } = await User.findOne({
        where: { id: hostUserId },
      });

      if (!user) {
        return res
          .status(HttpCodes.BAD_REQUEST)
          .json({ msg: "Host user not found" });
      }

      await User.increment(
        {
          pointsConferenceLeaderboard: +500,
        },
        {
          where: { id: hostUserId },
        }
      );

      return res.status(HttpCodes.OK).json({ msg: `Thanks for joining` });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const sendEmailAuthorizationSpeakersEndPoint = async (req, res) => {
    const {
      id,
      firstName,
      email,
      lastName,
      company,
      sizeOfOrganization,
      personalLinks,
    } = req.user.dataValues;

    try {
      const link = `${process.env.DOMAIN_URL}speakers2023?id=${id}`;
      const [numberOfAffectedRows, affectedRows] = await User.update(
        { speakersAuthorization: "pending" },
        {
          where: {
            id: id,
          },
          returning: true,
        }
      );

      await Promise.resolve(
        (() => {
          let mailOptions = {
            from: process.env.SEND_IN_BLUE_SMTP_SENDER,
            to: "enrique@hackinghr.io",
            subject: LabEmails.USER_BECOME_SPEAKER_2023.subject,
            html: LabEmails.USER_BECOME_SPEAKER_2023.body(
              firstName,
              email,
              lastName,
              company,
              sizeOfOrganization,
              personalLinks,
              link
            ),
          };

          return smtpService().sendMailUsingSendInBlue(mailOptions);
        })()
      );

      await Promise.resolve(
        (() => {
          let mailOptions = {
            from: process.env.SEND_IN_BLUE_SMTP_SENDER,
            to: email,
            subject: LabEmails.USER_AFTER_APPLY_SPEAKER_2023.subject(firstName),
            html: LabEmails.USER_AFTER_APPLY_SPEAKER_2023.body(firstName),
          };

          return smtpService().sendMailUsingSendInBlue(mailOptions);
        })()
      );
      return res.status(HttpCodes.OK).json({
        msg: `Thank you for applying. You will receive a response within  the next 48 hours`,
        userUpdated: affectedRows,
      });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const sendActiveOrDenyAuthorizationEndPoint = async (req, res) => {
    const { userId, typeAuthorization } = req.body;

    try {
      const { dataValues: user } = await User.findOne({
        where: { id: userId },
      });

      if (!user) {
        return res
          .status(HttpCodes.NOT_FOUND)
          .json({ msg: "Host user not found" });
      }

      const [numberOfAffectedRows, affectedRows] = await User.update(
        { speakersAuthorization: typeAuthorization },
        {
          where: {
            id: userId,
          },
        }
      );

      if (typeAuthorization === "accepted") {
        await Promise.resolve(
          (() => {
            let mailOptions = {
              from: process.env.SEND_IN_BLUE_SMTP_SENDER,
              to: user.email,
              //to: "enrique@hackinghr.io",
              subject: LabEmails.USER_ACCEPTED_SPEAKER.subject(user.firstName),
              html: LabEmails.USER_ACCEPTED_SPEAKER.body(
                user,
                `${process.env.DOMAIN_URL}speakers2023`
              ),
            };

            return smtpService().sendMailUsingSendInBlue(mailOptions);
          })()
        );
      } else {
        await Promise.resolve(
          (() => {
            let mailOptions = {
              from: process.env.SEND_IN_BLUE_SMTP_SENDER,
              to: user.email,
              //to: "enrique@hackinghr.io",
              subject: LabEmails.USER_REJECT_SPEAKER.subject,
              html: LabEmails.USER_REJECT_SPEAKER.body(user),
            };

            return smtpService().sendMailUsingSendInBlue(mailOptions);
          })()
        );
      }

      return res.status(HttpCodes.OK).json({
        userUpdated: affectedRows,
      });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const acceptInvitationApplyBusinessPartner = async (req, res) => {
    const { userId, applyState } = req.body;
    try {
      const { dataValues: user } = await User.findOne({
        where: { id: userId },
      });
      if (!user) {
        return res
          .status(HttpCodes.BAD_REQUEST)
          .json({ msg: "Host user not found" });
      }
      const link = `${process.env.DOMAIN_URL}business-partner?id=${userId}`;
      const [numberOfAffectedRows, affectedRows] = await User.update(
        { isBusinessPartner: "pending" },
        {
          where: {
            id: userId,
          },
          returning: true,
        }
      );
      await Promise.resolve(
        (() => {
          let mailOptions = {
            from: process.env.SEND_IN_BLUE_SMTP_SENDER,
            // to: "morenoelba2002@gmail.com",
            to: "enrique@hackinghr.io",
            subject: LabEmails.USER_BECOME_BUSINESS_PARTNER.subject,
            html: LabEmails.USER_BECOME_BUSINESS_PARTNER.body(
              user,
              link,
              applyState
            ),
          };
          console.log("***** mailOptions ", mailOptions);

          return smtpService().sendMailUsingSendInBlue(mailOptions);
        })()
      );

      await Promise.resolve(
        (() => {
          let mailOptions = {
            from: process.env.SEND_IN_BLUE_SMTP_SENDER,
            to: user.email,
            subject: LabEmails.USER_AFTER_APPLY_BUSINESS_PARTNER.subject,
            html: LabEmails.USER_AFTER_APPLY_BUSINESS_PARTNER.body(user),
          };
          console.log("***** mailOptions ", mailOptions);

          return smtpService().sendMailUsingSendInBlue(mailOptions);
        })()
      );
      return res.status(HttpCodes.OK).json({
        msg: `Thank you for applying. You will receive a response within  the next 48 hours`,
        userUpdated: affectedRows,
      });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const getAllBusinessPartner = async (req, res) => {
    try {
      const users = await User.findAll({
        where: {
          isAdvertiser: true,
          partnersManual: "accepted",
        },
        attributes: [
          "advertisementCredits",
          "firstName",
          "lastName",
          "email",
          "id",
        ],
      });

      if (users.length === 0) {
        return res
          .status(HttpCodes.NOT_FOUND)
          .json({ msg: "Bad Request: Users not found" });
      }

      return res.status(HttpCodes.OK).json({ users });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const getAllBusinessPartnerSearch = async (req, res) => {
    try {
      const users = await User.findAll({
        where: {
          [Op.and]: [
            { isAdvertiser: false },
            {
              partnersManual: {
                [Op.or]: {
                  [Op.ne]: "accepted",
                  [Op.is]: null,
                },
              },
            },
          ],
        },
        attributes: [
          "advertisementCredits",
          "firstName",
          "lastName",
          "email",
          "id",
        ],
      });

      if (users.length === 0) {
        return res
          .status(HttpCodes.NOT_FOUND)
          .json({ msg: "Bad Request: Users not found" });
      }

      return res.status(HttpCodes.OK).json({ users });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const addBusinessPartner = async (req, res) => {
    const { usersNames } = req.body;

    try {
      await usersNames.forEach(async (idUser) => {
        return await User.update(
          {
            isAdvertiser: true,
            partnersManual: "accepted",
          },
          {
            where: {
              id: idUser,
            },
          }
        );
      });

      const user = await User.findAll({
        where: {
          isAdvertiser: true,
          partnersManual: "accepted",
        },
      });

      return res.status(HttpCodes.OK).json({ user });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const removeBusinessPartner = async (req, res) => {
    const { id } = req.body;
    try {
      await User.update(
        {
          isAdvertiser: false,
          partnersManual: "",
        },
        {
          where: {
            id: id,
          },
        }
      );

      const user = await User.findAll({
        where: {
          isAdvertiser: true,
          partnersManual: "accepted",
        },
      });

      return res.status(HttpCodes.OK).json({ user });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const confirmInvitationApplyBusiness = async (req, res) => {
    const { id } = req.params;
    const { accepted } = req.body;
    const link = `${process.env.DOMAIN_URL}business-partner`;
    try {
      const { dataValues: user } = await User.findOne({
        where: {
          id,
        },
      });

      if (!user) {
        return res.status(HttpCodes.BAD_REQUEST).json({
          msg: "user not found",
        });
      }
      await Promise.resolve(
        (() => {
          let mailOptions = {
            from: accepted
              ? process.env.SEND_IN_BLUE_SMTP_USER
              : process.env.SEND_IN_BLUE_SMTP_SENDER,
            to: user.email,
            subject: accepted
              ? LabEmails.ACCEPT_USER_APPLY_PARTNER_BUSSINESS.subject
              : LabEmails.REJECT_USER_APPLY_PARTNER_BUSSINESS.subject,
            html: accepted
              ? ACCEPT_USER_APPLY_PARTNER_BUSSINESS.body(user, link)
              : REJECT_USER_APPLY_PARTNER_BUSSINESS.body(user),
          };
          // console.log("***** mailOptions ", mailOptions);

          return smtpService().sendMailUsingSendInBlue(mailOptions);
        })()
      );
      if (accepted) {
        const [numberOfAffectedRows, affectedRows] = await User.update(
          { isBusinessPartner: "accepted" },
          {
            where: {
              id,
            },
            returning: true,
          }
        );

        return res.status(HttpCodes.OK).json({
          msg: "Business partner accepted",
          userUpdated: affectedRows,
        });

      } else {
        const [numberOfAffectedRows, affectedRows] = await User.update(
          { isBusinessPartner: "reject" },
          {
            where: {
              id,
            },
            returning: true,
          }
        );
        return res.status(HttpCodes.OK).json({
          msg: "Business partner rejected",
          userUpdated: affectedRows,
        });
      }

    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Something went wrong." });
    }
  };

  const confirmAccessibilityRequirements = async (req, res) => {
    const { id } = req.params;

    try {
      const { dataValues: user } = await User.findOne({
        where: {
          id,
        },
      });

      if (!user) {
        return res.status(HttpCodes.BAD_REQUEST).json({
          msg: "user not found",
        });
      }

      await Promise.resolve(
        (() => {
          let mailOptions = {
            from: process.env.SEND_IN_BLUE_SMTP_SENDER,
            to: "enrique@hackinghr.io",
            subject: LabEmails.USER_CONFIRM_ACCESSIBILITY_REQUIREMENTS.subject,
            html: LabEmails.USER_CONFIRM_ACCESSIBILITY_REQUIREMENTS.body(user),
          };
          console.log("***** mailOptions ", mailOptions);

          return smtpService().sendMailUsingSendInBlue(mailOptions);
        })()
      );

      return res
        .status(HttpCodes.OK)
        .json({ msg: "We received your request and will be in touch shortly" });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Something went wrong." });
    }
  };

  const changePassword = async (req, res) => {
    const { UserId } = req.params;
    const { body } = req;

    try {
      const user = await User.findOne({
        where: {
          id: UserId,
        },
      });

      const isEqual = bcryptService().comparePassword(
        body.oldPassword,
        user.password
      );

      if (!isEqual) {
        return res
          .status(HttpCodes.BAD_REQUEST)
          .json({ msg: "Incorrect Old Password." });
      }

      await User.update(
        {
          password: bcryptService().password(body.newPassword),
        },
        {
          where: {
            id: UserId,
          },
        }
      );

      return res.status(HttpCodes.OK).json({});
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Something went wrong." });
    }
  };

  const getLearningBadgesHoursByUser = async (userId) => {
    try {
      let query = `
      select
            u.id,
            SUM(main_data.duration) / 60 as hours
        from
            (
            select
                'podcastseries' as element,
                cast(coalesce(ps."durationLearningBadges", '0') as float) as duration,
                ps.id,
                psd.key,
                psd.value
            from
                "PodcastSeries" ps
            join jsonb_each_text(ps.viewed) psd on
                true
        union
            select
                'conference_library' as element,
                cast(coalesce(cl.duration, '0') as float) as duration,
                cl.id,
                cld.key,
                cld.value
            from
                "ConferenceLibraries" cl
            join jsonb_each_text(cl.viewed) cld on
                true
        union
            select
                'library' as element,
                cast(coalesce(l.duration, '0') as float) as duration,
                l.id,
                ld.key,
                ld.value
            from
                "Libraries" l
            join jsonb_each_text(l.viewed) ld on
                true
        union
            select
                'podcast' as element,
                cast(coalesce(p.duration, '0') as float) as duration,
                p.id,
                pd.key,
                pd.value
            from
                "Podcasts" p
            join jsonb_each_text(p.viewed) pd on
                true
        ) main_data
        inner join "Users" u on
            main_data.key = cast(u.id as varchar)
        where
            u.id=${userId} and
            main_data.value = 'mark'
        group by
            u.id
        order by
            hours desc
      `;

      const learningBadges = await db.sequelize.query(query, {
        type: QueryTypes.SELECT,
      });
      if (!learningBadges) {
        return 0;
      }
      if (learningBadges.length > 0) {
        if (learningBadges[0].hours) {
          return learningBadges[0].hours;
        } else {
          return 0;
        }
      } else {
        return 0;
      }
    } catch (error) {
      console.log(error);
      return 0;
    }
  };

  const getAllUsersExcludePassword = async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: { exclude: ["password"] },
        where: {
          completed: "TRUE",
        },
      });

      return res.status(HttpCodes.OK).json({ users });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Something went wrong." });
    }
  };

  const userIsOnline = async (id, online) => {
    try {
      const prevUser = await User.findOne({
        where: {
          id,
        },
      });

      if (!prevUser) {
        return res
          .status(HttpCodes.BAD_REQUEST)
          .json({ msg: "Bad Request: data is wrong" });
      }

      const [numberOfAffectedRows, affectedRows] = await User.update(
        {
          isOnline: online,
        },
        {
          where: { id },
          returning: true,
          plain: true,
        }
      );

      
      if(!online){
        const [numberOfAffectedRows2, affectedRows2] = await User.update(
          {
            lastDateSignOut: moment.utc().format(),
            bulPopup: true
          },
          {
            where: { id },
            returning: true,
            plain: true,
          }
        );
      }

      return affectedRows;
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  const updateUserPopup = async (req, res) => {
    const { bul,limitDatePopUp, arrayControlIdsMyLearning, arrayControlIdsEvents, lastDateSignOut, idRequest } = req.body;
    let idUser = (idRequest !== undefined) ? idRequest : -1
    if(req.user !== undefined){
      const { id } = req.user.dataValues;
      idUser = id
    }

    try {
      const prevUser = await User.findOne({
        where: {
          id: idUser,
        },
      });

      if (!prevUser) {
        return res
          .status(HttpCodes.BAD_REQUEST)
          .json({ msg: "Bad Request: data is wrong" });
      }

      let updateObject = {}

      if(bul !== undefined){
        updateObject = {
          ...updateObject,
          bulPopup: bul
        }
      }

      if(limitDatePopUp !== undefined){
        updateObject = {
          ...updateObject,
          limitDatePopUp: limitDatePopUp
        }
      }

      if(lastDateSignOut !== undefined){
        updateObject = {
          ...updateObject,
          lastDateSignOut: lastDateSignOut
        }
      }

      if(arrayControlIdsMyLearning !== undefined){
        updateObject = {
          ...updateObject,
          arrayControlIdsMyLearning: arrayControlIdsMyLearning
        }
      }

      if(arrayControlIdsEvents !== undefined){
        updateObject = {
          ...updateObject,
          arrayControlIdsEvents: arrayControlIdsEvents
        }
      }

      const [numberOfAffectedRows, affectedRows] = await User.update(
        updateObject,
        {
          where: { id: idUser },
          returning: true,
          plain: true,
        }
      );

      return res.status(HttpCodes.OK).json({ user: affectedRows });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Something went wrong" });
    }
  };

  const acceptTermsConditionGConference = async (req, res) => {
    const { id } = req.params;
    try {
      const [numberOfAffectedRows, affectedRows] = await User.update(
        {
          acceptTermsConditionGConference: true,
        },
        {
          where: {
            id,
          },
          returning: true,
          plain: true,
        }
      );

      await Promise.resolve(
        (() => {
          let mailOptions = {
            from: process.env.SEND_IN_BLUE_SMTP_USER,
            to: affectedRows.email,
            subject: LabEmails.USER_ACCEPT_TERMS_CONDITIONS_GCONFERENCE.subject,
            html: LabEmails.USER_ACCEPT_TERMS_CONDITIONS_GCONFERENCE.body(
              affectedRows
            ),
          };
          console.log("***** mailOptions ", mailOptions);

          return smtpService().sendMailUsingSendInBlue(mailOptions);
        })()
      );

      await User.update(
        {
          dateSendEmailTermsConditionGConference: moment(),
        },
        {
          where: {
            id,
          },
          returning: true,
          plain: true,
        }
      );

      return res.status(HttpCodes.OK).json({ user: affectedRows });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Something went wrong" });
    }
  };

  const viewRulesGConference = async (req, res) => {
    const { id } = req.params;
    try {
      const [numberOfAffectedRows, affectedRows] = await User.update(
        {
          viewRulesGConference: true,
        },
        {
          where: {
            id,
          },
          returning: true,
          plain: true,
        }
      );

      return res.status(HttpCodes.OK).json({ user: affectedRows });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Something went wrong" });
    }
  };

  const countAllUsers = async (req, res) => {
    try {
      const userCount = await User.count();

      return res.status(HttpCodes.OK).json({ userCount });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Something went wrong" });
    }
  };

  const getAllUsersChannelOwner = async (req, res) => {
    try {
      const channelsOwners = await User.findAll({
        where: {
          role: USER_ROLE.CHANNEL_ADMIN,
          channel: {
            [Op.not]: null,
          },
        },
        include: {
          model: Channel,
          attributes: ["name"],
        },
        attributes: [
          "firstName",
          "lastName",
          "email",
          "role",
          "subscription_enddate",
        ],
      });

      return res.status(HttpCodes.OK).json({ channelsOwners });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const handleReceiveCommunityNotification = async (req, res) => {
    const { id } = req.user;
    const { receiveCommunityNotification } = req.body;

    try {
      const [numberOfAffectedRows, affectedRows] = await User.update(
        {
          receiveCommunityNotification,
        },
        {
          where: { id },
          returning: true,
          plain: true,
        }
      );

      return res.status(HttpCodes.OK).json({ user: affectedRows });
    } catch (error) {
      console.log(error);

      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal Server Error" });
    }
  };

  const updateRenewSuscriptionUser = async (req, res) => {
    const { email } = req.user;
    const { bul } = req.body;

    try{

      const customers = await stripe.customers.list({
        email: email,
      });

      if (customers.data.length > 0) {
        if (customers.data[0].email === email) {

          const subscriptionInformation = await stripe.subscriptions.list({
            customer:customers.data[0].id,
            price: process.env.REACT_APP_STRIPE_YEARLY_USD_PRICE_ID,
            status: "active",
          });

          if (subscriptionInformation.data.length > 0) {
            await stripe.subscriptions.update(
              subscriptionInformation.data[0].id, 
              {cancel_at_period_end: bul}
            );
          }
        }
      }

      return res.status(HttpCodes.OK).json({msg: 'Renew changue sucessfully!!'});

    }catch(error){
      console.log(error);

      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal Server Error" });
    }
  }

  const checkMembresi = async (req, res) => {
    const { email } = req.user;

    try{
      let cancelAtEndPeriod = false

      const customers = await stripe.customers.list({
        email: email,
      });

      if (customers.data.length > 0) {
        if (customers.data[0].email === email) {
          const subscriptionInformation = await stripe.subscriptions.list({
            customer:customers.data[0].id,
            price: process.env.REACT_APP_STRIPE_YEARLY_USD_PRICE_ID,
            status: "active",
          });

          if (subscriptionInformation.data.length > 0) {
            cancelAtEndPeriod = subscriptionInformation.data[0].cancel_at_period_end
          }
        }
      }

      return res.status(HttpCodes.OK).json(cancelAtEndPeriod);

    }catch(error){
      console.log(error);

      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal Server Error" });
    }
  }

  return {
    sendEmailAuthorizationSpeakersEndPoint,
    sendActiveOrDenyAuthorizationEndPoint,
    getUser,
    getUserById,
    updateUser,
    updateUserAdmin,
    searchUser,
    upgradePlan,
    addEvent,
    removeEvent,
    getMyEvents,
    importUsers,
    getAll,
    generateInvitationEmail,
    setAttendedToConference,
    addSession,
    removeSession,
    sessionUserJoined,
    getSessionUsers,
    removeSessionUser,
    addBonfire,
    removeBonfire,
    uploadResume,
    deleteResume,
    getEditorSignature,
    createInvitation,
    acceptInvitationJoin,
    acceptInvitationApplyBusinessPartner,
    confirmInvitationApplyBusiness,
    confirmAccessibilityRequirements,
    changePassword,
    getLearningBadgesHoursByUser,
    getAllUsersExcludePassword,
    acceptTermsConditionGConference,
    userIsOnline,
    viewRulesGConference,
    countAllUsers,
    _addEvent,
    getAllBusinessPartner,
    addBusinessPartner,
    removeBusinessPartner,
    getAllBusinessPartnerSearch,
    getAllUsersChannelOwner,
    handleReceiveCommunityNotification,
    updateUserPopup,
    deleteUser,
    updateRenewSuscriptionUser,
    checkMembresi
  };
};

module.exports = UserController;
