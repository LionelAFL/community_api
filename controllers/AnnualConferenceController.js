const db = require("../models");
const HttpCodes = require("http-codes");
const { Op, Sequelize } = require("sequelize");
const moment = require("moment-timezone");
const smtpService = require("../services/smtp.service");
const socketService = require("../services/socket.service");
const TimeZoneList = require("../enum/TimeZoneList");
const SocketEventTypes = require("../enum/SocketEventTypes");
const { convertToLocalTime } = require("../utils/format");
const { LabEmails } = require("../enum");

const AnnualConference = db.AnnualConference;
const User = db.User;
const QueryTypes = Sequelize.QueryTypes;
const SpeakersPanel = db.SpeakerPanel;
const SpeakerMemberPanel = db.SpeakerMemberPanel
const SpeakerPanelsClass = db.SpeakerPanelsClass;
const HrCredits = db.HrCredits

const AnnualConferenceController = () => {
  const create = async (req, res) => {
    const { body } = req;

    if (body.title) {
      try {
        let conferenceInfo = {
          ...body,
        };

        const newConference = await AnnualConference.create(conferenceInfo);

        if (!newConference) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }

        return res.status(HttpCodes.OK).json({ conference: newConference });
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

  const update = async (req, res) => {
    const { id } = req.params;
    const conference = req.body;

    try {
      let conferenceInfo = {
        ...conference,
      };

      const prevConference = await AnnualConference.findOne({
        where: {
          id,
        },
      });

      if (!prevConference) {
        return res
          .status(HttpCodes.BAD_REQUEST)
          .json({ msg: "Bad Request: Conference not found." });
      }

      const [numberOfAffectedRows, affectedRows] =
        await AnnualConference.update(conferenceInfo, {
          where: { id },
          returning: true,
          plain: true,
        });

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

  const get = async (req, res) => {
    const { id } = req.params;
    const { type } = req.query

    try {
      let conference

      if(type === '2022' || type === undefined || type === null){
          const query = `
        SELECT public."AnnualConferences".*, public."Instructors".id as instructorId, public."Instructors"."name", public."Instructors"."link" as linkSpeaker, 
        public."Instructors".image, public."Instructors"."description" as descriptionSpeaker
        FROM public."AnnualConferences"
        LEFT JOIN public."Instructors" ON public."Instructors".id = ANY (public."AnnualConferences".speakers::int[]) WHERE public."AnnualConferences".id = ${id}`;

        conference = await db.sequelize.query(query, {
          type: QueryTypes.SELECT,
        });
      }else{
        conference = await SpeakersPanel.findOne({
          where: {
              id: Number(id),
              visible: true
          },
          include: [
            {
                model: SpeakerMemberPanel,
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
                            "email",
                            "personalLinks",
                            "about"
                        ],
                    }
                ]
            }
        ],
        });
      }

      if (!conference) {
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Bad Request: Confererence not found" });
      }

      return res.status(HttpCodes.OK).json({ conference });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const getAll = async (req, res) => {
    const { startTime, endTime, meta, type } = req.query;
    try {
      let where = "";

      if (startTime && endTime) {
        where += `WHERE (public."AnnualConferences"."startTime" >= '${startTime}' AND public."AnnualConferences"."startTime" <= '${endTime}')`;
      }

      if (type === "conference" && startTime) {
        where += `AND (public."AnnualConferences"."type" = 'Certificate Track and Panels')`;
      } else if (type === "conference") {
        where += `WHERE (public."AnnualConferences"."type" = 'Certificate Track and Panels')`;
      }

      if (meta) {
        where += `AND (public."AnnualConferences"."title" ILIKE '%${meta}%' OR public."AnnualConferences"."description" ILIKE '%${meta}%'
        OR public."AnnualConferences"."type" ILIKE '%${meta}%' OR public."Instructors"."name" ILIKE '%${meta}%'
        OR public."Instructors"."description" ILIKE '%${meta}%' OR public."AnnualConferences".categories::text ILIKE '%${meta}%'
        OR public."AnnualConferences".meta ILIKE '%${meta}%')`;
      }

      const query = `
      SELECT public."AnnualConferences".*, public."Instructors".id as instructorId, public."Instructors"."name", public."Instructors"."link" as linkSpeaker,
      public."Instructors".image, public."Instructors"."description" as descriptionSpeaker, COUNT(public."Users".id) AS totalUsersJoined
      FROM public."AnnualConferences"
      LEFT JOIN public."Instructors" ON public."Instructors".id = ANY (public."AnnualConferences".speakers::int[])
      LEFT JOIN public."Users" ON public."AnnualConferences".id = ANY (public."Users"."sessionsJoined"::int[]) ${where}
      GROUP BY public."AnnualConferences".id, public."Instructors".id`;

      const sessionList = await db.sequelize.query(query, {
        type: QueryTypes.SELECT,
      });

      return res.status(HttpCodes.OK).json({ conferences: sessionList });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const getSessionsUser = async (req, res) => {
    const { userId } = req.query;

    try {
      const query = `
      SELECT public."AnnualConferences".*, public."Instructors".id as instructorId, public."Instructors"."name", public."Instructors"."link" as linkSpeaker, 
      public."Instructors".image, public."Instructors"."description" as descriptionSpeaker
      FROM public."Users"
      INNER JOIN public."AnnualConferences" ON public."AnnualConferences".id = ANY (public."Users".sessions::int[])
      INNER JOIN public."Instructors" ON public."Instructors".id = ANY (public."AnnualConferences".speakers::int[])
      WHERE public."Users"."id" = ${userId}
    `;

      const sessionList = await db.sequelize.query(query, {
        type: QueryTypes.SELECT,
      });

      return res.status(HttpCodes.OK).json({ sessionsUser: sessionList });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const getSessionsUserJoined = async (req, res) => {
    const { sessionsId } = req.query;

    try {
      const query = `
      SELECT public."AnnualConferences".*, public."Instructors".id as instructorId, public."Instructors"."name", public."Instructors"."link" as linkSpeaker,
      public."Instructors".image, public."Instructors"."description" as descriptionSpeaker
      FROM public."AnnualConferences"
      LEFT JOIN public."Instructors" ON public."Instructors".id = ANY (public."AnnualConferences".speakers::int[])
      WHERE public."AnnualConferences"."id" IN (${sessionsId})
      GROUP BY public."AnnualConferences".id, public."Instructors".id
    `;

      const sessionUserJoined = await db.sequelize.query(query, {
        type: QueryTypes.SELECT,
      });

      return res.status(HttpCodes.OK).json({ sessionUserJoined });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const getParticipants = async (req, res) => {
    const { topics, userId, num, page, order } = req.query;

    try {
      let where = {
        [Op.and]: [{ attendedToConference: 1 }],
      };

      if (topics && userId) {
        where[Op.and].push(
          { topicsOfInterest: { [Op.overlap]: topics } },
          { id: { [Op.ne]: userId } }
        );
      }

      let participants = await User.findAll({
        where,
        order: order ? [order] : [[Sequelize.fn("RANDOM")]],
        limit: +num,
      });

      return res.status(HttpCodes.OK).json({ participants });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const remove = async (req, res) => {
    const { id } = req.params;

    if (id) {
      try {
        await AnnualConference.destroy({
          where: {
            id,
          },
        });

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
      .json({ msg: "Bad Request: id is wrong" });
  };

  const recommendedAgenda = async (req, res) => {
    const { topics, time } = req.query;

    try {
      let timeLeft = +time;

      const where = `WHERE public."AnnualConferences".categories && ARRAY[${topics.map(
        (topic) => `'${topic}'`
      )}]::VARCHAR(255)[]`;

      const query = `
      SELECT public."AnnualConferences".*, public."Instructors".id as instructorId, public."Instructors"."name", public."Instructors"."link" as linkSpeaker, 
        public."Instructors".image, public."Instructors"."description" as descriptionSpeaker
        FROM public."AnnualConferences"
        LEFT JOIN public."Instructors" ON public."Instructors".id = ANY (public."AnnualConferences".speakers::int[]) ${where} ORDER BY random()`;

      const sessions = await db.sequelize.query(query, {
        type: QueryTypes.SELECT,
      });

      const recommendedAgenda = [];

      for (const session of sessions) {
        const startTime = moment(session.startTime);
        const endTime = moment(session.endTime);
        const duration = moment.duration(endTime.diff(startTime));

        if (duration.asHours() < timeLeft) {
          recommendedAgenda.push(session);
          timeLeft -= duration.asHours();
        }

        if (timeLeft <= 0) {
          break;
        }
      }

      return res.status(HttpCodes.OK).json({ recommendedAgenda });
    } catch (error) {
      console.log(error);
      res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const sendMessage = (req, res) => {
    const { message } = req.body;
    try {
      socketService().emit(
        SocketEventTypes.SEND_MESSAGE_GLOBAL_CONFERENCE,
        message
      );

      return res.status(HttpCodes.OK).send();
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const getUsersJoinedSession = async (req, res) => {
    try {
      const { id } = req.params;

      const users = await User.findAll({
        where: {
          sessionsJoined: { [Op.overlap]: [id] },
        },
        attributes: ["firstName", "lastName", "email"],
      });

      return res.status(HttpCodes.OK).json({ users });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const claim = async (req, res) => {
    const { id,type } = req.body;
    const { user } = req;

    if (id) {
      try {

        let dataSession

        if(type === '2022' || type === undefined || type === null){
          let { dataValues: session } = await AnnualConference.findOne({
            where: {
              id,
            },
          });

          dataSession = session

          dataSession = {
            ...dataSession,
            shrmCode: dataSession.recertification_credits.match(/\d{2}\-\w{5}/)[0],
            hrciCode: dataSession.recertification_credits.match(/\d{2,8}/)[0],
          };
        }else{
          let { dataValues: session } = await SpeakersPanel.findOne({
            where: {
                id: id,
                visible: true
            },
          });

          dataSession = session

          dataSession = {
            ...dataSession,
            shrmCode: `${dataSession.recertificactionCredits.match(/\d{2}\-\w{5}/)[0]}  
            ${(dataSession.recertificactionCredits.match(/\D{1,10}\d\D{1,3}\d\d\d\d\D/)[0]) ? dataSession.recertificactionCredits.match(/\D{1,10}\d\D{1,3}\d\d\d\d\D/)[0] : ''}`,
            hrciCode: `${dataSession.recertificactionCredits.match(/\d{2,8}/)[0] }
            ${(dataSession.recertificactionCredits.match(/\D{1,10}\d\D{1,3}\d\d\d\d\D/)[0]) ? dataSession.recertificactionCredits.match(/\D{1,10}\d\D{1,3}\d\d\d\d\D/)[0] : ''}`,
          };
        }

        // await HrCredits.create({
        //   email: user.email,
        //   idUser: user.id,
        //   type: 'myLearning',
        //   nameEvent: (type === '2023') ? dataSession.panelName : dataSession.title,
        // });

        let mailOptions = {
          from: process.env.SEND_IN_BLUE_SMTP_SENDER,
          to: user.email,
          subject: LabEmails.LIBRARY_CLAIM.subject((type === '2023') ? dataSession.panelName : dataSession.title),
          html: LabEmails.LIBRARY_CLAIM.body(user, dataSession, type),
        };

        // console.log(mailOptions);

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
      .json({ msg: "Bad Request: Conference library id is wrong" });
  };

  const saveForLater = async (req, res) => {
    const { id } = req.params;
    const { UserId, status } = req.body;

    try {
      const session = await AnnualConference.findOne({
        where: {
          id,
        },
      });

      if (!session) {
        return res
          .status(HttpCodes.BAD_REQUEST)
          .json({ msg: "Session not found." });
      }

      const [numberOfAffectedRows, affectedRows] =
        await AnnualConference.update(
          {
            saveForLater:
              status === "saved"
                ? Sequelize.fn(
                    "array_append",
                    Sequelize.col("saveForLater"),
                    UserId
                  )
                : Sequelize.fn(
                    "array_remove",
                    Sequelize.col("saveForLater"),
                    UserId
                  ),
          },
          {
            where: {
              id,
            },
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

  const markAsViewed = async (req, res) => {
    const { id, UserId, mark } = req.body;

    if (id) {
      try {
        let prevSession = await AnnualConference.findOne({
          where: { id },
        });

        const [numberOfAffectedRows, affectedRows] =
          await AnnualConference.update(
            {
              viewed: { ...prevSession.viewed, [UserId]: mark },
              saveForLater: Sequelize.fn(
                "array_remove",
                Sequelize.col("saveForLater"),
                UserId
              ),
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
    }
    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: Session not found" });
  };

  const downloadICS = async (req, res) => {
    const { id } = req.params;
    const { userTimezone } = req.query;

    try {
      const annualConference = await AnnualConference.findOne({
        where: { id },
      });

      if (!annualConference) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
      const timezone = TimeZoneList.find(
        (timezone) =>
          timezone.value === annualConference.timezone ||
          timezone.text === annualConference.timezone
      );

      let targetBonfireStartDate = moment(annualConference.startTime)
        .tz(timezone.utc[0])
        .utcOffset(timezone.offset, true);

      let targetBonfireEndDate = moment(annualConference.endTime)
        .tz(timezone.utc[0])
        .utcOffset(timezone.offset, true);

      targetBonfireStartDate = convertToLocalTime(targetBonfireStartDate);
      targetBonfireEndDate = convertToLocalTime(targetBonfireEndDate);

      let startDate = targetBonfireStartDate.format("YYYY-MM-DD");

      let endDate = targetBonfireEndDate.format("YYYY-MM-DD");

      const startTime = targetBonfireStartDate.format("HH:mm:ss");

      const endTime = targetBonfireEndDate.format("HH:mm:ss");

      let formatStartDate = moment(`${startDate}  ${startTime}`);

      let formatEndDate = moment(`${endDate}  ${endTime}`);

      startDate = formatStartDate.format("YYYY-MM-DD h:mm a");

      endDate = formatEndDate.format("YYYY-MM-DD h:mm a");

      const localTimezone = moment.tz.guess();

      const calendarInvite = smtpService().generateCalendarInvite(
        startDate,
        endDate,
        annualConference.title,
        annualConference.description,
        "https://www.hackinghrlab.io/global-conference",
        // event.location,
        `${process.env.DOMAIN_URL}${annualConference.id}`,
        "hacking Lab HR",
        process.env.SEND_IN_BLUE_SMTP_SENDER,
        localTimezone
      );

      let icsContent = calendarInvite.toString();
      icsContent = icsContent.replace(
        "BEGIN:VEVENT",
        `METHOD:REQUEST\r\nBEGIN:VEVENT`
      );

      res.setHeader("Content-Type", "application/ics; charset=UTF-8;");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${encodeURIComponent(annualConference.title)}.ics`
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

  return {
    create,
    getAll,
    getSessionsUser,
    getSessionsUserJoined,
    getUsersJoinedSession,
    getParticipants,
    get,
    update,
    remove,
    sendMessage,
    recommendedAgenda,
    claim,
    saveForLater,
    markAsViewed,
    downloadICS,
  };
};

module.exports = AnnualConferenceController;
