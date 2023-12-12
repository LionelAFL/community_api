const db = require("../models");
const HttpCodes = require("http-codes");
const s3Service = require("../services/s3.service");
const { isValidURL } = require("../utils/profile");
const { Op } = require("sequelize");
const Sequelize = require("sequelize");
const moment = require("moment-timezone");
const { LabEmails } = require("../enum");
const smtpService = require("../services/smtp.service");
const cronService = require("../services/cron.service");
const TimeZoneList = require("../enum/TimeZoneList");
const { Settings, EmailContent, USER_ROLE } = require("../enum");
const { isEmpty, compact } = require("lodash");
const { convertToLocalTime, convertJSONToExcel } = require("../utils/format");
const NotificationController = require("../controllers/NotificationController");
const CouncilEventController = require("../controllers/CouncilEventController");
const ChallengeController = require("../controllers/ChallengeController");
const sendInBlueService = require("../services/sendinblue.service");
const Bot = require('../services/slackbot.service')

const Event = db.Event;
const Channel = db.Channel;
const User = db.User;
const EventInstructor = db.EventInstructor;
const Instructor = db.Instructor;
const Library = db.Library;
const QueryTypes = Sequelize.QueryTypes;
const VisibleLevel = Settings.VISIBLE_LEVEL;
const EmailDraftChannel = db.EmailDraftChannel
const LastEmailsNewsletterSend = db.LastEmailsNewsletterSend;
const CouncilEvent = db.CouncilEvent;
const CouncilEventPanel = db.CouncilEventPanel;
const CouncilEventPanelist = db.CouncilEventPanelist;

