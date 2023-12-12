const db = require("../models");
const HttpCodes = require("http-codes");
const moment = require("moment-timezone");
const fs = require("fs");
const path = require("path");
const { Op, Sequelize } = require("sequelize");
const { LabEmails } = require("../enum");
const {
  convertToLocalTime,
  convertJSONToExcel,
  convertJSONToExcelBonfiresUsersParticipants,
} = require("../utils/format");
const smtpService = require("../services/smtp.service");
const cronService = require("../services/cron.service");
const TimeZoneList = require("../enum/TimeZoneList");
const { googleCalendar, yahooCalendar } = require("../utils/generateCalendars");
const NotificationController = require("./NotificationController");
const { COUNTRIES } = require("../enum/ProfileSettings");

const Bonfire = db.Bonfire;
const User = db.User;
const QueryTypes = Sequelize.QueryTypes;

const validatedUserToInvited = async (user, bonfireToCreate) => {
  const query = `
  SELECT public."Bonfires"."startTime", public."Bonfires"."endTime" FROM public."Users" 
  LEFT JOIN public."Bonfires" ON public."Bonfires".id = ANY (public."Users".bonfires::int[]) 
  WHERE (public."Users"."id" = ${
    user.id
  }) AND (public."Bonfires"."endTime" >= '${moment().utc().format()}')
`;
  try {
    const userBonfires = await db.sequelize.query(query, {
      type: QueryTypes.SELECT,
    });

    for (const bonfire of userBonfires) {
      if (bonfire.startTime === bonfireToCreate.startTime) {
        return null;
      }
    }

    return user;
  } catch (error) {
    console.log(error);
  }
};