const EventController = () => {
  const setEventReminders = (event) => {
    const dateBefore24Hours = moment(event.startDate).subtract(1, "days");
    const dateAfterEventEnd = moment(
      event.startAndEndTimes[event.startAndEndTimes.length - 1].endTime
    );

    const dateBefore2Hours = moment(event.startDate).subtract(45, "minutes");

    const interval1 = `0 ${dateBefore24Hours.minutes()} ${dateBefore24Hours.hours()} ${dateBefore24Hours.date()} ${dateBefore24Hours.month()} *`;
    const interval2 = `0 ${dateBefore2Hours.minutes()} ${dateBefore2Hours.hours()} ${dateBefore2Hours.date()} ${dateBefore2Hours.month()} *`;
    const interval3 = `0 ${dateAfterEventEnd.minutes()} ${dateAfterEventEnd.hours()} ${dateAfterEventEnd.date()} ${dateAfterEventEnd.month()} *`;

    console.log("////////////////////////////////////////////");
    console.log("/////// setEventReminders //////");

    if (dateBefore24Hours.isAfter(moment())) {
      cronService().addTask(`${event.id}-24`, interval1, true, async () => {
        let targetEvent = await Event.findOne({ where: { id: event.id, statusEvent: 'active' } });
        targetEvent = targetEvent.toJSON();
        const eventUsers = await Promise.all(
          (targetEvent.users || []).map((user) => {
            return User.findOne({
              where: {
                id: user,
              },
            });
          })
        );

        await Promise.all(
          eventUsers.map((user) => {
            const _user = user.toJSON();
            const targetEventDate = moment(targetEvent.startDate);
            let mailOptions = {
              from: process.env.SEND_IN_BLUE_SMTP_SENDER,
              subject: LabEmails.EVENT_REMINDER_24_HOURS.subject(targetEvent),
              html: LabEmails.EVENT_REMINDER_24_HOURS.body(
                _user,
                targetEvent,
                targetEventDate.format("MMM DD"),
                targetEventDate.format("h:mm a")
              ),
            };

            console.log("***** mailOptions ", mailOptions);

            return smtpService().sendMailUsingSendInBlue(mailOptions);
          })
        );
      });
    }

    if (dateBefore2Hours.isAfter(moment())) {
      cronService().addTask(`${event.id}-45`, interval2, true, async () => {
        let targetEvent = await Event.findOne({ where: { id: event.id, statusEvent: 'active' } });
        targetEvent = targetEvent.toJSON();
        const eventUsers = await Promise.all(
          (targetEvent.users || []).map((user) => {
            return User.findOne({
              where: {
                id: user,
              },
            });
          })
        );

        await Promise.all(
          eventUsers.map((user) => {
            const _user = user.toJSON();
            let mailOptions = {
              from: process.env.SEND_IN_BLUE_SMTP_SENDER,
              subject: LabEmails.EVENT_REMINDER_45_MINUTES.subject(targetEvent),
              html: LabEmails.EVENT_REMINDER_45_MINUTES.body(
                _user,
                targetEvent
              ),
            };

            console.log("***** mailOptions ", mailOptions);
            return smtpService().sendMailUsingSendInBlue(mailOptions);
          })
        );
      });
    }

    if (dateAfterEventEnd.isAfter(moment())) {
      cronService().addTask(`${event.id}-5`, interval3, true, async () => {
        let targetEvent = await Event.findOne({ where: { id: event.id, statusEvent: 'active' } });
        targetEvent = targetEvent.toJSON();
        const users = targetEvent.usersAssistence.map((el) => JSON.parse(el));
        const usersId = users.map((el) => el.usersAssistence);
        const link = `${process.env.DOMAIN_URL}`;
        const eventUsers = await Promise.all(
          (usersId[0] || []).map((user) => {
            return User.findOne({
              where: {
                id: user,
              },
            });
          })
        );
        await Promise.all(
          eventUsers.map((user) => {
            const _user = user.toJSON();
            let mailOptions = {
              from: process.env.SEND_IN_BLUE_SMTP_SENDER,
              to: _user.email,
              subject: LabEmails.EVENT_JUST_END.subject(targetEvent),
              html: LabEmails.EVENT_JUST_END.body(_user, targetEvent, link),
            };

            console.log("***** mailOptions ", mailOptions);

            return smtpService().sendMailUsingSendInBlue(mailOptions);
          })
        );
      });
    }
  };

  const removeEventReminders = (event) => {
    cronService().stopTask(`${event.id}-24`);
    cronService().stopTask(`${event.id}-45`);
    cronService().stopTask(`${event.id}-5`);
  };

  const removeOrganizerReminders = (event) => {
    Array.from(Array(5).keys()).forEach((index) => {
      cronService().stopTask(`${event.id}-participant-list-reminder-${index}`);
    });
  };

  const sendParticipantsListToOrganizer = async (event) => {
    console.log("***************************");
    console.log("************** send email to organizer *************");
    console.log("***** event = ", event);
    let targetEvent = await Event.findOne({ where: { id: event.id, statusEvent: 'active' } });
    targetEvent = targetEvent.toJSON();
    console.log("***** targetEvent = ", targetEvent);
    const eventUsers = await Promise.all(
      (targetEvent.users || []).map((user) => {
        return User.findOne({
          where: {
            id: user,
          },
        });
      })
    );
    console.log("***** eventUsers = ", eventUsers);
    const buffer = await convertJSONToExcel(
      event.title,
      [
        {
          label: "First Name",
          value: "firstName",
          width: 20,
        },
        {
          label: "Last Name",
          value: "lastName",
          width: 20,
        },
        {
          label: "Email",
          value: "email",
          width: 20,
        },
      ],
      eventUsers.map((user) => user.toJSON())
    );

    let mailOptions = {
      from: process.env.SEND_IN_BLUE_SMTP_SENDER,
      subject: LabEmails.PARTICIPANTS_LIST_TO_ORGANIZER.subject(),
      attachments: [
        {
          filename: `${event.title}.xls`,
          content: buffer,
        },
      ],
    };
    console.log("******* start sending email ******");
    console.log("***** mailOptions = ", mailOptions);
    await smtpService().sendMailUsingSendInBlue(mailOptions);
    console.log("******* end sending email ******");
  };

  const setOrganizerReminders = (event) => {
    const dates = [
      moment(event.startDate).subtract(1, "week"),
      moment(event.startDate).subtract(3, "days"),
      moment(event.startDate).subtract(2, "days"),
      moment(event.startDate).subtract(1, "days"),
      moment(event.startDate).subtract(2, "hours"),
      moment(event.startDate).subtract(30, "minutes"),
    ];
    console.log("/////////////////////////////////////////////////////");
    console.log("//////// setOrganizerReminders ///////");
    dates.forEach((date, index) => {
      const interval = `10 ${date.minutes()} ${date.hours()} ${date.date()} ${date.month()} *`;
      console.log("******** email interval ", interval);
      if (date.isAfter(moment())) {
        console.log("****** adding task");
        cronService().addTask(
          `${event.id}-participant-list-reminder-${index}`,
          interval,
          true,
          () => sendParticipantsListToOrganizer(event)
        );
      }
    });
  };

  const sendMessage = async (users, subject, message) => {
    let mailOptions = {
      from: process.env.SEND_IN_BLUE_SMTP_SENDER,
      subject,
      html: message,
    };

    await Promise.all(
      users.map((user) => {
        mailOptions = {
          ...mailOptions,
        };

        return smtpService().sendMailUsingSendInBlue(mailOptions);
      })
    );
  };

  const create = async (req, res) => {
    const { body } = req;

    if (body.title) {
      try {
        let eventInfo = {
          ...body,
        };

        if(body.status === 'active'){
          eventInfo = {
            ...eventInfo,
            firstTime: false
          };
        }else{
          eventInfo = {
            ...eventInfo,
            firstTime: true
          };
        }

        if (eventInfo.image) {
          eventInfo.image = await s3Service().getEventImageUrl(
            "",
            eventInfo.image
          );
        }

        if (!isEmpty(eventInfo.images)) {
          const images = eventInfo.images.map((image) => {
            if (isValidURL(image)) {
              return image;
            }

            return s3Service().getEventImageUrl("", image);
          });

          eventInfo.images = await Promise.all(images);
        }

        const event = await Event.create({ ...eventInfo, sendInEmail: false });

        if (!event) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }

        const instructorIds = eventInfo?.instructorIds?.map((id) => ({
          InstructorId: id,
          EventId: event.id,
        }));

        if (instructorIds) {
          await EventInstructor.bulkCreate(instructorIds);
        }

        const [_, affectedRows] = await Event.update(
          {
            publicLink: `${process.env.DOMAIN_URL}${event.id}`,
          },
          {
            where: { id: event.id },
            returning: true,
            plain: true,
          }
        );

        if (event.startAndEndTimes.length > 0) {
          setEventReminders(event.dataValues);
        }

        if(body.statusEvent === 'active'){
          setOrganizerReminders(event);
          await NotificationController().createNotification({
            message: `New Event "${event.title || eventInfo.title}" was created.`,
            type: "event",
            meta: {
              ...event,
              publicLink: `${process.env.DOMAIN_URL}${event.id}`,
            },
            onlyFor: [-1],
          });
        }

        return res.status(HttpCodes.OK).json({ event: affectedRows });
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error", error: error });
      }
    }

    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: Title is needed." });
  };

  const updateEvent = async (req, res) => {
    const { id } = req.params;
    const event = req.body;

    try {
      let eventInfo = {
        ...event,
      };

      let prevEvent = await Event.findOne({
        where: {
          id,
        },
      });

      if(prevEvent.dataValues.firstTime !== false && event.statusEvent === 'active'){
        setOrganizerReminders(prevEvent);
        await NotificationController().createNotification({
          message: `New Event "${event.title || eventInfo.title}" was created.`,
          type: "event",
          meta: {
            ...event,
            publicLink: `${process.env.DOMAIN_URL}${event.id}`,
          },
          onlyFor: [-1],
        });

        eventInfo = {
          ...eventInfo,
          firstTime: false
        }
      }

      if (!prevEvent) {
        return res
          .status(HttpCodes.BAD_REQUEST)
          .json({ msg: "Bad Request: event not found." });
      }

      prevEvent = prevEvent.toJSON();

      if (event.image && !isValidURL(event.image)) {
        eventInfo.image = await s3Service().getEventImageUrl("", event.image);

        if (prevEvent.image) {
          await s3Service().deleteUserPicture(prevEvent.image);
        }
      }
      if (prevEvent.image && !event.image) {
        await s3Service().deleteUserPicture(prevEvent.image);
      }

      if (event.image2 && !isValidURL(event.image2)) {
        eventInfo.image2 = await s3Service().getEventImageUrl("", event.image2);

        if (prevEvent.image2) {
          await s3Service().deleteUserPicture(prevEvent.image2);
        }
      }
      if (prevEvent.image2 && !event.image2) {
        await s3Service().deleteUserPicture(prevEvent.image2);
      }

      if (!isEmpty(event.images)) {
        const newImages = eventInfo.images.map((image) => {
          if (isValidURL(image)) {
            return image;
          }

          return s3Service().getEventImageUrl("", image);
        });

        eventInfo.images = await Promise.all(newImages);
      }

      const [numberOfAffectedRows, affectedRows] = await Event.update(
        eventInfo,
        {
          where: { id },
          returning: true,
          plain: true,
        }
      );

      const instructorIds = eventInfo?.instructorIds?.map((instructorId) => ({
        InstructorId: instructorId,
        EventId: id,
      }));

      if (instructorIds !== undefined) {
        await EventInstructor.bulkCreate(instructorIds);

        await db.sequelize.transaction(async (t) => {
          await EventInstructor.destroy(
            {
              where: {
                EventId: id,
              },
            },
            { transaction: t }
          );

          await EventInstructor.bulkCreate(instructorIds, { transaction: t });
        });
      }

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

  const getAllEventsChannels = async (req, res) => {
    try {
      let channelEvents = await Event.findAll({
        where: { channel: { [Op.gte]: 1 } },
        attributes: { exclude: ['codeVerifyEvent'] },
        raw: true,
      });

      let channelData = await Channel.findAll();

      let allEventsChannels = channelEvents.map((event) => {
        let channelSelect = channelData.filter(
          (data) => data.id === event.channel
        );
        return {
          ...event,
          channelSelect: channelSelect[0],
          startAndEndTimes: compact(channelEvents.startAndEndTimes),
        };
      });

      return res.status(HttpCodes.OK).json({ allEventsChannels });
    } catch (err) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const getAllEvents = async (req, res) => {

    let role2;
    let email2;
    if(req.user !== undefined){
      const { role, email } = req.user;
      role2 = role
      email2 = email
    }

    const {type} = req.query

    try {

      let attributes = { exclude: [] }
      let where = {
        level: {
          [Op.or]: [VisibleLevel.DEFAULT, VisibleLevel.ALL],
        }
      };
      if(type !== 'admin'){
        where = {
          ...where,
          statusEvent: 'active'
        }
      }

      if(req.user !== undefined){
        if (role2 === USER_ROLE.EVENT_ORGANIZER) {
          where = {
            ...where,
            organizerEmail: email2,
          };
        }

        if (role2 === USER_ROLE.CHAPTER_LEADER) {
          where = {
            ...where,
            organizerEmail: email2,
          };
        }
        if(role2 !== "admin"){
          attributes = { exclude: ['codeVerifyEvent'] }
        }
      }

      let events = await Event.findAll({
        where,
        attributes,
        include: [
          {
            model: EventInstructor,
            attributes: ["id"],
            include: [
              {
                model: Instructor,
              },
            ],
          },
        ],
      });

      // events = events.map((event) => {
      //   return {
      //     ...event,
      //     startAndEndTimes: compact(event.startAndEndTimes),
      //   };
      // });

      return res.status(HttpCodes.OK).json({ events });
    } catch (err) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const getEventAdmin = async (req, res) => {
    const { id } = req.params;

    if (id) {
      try {
        const event = await Event.findOne({
          where: {
            id,
          },
          include: [
            {
              model: EventInstructor,
            },
          ],
        });

        if (!event) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Bad Request: Event not found" });
        }

        return res.status(HttpCodes.OK).json({ event });
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    } else {
      return res
        .status(HttpCodes.BAD_REQUEST)
        .json({ msg: "Bad Request: event id is wrong" });
    }
  };

  const getEvent = async (req, res) => {
    const { id } = req.params;

    if (id) {
      try {
        let event = await Event.findOne({
          where: {
            id,
            statusEvent: 'active'
          },
          include: [
            {
              model: EventInstructor,
              attributes: ["id"],
              include: [
                {
                  model: Instructor,
                },
              ],
            },
            {
              model: Library,
              where: {
                EventId: {
                  [Op.not]: null,
                },
                contentType: "video",
              },
              required: true,
              order: [["createdAt", "DESC"]],
            }
          ],
        });

        if(!event){
          event = await Event.findOne({
            where: {
              id,
              statusEvent: 'active'
            },
            include: [
              {
                model: EventInstructor,
                attributes: ["id"],
                include: [
                  {
                    model: Instructor,
                  },
                ],
              },
            ],
          });
        }

        if (!event) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Bad Request: Event not found" });
        }

        event = {
          ...event.toJSON(),
          startAndEndTimes: compact(event.toJSON().startAndEndTimes),
        };

        return res.status(HttpCodes.OK).json({ event });
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    } else {
      return res
        .status(HttpCodes.BAD_REQUEST)
        .json({ msg: "Bad Request: event id is wrong" });
    }
  };

  const getLiveEvents = async (req, res) => {
    const { id } = req.user;
    try {
      const events = await Event.findAll({
        // where: id,
        attributes: { exclude: ['codeVerifyEvent'] },
      });
      const eventsId = [];
      const eventsFilteredId = [];
      const eventsToShowFilter = [];
      const filterEvents = events.filter(
        (item) => item.usersAssistence.length !== 0
      );

      const usersAssistenceSelected = filterEvents.map((item) => {
        eventsId.push(item.id);
        return item.usersAssistence[0].map((el) => JSON.parse(el));
      });

      const usersAssistence = usersAssistenceSelected.map((el) => {
        return el.map(
          (item) =>
            item.usersAssistence?.length > 0 &&
            item.usersAssistence.map((el) => el === id && el)
        );
      });

      eventsId.forEach((item, index) => {
        if (!usersAssistence[index].includes(false)) {
          if (usersAssistence[index].length > 1) {
            const isUserAllDays = usersAssistence[index].reduce((prev, act) => {
              if (!prev) return prev;
              return act.includes(id);
            }, true);
            isUserAllDays && eventsFilteredId.push(item);
          } else {
            for (const user of usersAssistence[index]) {
              user.includes(id) && eventsFilteredId.push(item);
            }
          }
        }
      });
      events.forEach((event) => {
        for (const idsFiltered of eventsFilteredId) {
          idsFiltered === event.id && eventsToShowFilter.push(event);
        }
      });

      const notRepeatEvents = [...new Set(eventsToShowFilter)];
      return res.status(HttpCodes.OK).json({ events: notRepeatEvents });
    } catch (err) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const updateEventStatus = async (req, res) => {
    const { id: eventId } = req.params;
    const { id: userId } = req.token;
    const { status } = req.body;

    if (eventId && userId) {
      try {
        let prevEvent = await Event.findOne({ where: { id: eventId } });
        prevEvent = prevEvent.toJSON();
        const [numberOfAffectedRows, affectedRows] = await Event.update(
          {
            status: { ...prevEvent.status, [userId]: status },
          },
          {
            where: { id: eventId },
            returning: true,
            plain: true,
          }
        );

        return res
          .status(HttpCodes.OK)
          .json({ numberOfAffectedRows, affectedRows });
      } catch (error) {
        console.log(err);
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

  const updateEventUserAssistence = async (req, res) => {
    const { id: eventId } = req.params;
    const { id: userId } = req.token;
    const { body } = req;
    const EventId = Number(eventId);

    if (EventId && userId) {
      try {
        const { dataValues: user } = await User.findOne({
          where: { id: userId },
        });

        if (!user) {
          return res
            .status(HttpCodes.BAD_REQUEST)
            .json({ msg: "Host user not found" });
        }
        let prevEvent = await Event.findOne({ where: { id: EventId } });
        prevEvent = prevEvent.toJSON();
        const [numberOfAffectedRows, affectedRows] = await Event.update(
          {
            usersAssistence: [body.usersAssistence],
          },
          {
            where: { id: EventId },
            returning: true,
            plain: true,
          }
        );

        let dayOfMail;
        const days = body.usersAssistence.map((el) => JSON.parse(el));
        const timezone = TimeZoneList.find(
          (item) => item.value === affectedRows.timezone
        );
        days.map((time) => {
          const convertedStartEventTime = moment(time.start)
            .tz(timezone.utc[0])
            .utcOffset(timezone.offset, true)
            .format();
          const convertedEndEventTime = moment(time.end)
            .tz(timezone.utc[0])
            .utcOffset(timezone.offset, true)
            .format();

          const localDate = moment()
            .utc()
            .tz(timezone.utc[0])
            .utcOffset(timezone.offset, true)
            .format();

          const isTodayEvent =
            moment(convertedStartEventTime).format("MM DD") <=
              moment(localDate).format("MM DD") &&
            moment(convertedEndEventTime).format("MM DD") ===
              moment(localDate).format("MM DD");

          if (isTodayEvent) {
            dayOfMail = days.findIndex((el) => isTodayEvent);
          }
        });
        await Promise.resolve(
          (() => {
            let mailOptions = {
              from: process.env.SEND_IN_BLUE_SMTP_SENDER,
              to: user.email,
              subject: LabEmails.USER_CONFIRM_LIVE_ASSISTENCE.subject({
                firstDay: dayOfMail + 1,
                allDays: days.length,
                name: affectedRows.title,
              }),
              html: LabEmails.USER_CONFIRM_LIVE_ASSISTENCE.body(user, {
                firstDay: dayOfMail + 1,
                allDays: days.length,
                name: affectedRows.title,
              }),
            };
            console.log("***** mailOptions ", mailOptions);
            smtpService().sendMailUsingSendInBlue(mailOptions);
          })()
        );

        return res.status(HttpCodes.OK).json({ affectedRows });
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

  const sendEmailAfterEvent = async (event) => {
    try {
      let requests = event.users.map((user) => {
        return User.findOne({
          where: {
            id: user,
          },
        });
      });
      const users = await Promise.all(requests);

      let mailOptions = {
        from: process.env.SEND_IN_BLUE_SMTP_SENDER,
        subject: `Did you attend ${event.title}? – Get Your Digital Certificate!`,
      };

      requests = users.map((user) => {
        mailOptions.html = EmailContent.CLAIM_EMAIL(user, event);

        return smtpService().sendMailUsingSendInBlue(mailOptions);
      });
      await Promise.all(requests);
    } catch (error) {
      console.log(error);
    }
  };

  const emailAfterEventThread = async () => {
    try {
      const currentUTCTime = moment.utc().format();
      const results = await Event.findAll({
        where: {
          [Op.and]: [
            {
              startDate: {
                [Op.lte]: currentUTCTime,
              },
            },
            {
              isOverEmailSent: {
                [Op.not]: true,
              },
            },
          ],
        },
      });

      let requests = [];
      requests = results.map((event) => {
        return sendEmailAfterEvent(event);
      });
      await Promise.all(requests);

      if (results && results.length > 0) {
        await Event.update(
          {
            isOverEmailSent: true,
          },
          {
            where: {
              id: {
                [Op.in]: results.map((event) => event.id),
              },
            },
          }
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getEventUsers = async (req, res) => {
    const { id } = req.params;

    if (id) {
      try {
        let query = `
          SELECT public."Events".id as eventId, public."Users".*
          FROM public."Events"
          JOIN public."Users" ON public."Users".id = ANY (public."Events".users::int[])
          WHERE public."Events".id = ${id};
        `;

        const userList = await db.sequelize.query(query, {
          type: QueryTypes.SELECT,
        });

        return res.status(HttpCodes.OK).json({ userList });
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    }

    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: event id is wrong" });
  };

  const remove = async (req, res) => {
    const { id } = req.params;

    if (id) {
      try {
        const event = await Event.findOne({
          where: { id },
        });
        const result = await Event.destroy({
          where: {
            id,
          },
        });

        // remove reminders
        removeEventReminders(event);
        removeOrganizerReminders(event);

        return res.status(HttpCodes.OK).json({});
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    }

    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: Event id is wrong" });
  };

  const sendTestMessage = async (req, res) => {
    const { emails, subject, message } = req.body;
    const emailList = emails.split(",").map((item) => item.trim());

    try {
      let mailOptions = {
        from: process.env.SEND_IN_BLUE_SMTP_SENDER,
        subject,
        html: message,
      };

      await Promise.all(
        emailList.map((email) => {
          mailOptions = {
            ...mailOptions,
          };

          return smtpService().sendMailUsingSendInBlue(mailOptions);
        })
      );

      return res.status(HttpCodes.OK).json({});
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const sendMessageToParticipants = async (req, res) => {
    const { id } = req.params;
    const { subject, message } = req.body;

    if (id) {
      try {
        const event = await Event.findOne({
          where: { id },
        });

        const users = await Promise.all(
          (event.users || []).map((user) => {
            return User.findOne({ where: { id: user } });
          })
        );

        sendMessage(users, subject, message);

        return res.status(HttpCodes.OK).json({});
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    }

    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: Event id is wrong" });
  };

  const downloadICS = async (req, res) => {
    const { id } = req.params;
    let { day, userTimezone, title, startTimeD, endTimeD } = req.query;

    let bulCom = (title !== 'undefined' && title !== undefined && title !== null && title !== 'null') 

    try {
      let event = await Event.findOne({
        where: { id },
        raw: true,
      });

      if (!event) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }

      event = {
        ...event,
        startAndEndTimes: compact(event.startAndEndTimes),
      };

      let startTime = convertToLocalTime(
        event.startAndEndTimes[day].startTime,
        event.timezone,
        userTimezone
      );
      let endTime = convertToLocalTime(
        event.startAndEndTimes[day].endTime,
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

      const calendarInvite = smtpService().generateCalendarInvite(
        (bulCom) ? startTimeD : startTime,
        (bulCom) ? endTimeD : endTime,
        (bulCom) ? title : event.title,
        (event.link) ? `Link to connect: ${event.link}` : "",
        "",
        // event.location,
        `${process.env.DOMAIN_URL}${event.id}`,
        event.organizer,
        process.env.SEND_IN_BLUE_SMTP_SENDER,
        userTimezone
      );

      let icsContent = calendarInvite.toString();
      icsContent = icsContent.replace(
        "BEGIN:VEVENT",
        `METHOD:REQUEST\r\nBEGIN:VEVENT`
      );

      res.setHeader("Content-Type", "application/ics; charset=UTF-8;");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${encodeURIComponent((bulCom) ? title : event.title)}.ics`
      );
      res.setHeader("Content-Length", icsContent.length);
      return res.end(icsContent);
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const getChannelEvents = async (req, res) => {
    const filter = req.query;

    try {
      let where = {
        channel: filter.channel,
      };

      if (filter.topics && !isEmpty(JSON.parse(filter.topics))) {
        where = {
          ...where,
          categories: {
            [Op.overlap]: JSON.parse(filter.topics),
          },
        };
      }

      let channelEvents = await Event.findAll({ where, raw: true, attributes: { exclude: ['codeVerifyEvent'] }, });

      channelEvents = channelEvents.map((event) => {
        return {
          ...event,
          startAndEndTimes: compact(channelEvents.startAndEndTimes),
        };
      });

      return res.status(HttpCodes.OK).json({ channelEvents });
    } catch (err) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const deleteChannelEvent = async (req, res) => {
    const { channel } = req.query;
    const { id } = req.params;

    if (req.user.channel != channel) {
      return res
        .status(HttpCodes.BAD_REQUEST)
        .json({ msg: "Bad Request: You are not allowed." });
    }

    try {
      const event = await Event.findOne({
        where: { id },
      });

      await Event.destroy({
        where: { id },
      });

      // remove reminders
      removeEventReminders(event);
      removeOrganizerReminders(event);

      return res.status(HttpCodes.OK).json({});
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const resetEmailReminders = async (req, res) => {
    try {
      console.log("****** starting ******");
      let allEvents = await Event.findAll({});
      allEvents = allEvents.map((event) => event.toJSON());
      console.log("****** allEvents ******", allEvents);
      const comingEvents = allEvents.filter((event) => {
        const startTime = convertToLocalTime(event.startDate);
        return moment().isBefore(startTime);
      });
      console.log("****** comingEvents", comingEvents);
      console.log("****** at first cron tasks ", cronService().listCrons());
      cronService().stopAllTasks();
      console.log("****** before cron tasks ", cronService().listCrons());
      comingEvents.forEach((event) => {
        setEventReminders(event);
        setOrganizerReminders(event);
      });
      console.log("****** after cron tasks ", cronService().listCrons());
      return res.status(HttpCodes.OK).json({});
    } catch (err) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const claimCredit = async (req, res) => {
    const { id, pdf } = req.body;
    const { user } = req;

    if (id) {
      try {
        let event = await Event.findOne({
          where: {
            id,
          },
          raw: true,
        });

        console.log("****** event ", event);

        if (event.showClaim === 1) {
          let mailOptions = {
            from: process.env.SEND_IN_BLUE_SMTP_SENDER,
            subject: LabEmails.EVENT_CLAIM_CREDIT.subject(event.title),
            html: LabEmails.EVENT_CLAIM_CREDIT.body(user, event),
            attachments: [
              {
                filename: "certificate.pdf",
                contentType: "application/pdf",
                content: Buffer.from(
                  pdf.substr(pdf.indexOf(",") + 1),
                  "base64"
                ),
              },
            ],
          };

          await smtpService().sendMailUsingSendInBlue(mailOptions);

          return res.status(HttpCodes.OK).json({});
        }

        return res.status(HttpCodes.BAD_REQUEST).json({});
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    }
    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: Event id is wrong" });
  };

  const claimAttendance = async (req, res) => {
    const { id } = req.body;
    const { user } = req;

    if (id) {
      try {
        let event = await Event.findOne({
          where: {
            id,
          },
        });

        if (!event) {
          return res.status(HttpCodes.BAD_REQUEST).json({
            msg: "Bad Request: This Event is not existed",
          });
        }

        event = event.toJSON();

        let mailOptions = {
          from: process.env.SEND_IN_BLUE_SMTP_SENDER,
          subject: LabEmails.EVENT_CLAIM_ATTENDANCE.subject(event.title),
          html: LabEmails.EVENT_CLAIM_ATTENDANCE.body(user, event),
        };

        await smtpService().sendMailUsingSendInBlue(mailOptions);

        return res.status(HttpCodes.OK).json({});
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    }
    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: Event id is wrong" });
  };

  const getChannelsEventsOfLastWeek = async (req, res) => {
    try {
      const eventsLastWeek = await Event.findAll({
        where: {
          [Op.and]: [
            {
              sendInEmail: false,
            },
            {
              channel: {
                [Op.not]: null,
              },
            },
          ],
        },
      });

      await Event.update(
        {
          sendInEmail: true,
        },
        {
          where: { sendInEmail: false },
        }
      );

      return eventsLastWeek;
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Somenthing went wrong" });
    }
  };

  const eventCertificateMetaData = async (req, res) => {
    const { metadata } = req.body;
    const metaTags = `<meta name="description" content="We are a community of business and HR leaders, HR practitioners, technologists, entrepreneurs, consultants." data-react-helmet="true"/>
    <meta property="og:title" content="Hacking HR's Certificate of Participation" data-react-helmet="true"/>
    <meta property="og:description" content="We are a community of business and HR leaders, HR practitioners, technologists, entrepreneurs, consultants." data-react-helmet="true"/>
    <meta property="og:type" content="webpage" data-react-helmet="true" />
    <meta property="og:url" content="https://www.hackinghrlab.io/" data-react-helmet="true"/>
    <meta property="twitter:url" content="https://www.hackinghrlab.io/" data-react-helmet="true"/>
    <meta property="image" content="${metadata.metadata}" data-react-helmet="true" />
    <meta property="og:image" content="${metadata.metadata}" data-react-helmet="true"/>
    <meta property="twitter:title" content="Hacking HR's Certificate of Participation" data-react-helmet="true"/>
    <meta property="twitter:image" content="${metadata.metadata}" data-react-helmet="true"/>`;
    res.send(metaTags);
  };

  const searchUserEvents = async (req, res) => {
    const { id } = req.params;

    try {

      let query = `
        SELECT public."Events".id as eventId, public."Users".*
        FROM public."Events"
        JOIN public."Users" ON public."Users".id = ANY (public."Events".users::int[])
        WHERE public."Events".id = ${id};
      `;

      const userDataEvent = await db.sequelize.query(query, {
        type: QueryTypes.SELECT,
      });

      return res.status(HttpCodes.OK).json({ userDataEvent });

    } catch (error) {
        console.log(error);
        return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
    }
  }

  const sendEmailBeforeEvent = async (event,name) => {
    try {
      
      const userEmail = await User.findAll({
        where: {
          id: event.users,
        },
        attributes: [
          "email",
          "firstName",
          "lastName",
          "dateRenewInvitationEmail",
          "countEmailsSend",
          "id"
        ],
      });

      if(name === '24'){
        await Promise.resolve(
          (() => {
              return sendInBlueService().sendNewsLetter(
                LabEmails.ATTENDEE_EVENT_24HOURBEFORE.body(
                  event.title, 
                  event.link, 
                  moment(event.startDate,'YYYY-MM-DD hh:mm a').utc().format("MMM DD"),
                  moment(event.startAndEndTimes[0]?.startTime,'YYYY-MM-DD hh:mm a').utc().format("h:mm a"),
                  event.timezone,
                  moment(event.endDate,'YYYY-MM-DD hh:mm a').utc().format("MMM DD"),
                  moment(event.startAndEndTimes[event.startAndEndTimes.length-1].endTime,'YYYY-MM-DD hh:mm a').utc().format("h:mm a"),
                ),
                LabEmails.ATTENDEE_EVENT_24HOURBEFORE.subject(event.title, event.link),
                `REMINDER: ${event.title} is starting in 24 hours!`,
                userEmail,
                false
              );
          })()
        );
      }
      if(name === '1'){
        await Promise.resolve(
          (() => {
              return sendInBlueService().sendNewsLetter(
                LabEmails.ATTENDEE_EVENT_1HOURBEFORE.body(event.title,event.link),
                LabEmails.ATTENDEE_EVENT_1HOURBEFORE.subject(event.title),
                `REMINDER: ${event.title} is starting in ONE hour!`,
                userEmail,
                false
              );
          })()
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const verifyUserSuscribeSendingBlue = async (req,res) => {

    const { email } = req.user;

    try {

      let bul = await sendInBlueService().confirmSuscribeUser(email)

      return res.status(HttpCodes.OK).json(bul);

    } catch (error) {
        console.log(error);
        return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
    }
  }

  const suscriptionSendingBlue2 = async (req,res) => {
    const { email } = req.user;

    try {

      let bul = sendInBlueService().suscriptionSendingBlue(email)

      return res.status(HttpCodes.OK).json(bul);

    } catch (error) {
        console.log(error);
        return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
    }
  }

  const changueEventStatusPopup = async (req,res) => {
    const { data } = req.body;
    const {bul,id} = data

    try {

      const [_, affectedRows] = await Event.update(
        {
          showPopupMyLearning: bul,
        },
        {
          where: { id: id },
        }
      );

      return res.status(HttpCodes.OK).json();

    } catch (error) {
        console.log(error);
        return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
    }
  }

  const activeOrCloseRegisterEvent = async (req,res) => {
    const {bul,id } = req.body;

    try {

      const [_, affectedRows] = await Event.update(
        {
          bulCloseEvent: bul,
        },
        {
          where: { id: id },
        }
      );

      return res.status(HttpCodes.OK).json();

    } catch (error) {
        console.log(error);
        return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
    }
  }

  const addDraftEmail = async (req, res) => {

    const { draftEmail } = req.body;

    const { idChannel, name, datePrograming, subject, message, id,type } = draftEmail

    try {

      let draftEmailResponse = undefined

      if(id === -1){
        draftEmailResponse = await EmailDraftChannel.create({
          idChannel,
          name,
          to: [-1],
          subject,
          message,
          datePrograming,
          draft: true,
          type: (type === 'event-slack') ? 'event-slack' : 'event',
        })

      }else{

        const [numberOfAffectedRows, affectedRows] = await EmailDraftChannel.update({ 
          idChannel,
          name,
          to: [-1], 
          subject,
          message,
          datePrograming,
          draft: true,
          type: (type === 'event-slack') ? 'event-slack' : 'event',
        },{where: {id: id}})

      }

        return res.status(HttpCodes.OK).json({draftEmailResponse})

    } catch (error) {
        console.log(error);
        return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
    }

  }

  const getAllDraftEmail = async (req, res) => {

    const { id } = req.params;

      try {

          const draftEmailResponse = await EmailDraftChannel.findAll({
              order: [["id", "DESC"]],
              where: {[Op.or]:[{idChannel: id, draft: true, type: 'event'},{idChannel: id, draft: true, type: 'event-slack'}],}
          })

          const channels = await Bot.getChannels()
          const users = await Bot.getUsers()

          return res.status(HttpCodes.OK).json({ draftEmailResponse, channels: channels.channels, users: users.members });

      } catch (error) {
          console.log(error);
          return res
              .status(HttpCodes.INTERNAL_SERVER_ERROR)
              .json({ msg: "Internal server error" });
      }
  }

  const getAllSendEmail = async (req, res) => {

    try {

        const sendEmailResponse = await EmailDraftChannel.findAll({
            order: [["id", "DESC"]],
            where: {[Op.or]: [{send: true, type: 'event'},{send: true, type: 'event-slack'}]}
        })

        return res.status(HttpCodes.OK).json({ sendEmailResponse });

    } catch (error) {
        console.log(error);
        return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
    }
  }

  const editDraftEmail = async (req, res) => {
      const { draftEmail } = req.body;

      const { name, datePrograming, subject, message, type, id } = draftEmail
      try {

          const [numberOfAffectedRows, affectedRows] = await EmailDraftChannel.update({ 
              name,
              to: [-1], 
              datePrograming,
              subject,
              message,
              type: (type === 'event-slack') ? 'event-slack' : 'event',
          },{where: {id: id}})

          return res.status(HttpCodes.OK).json({ numberOfAffectedRows, affectedRows })

      } catch (error) {
          console.log(error);
          return res
              .status(HttpCodes.INTERNAL_SERVER_ERROR)
              .json({ msg: "Internal server error" });
      }
  }

  const deleteDraftEmail = async (req, res) => {
      const { draftEmailId } = req.params;

      try {

          await EmailDraftChannel.destroy({where: {id: draftEmailId}})

          return res.status(HttpCodes.OK).json({})

      } catch (error) {
          console.log(error);
          return res
              .status(HttpCodes.INTERNAL_SERVER_ERROR)
              .json({ msg: "Internal server error" });
      }
  }

  const searchTimeZone = (timezone) => {
    let currentTimezone = TimeZoneList.find((item) => item.value === timezone);

    if (currentTimezone) {
      currentTimezone = currentTimezone.utc[0];
    } else {
      currentTimezone = timezone;
    }

    return currentTimezone
  }

  const emailAttendee = async (req, res) => {
    const {
      name,
      to,
      subject,
      message,
      test,
      testEmail,
      idChannel,
      type,
      id,
    } = req.body

    try{

      const params = {
        icon_emoji: ':img-certificate-logo:'
      };

      const userEmail = await User.findAll({
        where: {
          id: (type === 'event-slack') ? [-1] : to,
        },
        attributes: [
          "email",
          "firstName",
          "dateRenewInvitationEmail",
          "countEmailsSend",
          "id"
        ],
      });

      const channelsName = to.filter(e => {
        return e[0] !== '{'
      })

      const userSlacks = to.filter(e => {
        return e[0] === '{'
      })

      if(test){

        await Promise.resolve(
          (() => {
              return sendInBlueService().sendNewsLetter(
                LabEmails.ATTENDEE_EVENT.body(message),
                LabEmails.ATTENDEE_EVENT.subject(subject),
                name,
                testEmail,
                true
              );
          })()
        ); 

        return res
          .status(HttpCodes.OK)
          .json();
      }else{     

        if(id === -1){

          await EmailDraftChannel.create({
            idChannel,
            name,
            to: [-1],
            subject,
            message,
            draft: false,
            send: true,
            type: (type === 'event-slack') ? 'event-slack' : 'event',
            date: moment
            .utc(moment().format("YYYY-MM-DD HH:mm"))
            .format()
          })
      
        }else{

          await EmailDraftChannel.update({ 
            name,
            to: [-1], 
            subject,
            message,
            draft: false,
            send: true,
            type: (type === 'event-slack') ? 'event-slack' : 'event',
            date: moment
            .utc(moment().format("YYYY-MM-DD HH:mm"))
            .format()
          },{where: {id: id}})

        }
        
        if(type === 'event-slack') {

          channelsName.forEach((data) => {
            try{
              if(data !== undefined){
                Bot.postMessageToChannel(
                  data, 
                  message, 
                  params
                )
              }
            }catch(error){

            }
          
          })

          userSlacks.map( data => {
            const user = JSON.parse(data)
      
            if(user !== undefined){
              try{
                Bot.postMessageToUser(
                  user.name,
                  message, 
                  params
                )
              }catch(error){

              }
            }

          })
    
        }else{
          await Promise.resolve(
            (() => {
                return sendInBlueService().sendNewsLetter(
                  LabEmails.ATTENDEE_EVENT.body(message),
                  LabEmails.ATTENDEE_EVENT.subject(subject),
                  name,
                  userEmail,
                  false
                );
            })()
          );
        }

        return res
          .status(HttpCodes.OK)
          .json();
    
      }
      
    }catch(error){
      console.log(error)
    }
  };

  const emailBeforeStart = async () => {
    try {

      let arrayEventsSequelize = await Event.findAll({where:{
        level: {
          [Op.or]: [VisibleLevel.DEFAULT, VisibleLevel.ALL],
        }
      }})

      const dobleVerificationHour = await LastEmailsNewsletterSend.findOne({
        where: {
          idReference: 1,
        },
      });

      let arrayEvents = arrayEventsSequelize.filter((data) => data.dataValues.startAndEndTimes[0] !== undefined || data.dataValues.startAndEndTimes[0] !== null || data.dataValues.startAndEndTimes[0].startTime !== undefined || data.dataValues.startAndEndTimes[0].startTime !== null)

      await Promise.all(arrayEvents);

      
      const results24 = arrayEvents.filter((data) => {
        if(moment(moment.utc().add(24, 'hours').startOf('hour'),'YYYY-MM-DD hh:mm a').tz(searchTimeZone(data.dataValues.timezone)) !== undefined && moment(data.dataValues.startAndEndTimes[0]?.startTime,'YYYY-MM-DD hh:mm a').startOf('hour') !== undefined){
          if(moment(moment.utc().add(24, 'hours').startOf('hour'),'YYYY-MM-DD hh:mm a').tz(searchTimeZone(data.dataValues.timezone)).format('YYYY-MM-DD hh:mm a') === moment(data.dataValues.startAndEndTimes[0]?.startTime,'YYYY-MM-DD hh:mm a').startOf('hour').format('YYYY-MM-DD hh:mm a')){
            return data
          }
        }
      })

      const results1 = arrayEvents.filter((data) => {
        if(moment(moment.utc().add(1, 'hours').startOf('hour'),'YYYY-MM-DD hh:mm a').tz(searchTimeZone(data.dataValues.timezone)) !== undefined && moment(data.dataValues.startAndEndTimes[0]?.startTime,'YYYY-MM-DD hh:mm a').startOf('hour') !== undefined){
          if(moment(moment.utc().add(1, 'hours').startOf('hour'),'YYYY-MM-DD hh:mm a').tz(searchTimeZone(data.dataValues.timezone)).format('YYYY-MM-DD hh:mm a') === moment(data.dataValues.startAndEndTimes[0]?.startTime,'YYYY-MM-DD hh:mm a').startOf('hour').format('YYYY-MM-DD hh:mm a')){
            return data
          }
        }
      })
      
      if(dobleVerificationHour.dataValues.lastTimeRegisterCron !== moment.utc().startOf('hour').format('YYYY-MM-DD hh:mm a')){

        ChallengeController().emailReminder();
        CouncilEventController().remindToAddQuestionsAndRemindTheEventStartsTomorrow()
        CouncilEventController().remindPanelistOneHourBeforeTheEvent();
        RemindersSlacks()

        if(results24[0] !== undefined || results24 !== null){

          let requests24 = [];
          requests24 = results24.map((event) => {
            return sendEmailBeforeEvent(event,'24');
          });
          await Promise.all(requests24);

        }

        if(results1[0] !== undefined || results1 !== null){

          let requests1 = [];
          requests1 = results1.map((event) => {
            return sendEmailBeforeEvent(event,'1');
          });
          await Promise.all(requests1);

        }

      }

      await LastEmailsNewsletterSend.update({
        lastTimeRegisterCron: moment.utc().startOf('hour').format('YYYY-MM-DD hh:mm a'),
      },{
        where: { idReference: 1 },
      })

    } catch (error) {
      console.log(error);
    }
  };

  const Reminder1week = async (startDate, timezone) => {

    const startDat = moment.utc(startDate)?.startOf("hour")?.format('YYYYMMDDHHmm')

    let dateNow = moment(moment.utc().startOf("hour").add(1, "week").tz(searchTimeZone(timezone)))?.format('YYYYMMDDHHmm')

    return Number(dateNow) === Number(startDat)

  }

  const Reminder24Hours = async (startDate, timezone) => {

    const startDat = moment.utc(startDate)?.startOf("hour")?.format('YYYYMMDDHHmm')

    let dateNow = moment(moment.utc().startOf("hour").add(1, "day").tz(searchTimeZone(timezone)))?.format('YYYYMMDDHHmm')

    return Number(dateNow) === Number(startDat)

  }

  const Reminder1Hour = async (startDate, timezone) => {
    const startDat = moment.utc(startDate)?.startOf("hour")?.format('YYYYMMDDHHmm')

    let dateNow = moment(moment.utc().startOf("hour").add(1, "hour").tz(searchTimeZone(timezone)))?.format('YYYYMMDDHHmm')

    return Number(dateNow) === Number(startDat)
  }

  const RemindersSlacks = async () => {
    const params = {
      icon_emoji: ':img-certificate-logo:'
    };

    let arrayEventsSequelize = await Event.findAll({where:{
      level: {
        [Op.or]: [VisibleLevel.DEFAULT, VisibleLevel.ALL],
      }
    }})

    let councilEvents = await CouncilEvent.findAll({
      order: [[CouncilEventPanel, "startDate", "ASC"]],
      include: [
        {
          model: CouncilEventPanel,
          include: [
            {
              model: CouncilEventPanelist,
              include: [
                {
                  model: User,
                  attributes: [
                    "id",
                    "firstName",
                    "lastName",
                    "titleProfessions",
                    "img",
                    "abbrName",
                    "personalLinks"
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    arrayEventsSequelize.map((event) => {
      const _event = councilEvents.find((eve) => eve.id === Number(event.relationEventCouncil));

      _event?.CouncilEventPanels.map(async (councilEvent) => {

        if(Reminder1week(councilEvent.startDate, _event.timezone) === true && event.bulSlack1Week === 'true'){
          Bot.postMessageToChannel(
            'general', 
            event.message1Week, 
            params
          )
        }
        
        if(Reminder24Hours(councilEvent.startDate, _event.timezone) === true && event.bulSlack24Hour === 'true'){
          Bot.postMessageToChannel(
            'general', 
            event.message24Hours, 
            params
          )
        }

        if(Reminder1Hour(councilEvent.startDate, _event.timezone) === true && event.bulSlack1Hour === 'true'){
          Bot.postMessageToChannel(
            'general', 
            event.message1Hours, 
            params
          )
        }

      })

    })
  }
  
  return {
    create,
    suscriptionSendingBlue2,
    getAllEvents,
    getEvent,
    getEventAdmin,
    RemindersSlacks,
    updateEventUserAssistence,
    updateEvent,
    updateEventStatus,
    getLiveEvents,
    changueEventStatusPopup,
    updateEventUserAssistence,
    emailAfterEventThread,
    getEventUsers,
    verifyUserSuscribeSendingBlue,
    remove,
    sendMessageToParticipants,
    sendTestMessage,
    downloadICS,
    getChannelEvents,
    deleteChannelEvent,
    resetEmailReminders,
    claimCredit,
    claimAttendance,
    getChannelsEventsOfLastWeek,
    eventCertificateMetaData,
    getAllEventsChannels,
    addDraftEmail,
    getAllDraftEmail,
    getAllSendEmail,
    editDraftEmail,
    deleteDraftEmail,
    emailAttendee,
    searchUserEvents,
    emailBeforeStart,
    activeOrCloseRegisterEvent,
  };
};

module.exports = EventController;