const BonfireController = () => {
  const create = async (req, res) => {
    const reqBonfire = req.body;
    const { userTimezone } = reqBonfire;

    try {
      let bonfireInfo = {
        ...reqBonfire,
      };

      let users = await User.findAll({
        where: {
          [Op.and]: [
            { percentOfCompletion: 100 },
            {
              id: {
                [Op.ne]: bonfireInfo.bonfireCreator,
              },
            },
            {
              email: {
                [Op.ne]: "enrique@hackinghr.io",
              },
            },
            {
              topicsOfInterest: {
                [Op.overlap]: bonfireInfo.categories,
              },
            },
          ],
        },
        order: [[Sequelize.fn("RANDOM")]],
        limit: 30,
      });

      let usersValidated = [];

      for (const user of users) {
        const userValidate = await Promise.resolve(
          validatedUserToInvited(user.dataValues, bonfireInfo)
        );

        if (userValidate !== null) usersValidated.push(user);
      }

      const invitedUsers = usersValidated.map((user) => {
        return user.dataValues.id;
      });

      const userAlwaysInvited = await User.findOne({
        where: { email: "enrique@hackinghr" },
      });

      if (userAlwaysInvited?.dataValues?.id) {
        invitedUsers.push(userAlwaysInvited.dataValues.id);
        usersValidated.push(userAlwaysInvited);
      }

      bonfireInfo = {
        ...bonfireInfo,
        invitedUsers,
      };

      const bonfire = await Bonfire.create(bonfireInfo);

      const { dataValues: bonfireCreatorInfo } = await User.findOne({
        where: {
          id: bonfireInfo.bonfireCreator,
        },
      });

      await User.update(
        {
          bonfires: Sequelize.fn(
            "array_append",
            Sequelize.col("bonfires"),
            bonfire.id
          ),
        },
        {
          where: { id: bonfireInfo.bonfireCreator },
          returning: true,
          plain: true,
        }
      );

      await User.increment(
        {
          pointsConferenceLeaderboard: 500,
        },
        {
          where: { id: bonfireInfo.bonfireCreator },
        }
      );

      let startTime = convertToLocalTime(
        bonfire.dataValues.startTime,
        bonfire.timezone,
        userTimezone
      );
      let endTime = convertToLocalTime(
        bonfire.dataValues.endTime,
        bonfire.timezone,
        userTimezone
      );

      await Promise.resolve(
        (() => {
          let mailOptions = {
            from: process.env.SEND_IN_BLUE_SMTP_SENDER,
            to: bonfireCreatorInfo.email,
            subject: LabEmails.BONFIRE_CREATOR.subject(
              bonfireCreatorInfo.firstName
            ),
            html: LabEmails.BONFIRE_CREATOR.body(
              bonfireCreatorInfo.firstName,
              bonfire,
              startTime.format("MMM DD"),
              startTime.format("h:mm a"),
              userTimezone
            ),
            contentType: "text/calendar",
          };

          const calendarInvite = smtpService().generateCalendarInvite(
            startTime,
            endTime,
            bonfire.title,
            bonfire.description,
            bonfire.link,
            `${process.env.DOMAIN_URL}${bonfire.id}`,
            "hacking Lab HR",
            process.env.FEEDBACK_EMAIL_CONFIG_SENDER,
            userTimezone
          );

          let icsContent = calendarInvite.toString();
          icsContent = icsContent.replace(
            "BEGIN:VEVENT",
            `METHOD:REQUEST\r\nBEGIN:VEVENT`
          );

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

      await Promise.all(
        usersValidated.map((user) => {
          const _user = user.toJSON();

          let mailOptions = {
            from: process.env.SEND_IN_BLUE_SMTP_SENDER,
            to: _user.email,
            subject: LabEmails.BONFIRE_INVITATION.subject(_user.firstName),
            html: LabEmails.BONFIRE_INVITATION.body(
              _user.firstName,
              bonfire,
              bonfireCreatorInfo,
              moment(bonfire.dataValues.startTime).utc().format("MMM DD"),
              moment(bonfire.dataValues.startTime).utc().format("h:mm a"),
              bonfire.link,
              bonfire.timezone
            ),
            contentType: "text/calendar",
          };
          console.log("***** mailOptions ", mailOptions);

          return smtpService().sendMailUsingSendInBlue(mailOptions);
        })
      );

      const usersReceivingNotification = await User.findAll({
        where: { receiveCommunityNotification: true },
        attributes: ["id"],
      });

      // const usersId = usersReceivingNotification.map((user) => {
      //   return user.dataValues.id;
      // });

      await NotificationController().createNotification({
        message: `New Bonfire "${bonfire.title || bonfire.title}" was created.`,
        type: "Bonfire",
        meta: {
          ...bonfire,
        },
        onlyFor: [-1],
      });

      setOrganizerReminders(bonfire, bonfireCreatorInfo);

      return res.status(HttpCodes.OK).json({ bonfire });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error", error });
    }
  };

  const sendParticipantsListToCreator = async (
    bonfire,
    bonfireCreatorInfo,
    type
  ) => {
    console.log("***************************");
    console.log("************** send email to creator *************");
    console.log("***** bonfire = ", bonfire);
    let targetBonfire = await Bonfire.findOne({ where: { id: bonfire.id } });
    targetBonfire = targetBonfire.toJSON();
    console.log("***** targetBonfire = ", targetBonfire);
    const bonfireUsers = await Promise.all(
      (targetBonfire.joinedUsers || []).map((user) => {
        return User.findOne({
          where: {
            id: user,
          },
        });
      })
    );
    console.log("***** eventUsers = ", bonfireUsers);
    const buffer = await convertJSONToExcel(
      bonfire.title,
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
      bonfireUsers.map((user) => user.toJSON())
    );

    let mailOptions = {
      from: process.env.SEND_IN_BLUE_SMTP_SENDER,
      to: bonfireCreatorInfo.email,
      subject: LabEmails.BONFIRE_REMINDER_1_DAY_BEFORE.subject(
        bonfireCreatorInfo.firstName,
        moment(bonfire.startTime).format("YYYY-MM-DD HH:mm:ss"),
        bonfire.timezone
      ),
      body: LabEmails.BONFIRE_REMINDER_1_DAY_BEFORE.body(),
      attachments: [
        {
          filename: `${bonfire.title}.xls`,
          content: buffer,
        },
      ],
    };

    if (type === "hour") {
      mailOptions = {
        from: process.env.SEND_IN_BLUE_SMTP_SENDER,
        to: bonfireCreatorInfo.email,
        subject: LabEmails.BONFIRE_REMINDER_1_HOUR_BEFORE.subject(
          bonfireCreatorInfo.firstName
        ),
        body: LabEmails.BONFIRE_REMINDER_1_HOUR_BEFORE.body(
          bonfireCreatorInfo.firstName
        ),
        attachments: [
          {
            filename: `${bonfire.title}.xls`,
            content: buffer,
          },
        ],
      };
    }

    console.log("******* start sending email ******");
    console.log("***** mailOptions = ", mailOptions);
    await smtpService().sendMailUsingSendInBlue(mailOptions);

    if (type === "hour") {
      await Promise.all(
        bonfireUsers.map((user) => {
          const _user = user.toJSON();
          let mailOptions = {
            from: process.env.SEND_IN_BLUE_SMTP_SENDER,
            to: _user.email,
            subject: LabEmails.BONFIRE_USERS_JOINED_1_HOUR_REMINDER.subject(
              _user.firstName,
              bonfire.title
            ),
            html: LabEmails.BONFIRE_USERS_JOINED_1_HOUR_REMINDER.body(
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
    }
    console.log("******* end sending email ******");
  };

  const setOrganizerReminders = (bonfire, bonfireCreatorInfo) => {
    const dates1DayBefore = moment(bonfire.startTime).subtract(1, "days");
    const dates1HourBefore = moment(bonfire.startTime).subtract(1, "hours");
    console.log("/////////////////////////////////////////////////////");
    console.log("//////// setOrganizerReminders ///////");

    const interval = `10 ${dates1DayBefore.minutes()} ${dates1DayBefore.hours()} ${dates1DayBefore.date()} ${dates1DayBefore.month()} *`;
    const interval2 = `10 ${dates1HourBefore.minutes()} ${dates1HourBefore.hours()} ${dates1HourBefore.date()} ${dates1HourBefore.month()} *`;

    if (dates1DayBefore.isAfter(moment())) {
      cronService().addTask(
        `${bonfire.id}-users-join-reminder-1-day-before`,
        interval,
        true,
        () => sendParticipantsListToCreator(bonfire, bonfireCreatorInfo, "day")
      );

      cronService().addTask(
        `${bonfire.id}-users-join-reminder-1-hour-before`,
        interval2,
        true,
        () => sendParticipantsListToCreator(bonfire, bonfireCreatorInfo, "hour")
      );
    }
  };

  const getAll = async (req, res) => {
    const { category, date } = req.query;
    const categories = category ? JSON.parse(category) : [];

    try {
      let where = ``;
      if (date) {
        where += `WHERE public."Bonfires"."endTime" >='${date}'`;
      }

      if (categories && categories.length > 0) {
        let categoriesToString = [];

        for (const cat of categories) {
          categoriesToString.push(`'${cat}'`);
        }
        if (where.length > 0) {
          where += `AND public."Bonfires"."categories" && ARRAY[${categoriesToString.join(
            ","
          )}]::VARCHAR(255)[]`;
        } else {
          where += `WHERE public."Bonfires"."categories" && ARRAY[${categoriesToString.join(
            ","
          )}]::VARCHAR(255)[]`;
        }
      }

      const query = `SELECT public."Bonfires".*, public."Users"."id" as "bonfireOrganizerId", public."Users"."firstName", public."Users"."lastName", public."Users"."img",
      public."Users"."company", public."Users"."titleProfessions", public."Users"."personalLinks" FROM public."Bonfires" LEFT JOIN public."Users" ON public."Users".id = public."Bonfires"."bonfireCreator" ${where}`;

      const bonfires = await db.sequelize.query(query, {
        type: QueryTypes.SELECT,
      });

      return res.status(HttpCodes.OK).json({ bonfires });
    } catch (err) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const get = async (req, res) => {
    const { id } = req.params;

    if (id) {
      try {
        let bonfire = await Bonfire.findOne({
          where: {
            id,
          },
        });

        if (!bonfire) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Bad Request: Bonfire not found" });
        }

        return res.status(HttpCodes.OK).json({ bonfire });
      } catch (err) {
        console.log(err);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    }

    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: Bonfire id is wrong" });
  };

  const update = async (req, res) => {
    const { id } = req.params;
    const reqBonfire = req.body;

    if (id) {
      try {
        let bonfireInfo = {
          ...reqBonfire,
        };

        const prevBonfire = await Bonfire.findOne({
          where: {
            id,
          },
        });

        if (!prevBonfire) {
          return res
            .status(HttpCodes.BAD_REQUEST)
            .json({ msg: "Bad Request: Bonfire not found." });
        }

        const usersId = prevBonfire.dataValues.joinedUsers;

        const usersJoinedToBonfire = await Promise.all(
          usersId.map(async (userId) => {
            const { dataValues } = await User.findOne({
              where: { id: userId },
            });
            return dataValues;
          })
        );

        const [numberOfAffectedRows, affectedRows] = await Bonfire.update(
          bonfireInfo,
          {
            where: { id },
            returning: true,
            plain: true,
          }
        );

        await Promise.all(
          usersJoinedToBonfire.map((user) => {
            let mailOptions = {
              from: process.env.SEND_IN_BLUE_SMTP_SENDER,
              to: user.email,
              subject: LabEmails.BONFIRE_EDITED.subject(
                user.firstName,
                affectedRows.dataValues.title
              ),
              html: LabEmails.BONFIRE_EDITED.body(
                user.firstName,
                prevBonfire.dataValues.title,
                affectedRows.dataValues,
                moment(affectedRows.startTime).utc().format("MMM DD"),
                moment(affectedRows.startTime).utc().format("h:mm a"),
                affectedRows.dataValues.timezone
              ),
            };

            console.log("***** mailOptions ", mailOptions);

            return smtpService().sendMailUsingSendInBlue(mailOptions);
          })
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
      .json({ msg: "Bad Request: Bonfire id is wrong" });
  };

  const remove = async (req, res) => {
    const { id } = req.params;

    if (id) {
      try {
        const bonfireToDelete = await Bonfire.findOne({
          where: {
            id,
          },
        });

        if (!bonfireToDelete) {
          return res
            .status(HttpCodes.BAD_REQUEST)
            .json({ msg: "Bad Request: Bonfire not found." });
        }

        const usersId = bonfireToDelete.joinedUsers;

        const usersJoinedToBonfire = await Promise.all(
          usersId.map(async (userId) => {
            const { dataValues } = await User.findOne({
              where: { id: userId },
            });
            return dataValues;
          })
        );

        removeOrganizerReminders(bonfireToDelete);

        await Bonfire.destroy({
          where: {
            id,
          },
        });

        await Promise.all(
          usersId.map((userID) => {
            return User.update(
              {
                bonfires: Sequelize.fn(
                  "array_remove",
                  Sequelize.col("bonfires"),
                  id
                ),
              },
              {
                where: { id: userID },
                returning: true,
                plain: true,
              }
            );
          })
        );

        await Promise.all(
          usersJoinedToBonfire.map((user) => {
            const userTimezone = TimeZoneList.find(
              (timezone) => timezone.value === user.timezone
            );

            const targetBonfireDate = convertToLocalTime(
              bonfireToDelete.startTime,
              bonfireToDelete.timezone,
              userTimezone.utc[0]
            );

            let mailOptions = {
              from: process.env.SEND_IN_BLUE_SMTP_SENDER,
              to: user.email,
              subject: LabEmails.BONFIRE_DELETED.subject(
                user.firstName,
                bonfireToDelete.title
              ),
              html: LabEmails.BONFIRE_DELETED.body(
                user.firstName,
                bonfireToDelete,
                targetBonfireDate.format("MMM DD"),
                targetBonfireDate.format("h:mm a"),
                userTimezone.utc[0]
              ),
            };

            console.log("***** mailOptions ", mailOptions);

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
    }
  };

  const removeOrganizerReminders = (bonfire) => {
    Array.from(Array(5).keys()).forEach((index) => {
      cronService().stopTask(`${bonfire.id}-users-join-reminder-${index}`);
    });
  };

  const inviteUser = async (req, res) => {
    const { id, userId } = req.params;

    try {
      const [numberOfAffectedRowsUser, affectedRowsUser] = await User.update(
        {
          bonfires: Sequelize.fn("array_append", Sequelize.col("bonfires"), id),
        },
        {
          where: { id: userId },
          returning: true,
          plain: true,
        }
      );

      const [numberOfAffectedRowsBonfire, affectedRowsBonfire] =
        await Bonfire.update(
          {
            usersInvitedByOrganizer: Sequelize.fn(
              "array_append",
              Sequelize.col("usersInvitedByOrganizer"),
              userId
            ),
          },
          {
            where: { id },
            returning: true,
            plain: true,
          }
        );

      const { dataValues: bonfireCreatorInfo } = await User.findOne({
        where: {
          id: affectedRowsBonfire.dataValues.bonfireCreator,
        },
      });

      await Promise.resolve(
        (() => {
          const timezone = TimeZoneList.find(
            (timezone) =>
              timezone.value === affectedRowsBonfire.dataValues.timezone ||
              timezone.text === affectedRowsBonfire.dataValues.timezone
          );
          const offset = timezone.offset;
          const _user = affectedRowsUser.dataValues;
          const targetBonfireStartDate = moment(
            affectedRowsBonfire.dataValues.startTime
          )
            .tz(timezone.utc[0])
            .utcOffset(offset, true);

          const targetBonfireEndDate = moment(
            affectedRowsBonfire.dataValues.endTime
          )
            .tz(timezone.utc[0])
            .utcOffset(offset, true);

          const timezoneUser = TimeZoneList.find(
            (timezone) =>
              timezone.value === _user.timezone ||
              timezone.text === _user.timezone
          );

          const googleLink = googleCalendar(
            affectedRowsBonfire.dataValues,
            timezoneUser.utc[0]
          );
          const yahooLink = yahooCalendar(
            affectedRowsBonfire.dataValues,
            timezoneUser.utc[0]
          );

          let mailOptions = {
            from: process.env.SEND_IN_BLUE_SMTP_SENDER,
            to: _user.email,
            subject: LabEmails.BONFIRE_INVITATION.subject,
            html: LabEmails.BONFIRE_INVITATION.body(
              _user,
              affectedRowsBonfire.dataValues,
              bonfireCreatorInfo,
              targetBonfireStartDate.format("MMM DD"),
              targetBonfireStartDate.format("h:mm a"),
              targetBonfireEndDate.format("h:mm a"),
              timezone.value,
              googleLink,
              yahooLink
            ),
          };

          console.log("***** mailOptions ", mailOptions);

          return smtpService().sendMailUsingSendInBlue(mailOptions);
        })()
      );

      return res
        .status(HttpCodes.OK)
        .json({ numberOfAffectedRowsBonfire, affectedRowsBonfire });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const exportUsersToCSV = async (req, res) => {
    const { id } = req.params;

    try {
      let targetBonfire = await Bonfire.findOne({ where: { id } });
      targetBonfire = targetBonfire.toJSON();

      let bonfireUsers = await User.findAll({
        where: {
          bonfires: {
            [Op.overlap]: [id],
          },
        },
      });

      bonfireUsers = bonfireUsers.map((user) => user.toJSON());

      bonfireUsers = bonfireUsers.map((user) => {
        const country = COUNTRIES.find((c) => c.value === user.location);

        return {
          ...user,
          location: country.text || user.location,
        };
      });
      await convertJSONToExcelBonfiresUsersParticipants(
        targetBonfire.title,
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
            label: "Country",
            value: "location",
            width: 20,
          },
          {
            label: "Email",
            value: "email",
            width: 20,
          },
        ],
        bonfireUsers
      );

      await res
        .status(HttpCodes.OK)
        .download(
          `${path.join(__dirname, "../utils")}/${targetBonfire.title}.xlsx`,
          function () {
            fs.unlinkSync(
              `${path.join(__dirname, "../utils")}/${targetBonfire.title}.xlsx`
            );
          }
        );
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const exportParticipantBonfireToCSV = async (req, res) => {
    const { id } = req.params;

    try {
      let targetBonfire = await Bonfire.findOne({ where: { id } });
      targetBonfire = targetBonfire.toJSON();

      let usersId = [
        ...new Set(
          targetBonfire.invitedUsers.concat(targetBonfire.joinedUsers)
        ),
      ];

      let bonfireUsers = await Promise.all(
        usersId.map(async (id) => {
          return await User.findOne({
            where: {
              id,
            },
            attributes: ["id", "firstName", "lastName", "email", "location"],
          });
        })
      );

      bonfireUsers = bonfireUsers
        .filter((user) => user !== null)
        .map((user) => user.toJSON());

      bonfireUsers = bonfireUsers.map((user) => {
        const country = COUNTRIES.find((c) => c.value === user.location);

        const invitedUser = targetBonfire.invitedUsers.includes(user.id)
          ? "Yes"
          : "No";

        const joinedBonfire = targetBonfire.joinedUsers.includes(user.id)
          ? "Yes"
          : "No";

        return {
          ...user,
          location: country.text || user.location,
          invitedUser,
          joinedBonfire,
        };
      });

      await convertJSONToExcelBonfiresUsersParticipants(
        targetBonfire.title,
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
            label: "Country",
            value: "location",
            width: 20,
          },
          {
            label: "Email",
            value: "email",
            width: 20,
          },
          {
            label: "Invited User",
            value: "invitedUser",
            width: 20,
          },
          {
            label: "Confirm Attendance / Joined Bonfire",
            value: "joinedBonfire",
            width: 40,
          },
        ],
        bonfireUsers
      );

      await res
        .status(HttpCodes.OK)
        .download(
          `${path.join(__dirname, "../utils")}/${targetBonfire.title}.xlsx`,
          function () {
            fs.unlinkSync(
              `${path.join(__dirname, "../utils")}/${targetBonfire.title}.xlsx`
            );
          }
        );
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const downloadICS = async (req, res) => {
    const { id } = req.params;
    const { userTimezone } = req.query;

    try {
      const bonfire = await Bonfire.findOne({
        where: { id },
      });

      if (!bonfire) {
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }

      let startTime = convertToLocalTime(
        bonfire.dataValues.startTime,
        bonfire.timezone,
        userTimezone
      );
      let endTime = convertToLocalTime(
        bonfire.dataValues.endTime,
        bonfire.timezone,
        userTimezone
      );

      const calendarInvite = smtpService().generateCalendarInvite(
        startTime,
        endTime,
        bonfire.title,
        bonfire.description,
        bonfire.link,
        // event.location,
        `${process.env.DOMAIN_URL}/bonfires`,
        "hacking Lab HR",
        process.env.FEEDBACK_EMAIL_CONFIG_SENDER,
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
        `attachment; filename=${encodeURIComponent(bonfire.title)}.ics`
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
    get,
    update,
    remove,
    inviteUser,
    exportUsersToCSV,
    exportParticipantBonfireToCSV,
    downloadICS,
  };
};

module.exports = BonfireController;
