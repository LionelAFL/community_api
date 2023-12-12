const db = require("../models");
const HttpCodes = require("http-codes");
const { Op } = require("sequelize");
const { LabEmails, TimeZoneList } = require("../enum");
const smtpService = require("../services/smtp.service");
const moment = require("moment-timezone");
const { convertToCertainTime, convertToLocalTime } = require("../utils/format");
const { isEmpty } = require("lodash");
const path = require("path")
const fs = require("fs")
const {formatExcelUsers} = require("../utils/formatExportUsersExcel.js")
const {formatExcelPanels} = require("../utils/formatExportPanelsExcel.js")
const socketService = require("../services/socket.service");
const SocketEventType = require("../enum/SocketEventTypes");
const sendInBlueService = require("../services/sendinblue.service");
const {
  convertJSONToExcelPanelsCouncil,
} = require("../utils/format");

const CouncilEvent = db.CouncilEvent;
const CouncilEventPanel = db.CouncilEventPanel;
const CouncilEventPanelist = db.CouncilEventPanelist;
const Event = db.Event;
const User = db.User;
const CouncilEventPanelComment = db.CouncilEventPanelComment;
const EmailDraftChannel = db.EmailDraftChannel

const CouncilEventController = () => {
  const createOrEditConcil = async (req, res) => {
    const data = req.body;

    try {
      if (data.isEdit === false) {
        const councilEvent = await db.sequelize.transaction(async (t) => {

          const councilEvent = await CouncilEvent.create({
            eventName: data.eventName,
            startDate: data.startDate,
            endDate: data.endDate,
            description: data.description,
            numberOfPanels: data.numberOfPanels,
            timezone: data.timezone,
            maxNumberOfPanelsUsersCanJoin: data.maxNumberOfPanelsUsersCanJoin,
            status: data.status,
            linkComments: data.link,
            relationEventAdmin: data.relationEventAdmin,
          });

          if(data.relationEventAdmin !== undefined && data.relationEventAdmin !== -1 && data.relationEventAdmin !== '-1'){
            await Event.update({
                relationEventCouncil: councilEvent.id 
              },
              {where:{
                id: data.relationEventAdmin
              }}
            )
          }

          if (data.panels[0] === undefined) {
            const isPanelFull =
              data.panels.length > +councilEvent.numberOfPanels;

            if (isPanelFull) {
              throw new Error();
            }
          }

          if (data.panels[0] === undefined) {
            const _councilEventPanels = await CouncilEventPanel.findAll({
              where: {
                CouncilEventId: councilEvent.id,
              },
            });

            const _councilEventPanelIds = _councilEventPanels.map(
              (panel) => panel.id
            );
            const councilEventPanelIds = data.panels.map((panel) => panel.id);

            const councilEventPanelIdDiff = _councilEventPanelIds.filter(
              (id) => !councilEventPanelIds.includes(id)
            );

            await CouncilEventPanel.destroy({
              where: {
                id: councilEventPanelIdDiff,
              },
            });
          }

          const councilEventPanels = await data.panels?.map(async (panel) => {
            return await CouncilEventPanel.create({
              CouncilEventId: councilEvent.id,
              panelName: panel.panelName,
              panelStartAndEndDate: data.panelStartAndEndDate,
              numberOfPanelists: panel.numberOfPanelists,
              linkToJoin: panel.linkToJoin,
              startDate: panel.startDate,
              endDate: panel.endDate,
              typePanel: panel.type,
              descriptionPanel: panel.descriptionPanel,
              hrCreditsBoolean: panel.hrCreditsBoolean,
              typeHrCredits: panel.typeHrCredits,
              numberOfHRCredits: panel.numberOfHRCredits,
            });
          });

          if (!isEmpty(councilEventPanels)) {
            await Promise.all(councilEventPanels);
          }

          const _councilEvent = await CouncilEvent.findOne({
            where: {
              id: councilEvent.id,
            },
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
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          });

          return _councilEvent;
        });

        // if (!councilEvent.isEmailSent && councilEvent.status === "active") {
        //   const users = await User.findAll({
        //     where: {
        //       councilMember: "TRUE",
        //     },
        //   });

        //   const timezone = TimeZoneList.find(
        //     (tz) => tz.value === councilEvent.timezone
        //   );

        //   const startDate = moment.utc(councilEvent.startDate);

        //   const endDate = moment.utc(councilEvent.endDate);

        //   const event = {
        //     startDate: startDate.format("LL"),
        //     startTime: startDate.format("HH:mm"),
        //     endDate: endDate.format("LL"),
        //     endTime: endDate.format("HH:mm"),
        //     numberOfPanels: councilEvent.CouncilEventPanels.length,
        //     maxNumberOfPanelsUsersCanJoin:
        //       councilEvent.maxNumberOfPanelsUsersCanJoin,
        //     eventName: councilEvent.eventName,
        //   };

        //   const panels = councilEvent.CouncilEventPanels.map((panel) => {
        //     const startDate = moment.utc(panel.startDate);

        //     return `<p>${startDate.format("LL")} at ${startDate.format(
        //       "HH:mm"
        //     )} (${data.timezone}) : ${panel.panelName}</p>`;
        //   }).join("");

        //   users.forEach((user) => {
        //     const mailOptions = {
        //       from: process.env.SEND_IN_BLUE_SMTP_USER,
        //       to: user.email,
        //       subject:
        //         LabEmails.EMAIL_ALL_COUNCIL_MEMBERS_WHEN_NEW_EVENT_IS_CREATED.subject(
        //           councilEvent.eventName
        //         ),
        //       html: LabEmails.EMAIL_ALL_COUNCIL_MEMBERS_WHEN_NEW_EVENT_IS_CREATED.body(
        //         user.firstName,
        //         event,
        //         panels
        //       ),
        //       contentType: "text/html",
        //     };

        //     smtpService().sendMailUsingSendInBlue(mailOptions);
        //   });

        //   await CouncilEvent.update(
        //     { isEmailSent: "TRUE" },
        //     {
        //       where: {
        //         id: councilEvent.id,
        //       },
        //     }
        //   );
        // }

        return res.status(HttpCodes.OK).json({ councilEvent });
      } else {
        const councilEvent = await db.sequelize.transaction(async (t) => {
          const councilEvent = await CouncilEvent.update(
            {
              eventName: data.eventName,
              startDate: data.startDate,
              endDate: data.endDate,
              description: data.description,
              numberOfPanels: data.numberOfPanels,
              timezone: data.timezone,
              maxNumberOfPanelsUsersCanJoin: data.maxNumberOfPanelsUsersCanJoin,
              status: data.status,
              linkComments: data.link,
              relationEventAdmin: data.relationEventAdmin,
            },
            { where: { id: data.id } }
          );

          if(data.relationEventAdmin !== undefined || data.relationEventAdmin !== -1 || data.relationEventAdmin !== '-1'){
            await Event.update({
                relationEventCouncil: data.id 
              },
              {where:{
                id: data.relationEventAdmin
              }}
            )
          }

          if (data?.panels && data.panels[0] === undefined) {
            const isPanelFull =
              data.panels.length > +councilEvent.numberOfPanels;

            if (isPanelFull) {
              throw new Error();
            }

            const _councilEventPanels = await CouncilEventPanel.findAll({
              where: {
                CouncilEventId: councilEvent.id,
              },
            });

            const _councilEventPanelIds = _councilEventPanels.map(
              (panel) => panel.id
            );
            const councilEventPanelIds = data.panels.map((panel) => panel.id);

            const councilEventPanelIdDiff = _councilEventPanelIds.filter(
              (id) => !councilEventPanelIds.includes(id)
            );

            await CouncilEventPanel.destroy({
              where: {
                id: councilEventPanelIdDiff,
              },
            });
          }

          const councilEventPanels = await data.panels?.map(async (panel) => {
     
            if (panel.id) {
              return await CouncilEventPanel.update(
                {
                  CouncilEventId: data.id,
                  panelName: panel.panelName,
                  panelStartAndEndDate: data.panelStartAndEndDate,
                  numberOfPanelists: panel.numberOfPanelists,
                  linkToJoin: panel.linkToJoin,
                  startDate: panel.startDate,
                  endDate: panel.endDate,
                  typePanel: panel.type,
                  descriptionPanel: panel.descriptionPanel,
                  hrCreditsBoolean: panel.hrCreditsBoolean,
                  typeHrCredits: panel.typeHrCredits,
                  numberOfHRCredits: panel.numberOfHRCredits
                },
                { where: { id: panel.id } }
              );
            } else {
              return await CouncilEventPanel.create({
                CouncilEventId: data.id,
                panelName: panel.panelName,
                panelStartAndEndDate: data.panelStartAndEndDate,
                numberOfPanelists: panel.numberOfPanelists,
                linkToJoin: panel.linkToJoin,
                startDate: panel.startDate,
                endDate: panel.endDate,
                typePanel: panel.type,
                descriptionPanel: panel.descriptionPanel,
                hrCreditsBoolean: panel.hrCreditsBoolean,
                typeHrCredits: panel.typeHrCredits,
                numberOfHRCredits: panel.numberOfHRCredits
              });
            }
          });

          if (!isEmpty(councilEventPanels)) {
            await Promise.all(councilEventPanels);
          }

          const _councilEvent = await CouncilEvent.findOne({
            where: {
              id: data.id,
            },
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
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          });

          return _councilEvent;
        });

        // if (!councilEvent.isEmailSent && councilEvent.status === "active") {
        //   const users = await User.findAll({
        //     where: {
        //       councilMember: "TRUE",
        //     },
        //   });

        //   const timezone = TimeZoneList.find(
        //     (tz) => tz.value === councilEvent.timezone
        //   );

        //   const startDate = moment.utc(councilEvent.startDate);
        //   const endDate = moment.utc(councilEvent.endDate);

        //   const event = {
        //     startDate: startDate.format("LL"),
        //     startTime: startDate.format("HH:mm"),
        //     endDate: endDate.format("LL"),
        //     endTime: endDate.format("HH:mm"),
        //     numberOfPanels: councilEvent.CouncilEventPanels.length,
        //     maxNumberOfPanelsUsersCanJoin:
        //       councilEvent.maxNumberOfPanelsUsersCanJoin,
        //     eventName: councilEvent.eventName,
        //   };

        //   const panels = councilEvent.CouncilEventPanels.map((panel) => {
        //     const startDate = moment.utc(panel.startDate);

        //     return `<p>${startDate.format("LL")} at ${startDate.format(
        //       "HH:mm"
        //     )} (${data.timezone}) : ${panel.panelName}</p>`;
        //   }).join("");

        //   users.forEach((user) => {
        //     const mailOptions = {
        //       from: process.env.SEND_IN_BLUE_SMTP_USER,
        //       to: user.email,
        //       subject:
        //         LabEmails.EMAIL_ALL_COUNCIL_MEMBERS_WHEN_NEW_EVENT_IS_CREATED.subject(
        //           councilEvent.eventName
        //         ),
        //       html: LabEmails.EMAIL_ALL_COUNCIL_MEMBERS_WHEN_NEW_EVENT_IS_CREATED.body(
        //         user.firstName,
        //         event,
        //         panels
        //       ),
        //       contentType: "text/html",
        //     };

        //     smtpService().sendMailUsingSendInBlue(mailOptions);
        //   });

        //   await CouncilEvent.update(
        //     { isEmailSent: "TRUE" },
        //     {
        //       where: {
        //         id: councilEvent.id,
        //       },
        //     }
        //   );
        // }

        return res.status(HttpCodes.OK).json({ councilEvent });
      }
    } catch (err) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const getAll = async (req, res) => {
    try {
      let councilEvents = await CouncilEvent.findAll({
        order: [[CouncilEventPanel, "startDate", "ASC"]],
        include: [
          {
            model: CouncilEventPanel,
            include: [
              {
                model: CouncilEventPanelComment,
                separate: true,
                order: [["createdAt", "ASC"]],
                include: [
                  {
                    model: CouncilEventPanelist,
                    duplicating: true,
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

      return res.status(HttpCodes.OK).json({ councilEvents });
    } catch (err) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const destroy = async (req, res) => {
    const { id } = req.params;

    try {
      await CouncilEvent.destroy({
        where: {
          id,
        },
      });

      const councilEvents = await CouncilEvent.findAll({
        order: [[CouncilEventPanel, "startDate", "ASC"]],
        include: [
          {
            model: CouncilEventPanel,
            include: [
              {
                model: CouncilEventPanelComment,
                separate: true,
                order: [["createdAt", "ASC"]],
                include: [
                  {
                    model: CouncilEventPanelist,
                    duplicating: true,
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
                        ],
                      },
                    ],
                  },
                ],
              },
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
                    ],
                  },
                ],
              },
            ],
          },
        ],
      });

      return res.status(HttpCodes.OK).json({ councilEvents });
    } catch (err) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const joinCouncilEventPanelist = async (req, res) => {
    const {
      councilEventPanelId,
      status,
      UserId,
      isAddedByAdmin,
      isModerator,
      councilEventId,
    } = req.body;
    const { userTimezone } = req.query;
    const { role } = req.user.dataValues;

    try {
      if (status === "Join") {

        const councilEventPanel = await CouncilEventPanel.findOne({
          where: {
            id: councilEventPanelId,
          },
          include: [
            {
              model: CouncilEvent,
            },
          ],
        });

        let newArrayt = [];

        councilEventPanel.dataValues.arrayControlIdsEvents.forEach((data,index) => {
          if(Number(data.id) !== Number(UserId)){
            newArrayt.push(`{\"firstName\":\"${data.firstName}\",\"img\":\"${data.img}\",\"titleProfessions\":\"${data.titleProfessions}\",\"lastName\":\"${data.lastName}\",\"abbrName\":\"${data.abbrName}\",\"id\":\"${data.id}\"}`)
          }
        })

        await CouncilEventPanel.update({ 
            arrayControlIdsEvents: newArrayt
        },{where: {id: councilEventPanelId}})

        if (!isAddedByAdmin) {
          const councilEventPanelistsCount = await CouncilEventPanelist.count({
            where: {
              CouncilEventPanelId: councilEventPanelId,
              isAddedByAdmin: "FALSE",
            },
          });

          const isFull =
            councilEventPanelistsCount >= councilEventPanel.numberOfPanelists;

          if (isFull) {
            return res
              .status(HttpCodes.INTERNAL_SERVER_ERROR)
              .json({ msg: "Internal server error" });
          }
        }

        const councilEvent = await CouncilEvent.findOne({
          where: {
            id: councilEventPanel.CouncilEvent.id,
          },
          include: [
            {
              model: CouncilEventPanel,
              include: [
                {
                  attributes: [],
                  model: CouncilEventPanelist,
                  where: {
                    UserId,
                  },
                },
              ],
            },
          ],
        });

        const maxNumberOfPanelsUsersCanJoin =
          councilEvent?.maxNumberOfPanelsUsersCanJoin || 0;

        const hasExceededMaxNumberOfPanelsUsersCanJoin =
          (councilEvent?.CouncilEventPanels?.length || 0) >=
          maxNumberOfPanelsUsersCanJoin;

        if(role !== 'admin'){
          if (hasExceededMaxNumberOfPanelsUsersCanJoin) {
            return res.status(HttpCodes.ACCEPTED).json({
              msg: `You can only join up to ${maxNumberOfPanelsUsersCanJoin} panels.`,
            });
          }
        }

        await CouncilEventPanelist.create({
          CouncilEventPanelId: councilEventPanelId,
          UserId,
          isModerator,
          isAddedByAdmin: !!isAddedByAdmin,
          CouncilEventId: councilEvent.id,
        });

        const user = await User.findOne({
          attributes: ["timezone", "firstName", "email"],
          where: {
            id: UserId,
          },
        });

        const startTime = councilEventPanel.startDate;
        const endTime = councilEventPanel.endDate;

        const convertedStartTime = convertToLocalTime(
          startTime,
          councilEventPanel.CouncilEvent.timezone,
          userTimezone
        );

        const convertedEndTime = convertToLocalTime(
          endTime,
          councilEventPanel.CouncilEvent.timezone,
          userTimezone
        );

        let icsContent;

        if (!isAddedByAdmin) {
          const calendarInvite = smtpService().generateCalendarInvite(
            convertedStartTime,
            convertedEndTime,
            councilEventPanel.panelName,
            `Link to join: ${councilEventPanel.linkToJoin}`,
            "",
            // event.location,
            "",
            "Hacking HR",
            process.env.FEEDBACK_EMAIL_CONFIG_SENDER,
            userTimezone
          );

          icsContent = calendarInvite.toString();
          icsContent = icsContent.replace(
            "BEGIN:VEVENT",
            `METHOD:REQUEST\r\nBEGIN:VEVENT`
          );
        }

        const event = {
          startDate: moment(councilEvent.startDate).format("LL"),
          endDate: moment(councilEvent.endDate).format("LL"),
          eventName: councilEvent.eventName,
        };

        const panel = {
          panelName: councilEventPanel.panelName,
          startDate: convertedStartTime.format("LL"),
          endDate: convertedEndTime.format("LL"),
          startTime: convertedStartTime.format("HH:mm"),
          endTime: convertedEndTime.format("HH:mm"),
          linkToJoin: councilEventPanel.linkToJoin,
        };

        let mailOptions = {
          // from: "hackinghrlab@gmail.com",
          from: process.env.SEND_IN_BLUE_SMTP_USER,
          to: user.email,
          subject: LabEmails.COUNCIL_EVENT_JOIN.subject(
            user.firstName,
            councilEventPanel.panelName,
            councilEvent.eventName
          ),
          html: isAddedByAdmin
            ? LabEmails.COUNCIL_EVENT_JOIN.addedByAdminBody(
                user.firstName,
                event,
                panel,
                councilEventPanel.CouncilEvent.timezone
              )
            : LabEmails.COUNCIL_EVENT_JOIN.body(
                user.firstName,
                event,
                panel,
                userTimezone
              ),
          contentType: "text/calendar",
        };

        // // user joined, not added
        // if (!isAddedByAdmin) {
        //   mailOptions["attachments"] = [
        //     {
        //       filename: `${councilEventPanel.panelName}.ics`,
        //       content: icsContent,
        //       contentType: "application/ics; charset=UTF-8; method=REQUEST",
        //       contentDisposition: "inline",
        //     },
        //   ];
        // }

        smtpService().sendMailUsingSendInBlue(mailOptions);

        const councilEventPanelist = await CouncilEventPanelist.findOne({
          where: {
            CouncilEventPanelId: councilEventPanelId,
            UserId,
          },
          include: [
            {
              model: User,
              attributes: [
                "id",
                "firstName",
                "lastName",
                "titleProfessions",
                "img",
              ],
            },
          ],
        });

        if (!isEmpty(councilEventPanelist)) {
          const transformedCouncilEventPanelist = {
            ...councilEventPanelist.toJSON(),
            CouncilEventId: councilEvent.id,
            isJoining: true,
          };

          socketService().emit(
            SocketEventType.UPDATE_COUNCIL_EVENT_PANEL,
            transformedCouncilEventPanelist
          );
        }
      } else {
        await CouncilEventPanelist.destroy({
          where: {
            UserId,
            CouncilEventPanelId: councilEventPanelId,
          },
        });

        socketService().emit(SocketEventType.UPDATE_COUNCIL_EVENT_PANEL, {
          UserId,
          CouncilEventPanelId: councilEventPanelId,
          CouncilEventId: councilEventId,
        });
      }

      return res.status(HttpCodes.OK).json({});
    } catch (err) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const downloadICS = async (req, res) => {
    const { id } = req.params;
    const { userTimezone } = req.query;

    try {
      let councilEventPanel = await CouncilEventPanel.findOne({
        where: { id },
        include: [
          {
            model: CouncilEvent,
          },
        ],
      });

      if (!councilEventPanel) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }

      const _userTimezone = TimeZoneList.find((item) =>
        item.utc.includes(userTimezone)
      );

      const timezone = TimeZoneList.find(
        (tz) => tz.value === councilEventPanel.CouncilEvent.timezone
      );
      const offset = timezone.offset;

      let startTime = councilEventPanel.startDate;
      let endTime = councilEventPanel.endDate;

      startTime = convertToCertainTime(
        moment(startTime),
        councilEventPanel.CouncilEvent.timezone
      );
      endTime = convertToCertainTime(
        moment(endTime),
        councilEventPanel.CouncilEvent.timezone
      );

      startTime = convertToLocalTime(moment(startTime).utcOffset(offset, true));
      endTime = convertToLocalTime(moment(endTime).utcOffset(offset, true));

      const calendarInvite = smtpService().generateCalendarInvite(
        startTime,
        endTime,
        councilEventPanel.panelName,
        "",
        "",
        // event.location,
        "",
        "Hacking HR",
        process.env.FEEDBACK_EMAIL_CONFIG_SENDER,
        _userTimezone.utc[0]
      );

      let icsContent = calendarInvite.toString();
      icsContent = icsContent.replace(
        "BEGIN:VEVENT",
        `METHOD:REQUEST\r\nBEGIN:VEVENT`
      );

      console.log(icsContent, "bruv");

      res.setHeader("Content-Type", "application/ics; charset=UTF-8;");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${encodeURIComponent(
          councilEventPanel.panelName
        )}.ics`
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

  const removePanelist = async (req, res) => {
    const { CouncilEventPanelistId, CouncilEventPanelId } = req.params;

    try {
      const councilEventPanelist = await CouncilEventPanelist.findOne({
        where: {
          id: CouncilEventPanelistId,
        },
        include: [
          {
            model: CouncilEventPanel,
          },
        ],
      });

      if (!councilEventPanelist) {
        console.log(err);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }

      await CouncilEventPanelist.destroy({
        where: {
          id: CouncilEventPanelistId,
        },
      });

      socketService().emit(SocketEventType.UPDATE_COUNCIL_EVENT_PANEL, {
        UserId: councilEventPanelist.UserId,
        CouncilEventPanelId: councilEventPanelist.CouncilEventPanelId,
        CouncilEventId: councilEventPanelist.CouncilEventPanel.CouncilEventId,
      });

      return res.status(HttpCodes.OK).json({});
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const search = async (req, res) => {
    const { keyword } = req.query;

    let where = {};

    try {
      if (keyword) {
        where = {
          [Op.or]: [
            {
              firstName: {
                [Op.iLike]: `%${keyword}%`,
              },
            },
            {
              lastName: {
                [Op.iLike]: `%${keyword}%`,
              },
            },
            {
              email: {
                [Op.iLike]: `%${keyword}%`,
              },
            },
          ],
        };

        const users = await User.findAll({
          where,
          attributes: ["id", "firstName", "lastName", "email"],
        });

        return res.status(HttpCodes.OK).json({ users });
      }

      return res.status(HttpCodes.OK).json({ users: [] });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const upsertComment = async (req, res) => {
    const data = req.body;
    try {
      const [upsertedCouncilEventPanelComment, _] =
        await CouncilEventPanelComment.upsert(data);

      const councilEventPanelComment = await CouncilEventPanelComment.findOne({
        order: [["createdAt", "ASC"]],
        where: {
          id: upsertedCouncilEventPanelComment.id,
        },
        include: [
          {
            model: CouncilEventPanelist,
            attributes: ["id"],
            include: [
              {
                model: User,
                attributes: [
                  "id",
                  "firstName",
                  "lastName",
                  "titleProfessions",
                  "img",
                ],
              },
            ],
          },
        ],
      });

      const councilEvent = await CouncilEvent.findOne({
        attributes: ["id", "eventName"],
        include: [
          {
            model: CouncilEventPanel,
            attributes: [],
            where: {
              id: councilEventPanelComment.CouncilEventPanelId,
            },
          },
        ],
      });

      const payload = {
        ...councilEventPanelComment.toJSON(),
        CouncilEventId: councilEvent.id,
      };

      if (!isEmpty(payload)) {
        socketService().emit(
          SocketEventType.UPDATE_COUNCIL_EVENT_COMMENTS,
          payload
        );
      }

      const user = await CouncilEventPanelist.findAll({
        where: {
          CouncilEventPanelId: data.CouncilEventPanelId,
          isModerator: true,
        },
      });

      if (user[0] !== undefined) {
        if (user.length === 1) {
          const Moderador = await User.findOne({
            attributes: ["firstName", "email"],
            where: {
              id: user[0].dataValues.UserId,
            },
          });

          let mailOptions = {
            // from: "hackinghrlab@gmail.com",
            from: process.env.SEND_IN_BLUE_SMTP_USER,
            to: Moderador.dataValues.email,
            subject: LabEmails.NOTICE_NEW_MESSAGE_MODERATOR.subject(
              Moderador.dataValues.firstName,
              councilEvent.dataValues.eventName
            ),
            html: LabEmails.NOTICE_NEW_MESSAGE_MODERATOR.message(
              payload.CouncilEventPanelist.User.firstName,
              payload.CouncilEventPanelist.User.lastName
            ),
            contentType: "text/calendar",
          };

          smtpService().sendMailUsingSendInBlue(mailOptions);
        }
        if (user.length > 1) {
          for (let i = 0; i < user.length; i++) {
            const Moderador = await User.findOne({
              attributes: ["firstName", "email"],
              where: {
                id: user[i].dataValues.UserId,
              },
            });

            let mailOptions = {
              // from: "hackinghrlab@gmail.com",
              from: process.env.SEND_IN_BLUE_SMTP_USER,
              to: Moderador.dataValues.email,
              subject: LabEmails.NOTICE_NEW_MESSAGE_MODERATOR.subject(
                Moderador.dataValues.firstName,
                councilEvent.dataValues.eventName
              ),
              html: LabEmails.NOTICE_NEW_MESSAGE_MODERATOR.message(
                payload.CouncilEventPanelist.User.firstName,
                payload.CouncilEventPanelist.User.lastName
              ),
              contentType: "text/calendar",
            };

            smtpService().sendMailUsingSendInBlue(mailOptions);
          }
        }
      }

      return res.status(HttpCodes.OK).json({});
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const reminderToAddQuestionAWeekBeforeTheEvent = async () => {
    const aWeekLaterStartOfHour = moment.utc().startOf("hour").add(1, "week");

    try {
      const councilEvents = await CouncilEvent.findAll({
        where: {
          status: "active",
          startDate: aWeekLaterStartOfHour.format(
            "YYYY-MM-DD HH:mm:ss.000 +00:00"
          ),
        },
      });

      councilEvents.forEach(async (councilEvent) => {
        const users = await User.findAll({
          attributes: ["id", "email", "firstName", "lastName"],
          include: [
            {
              model: CouncilEventPanelist,
              required: true,
              include: [
                {
                  model: CouncilEventPanel,
                  required: true,
                  where: {
                    CouncilEventId: councilEvent.id,
                  },
                },
              ],
            },
          ],
        });
        
        const timeZone = searchTimeZone(councilEvent.timezone)

        const eventStartDate = moment.utc(councilEvent.startDate);
        const eventEndDate = moment.utc(councilEvent.endDate);

        transformedEvent = {
          startDate: eventStartDate.format("LL"),
          startTime: eventStartDate.format("HH:mm a"),
          endDate: eventEndDate.format("LL"),
          endTime: eventEndDate.format("HH:mm a"),
          eventName: councilEvent.eventName,
        };

        users.forEach((user) => {
          const panelists = user.CouncilEventPanelists;

          let transformedPanels = panelists
            .reverse()
            .map((panelist) => {
              const panel = panelist.CouncilEventPanel;

              const startDate = moment.utc(panel.startDate);
              const endDate = moment.utc(panel.endDate);

              const transformedPanels = `<p>${
                panel.panelName
              } on ${startDate.format("LL")} at ${startDate.format(
                "HH:mm a"
              )} until ${endDate.format("LL")} at ${endDate.format(
                "HH:mm a"
              )} (Time zone: ${timeZone})</p>`;

              return transformedPanels;
            })
            .join("");

          const mailOptions = {
            from: process.env.SEND_IN_BLUE_SMTP_USER,
            to: user.email,
            subject:
              LabEmails.REMINDER_TO_ADD_QUESTION_ONE_WEEK_BEFORE_THE_EVENT.subject(
                councilEvent.eventName
              ),
            html: LabEmails.REMINDER_TO_ADD_QUESTION_ONE_WEEK_BEFORE_THE_EVENT.body(
              user.firstName,
              councilEvent.eventName,
              {
                eventCouncilStartDate: transformedEvent.startDate,
                eventCouncilStartTime: transformedEvent.startTime,
                eventCouncilEndDate: transformedEvent.endDate,
                eventCouncilEndTime: transformedEvent.endTime,
              },
              transformedPanels,
              councilEvent.linkComments,
              panelists.length
            ),
            contentType: "text/html",
          };

          smtpService().sendMailUsingSendInBlue(mailOptions);
        });
      });
    } catch (error) {
      console.error(error);
    }
  };

  const remindToAddQuestionsAndRemindTheEventStartsTomorrow = async () => {

    try {
      const councilEvents = await CouncilEvent.findAll({
        where: {
          status: "active",
        },
      });

      councilEvents.forEach(async (event) => {
        const users = await User.findAll({
          attributes: ["id", "email", "firstName", "lastName"],
          include: [
            {
              model: CouncilEventPanelist,
              required: true,
              include: [
                {
                  model: CouncilEventPanel,
                  required: true,
                  where: {
                    CouncilEventId: event.id,
                  },
                },
              ],
            },
          ],
        });

        const timezone = searchTimeZone(event.timezone)

        users.forEach((user) => {
          const panelists = user.CouncilEventPanelists;

          const firstPanelList = (panelistD) => {
            return panelistD.sort((a, b) => {
              const panela = a.CouncilEventPanel;
              const panelb = b.CouncilEventPanel

              const astartDate = moment.utc(panela.startDate);
              const bstartDate = moment.utc(panelb.startDate);

              let aTime = moment(astartDate, "YYYYMMDDHHmm").format("YYYYMMDDHHmm")
              let bTime = moment(bstartDate, "YYYYMMDDHHmm").format("YYYYMMDDHHmm")
        
              return Number(aTime) - Number(bTime)
        
            })
          }

          let transformedPanels = panelists
            .reverse()
            .map((panelist) => {
              const panel = panelist.CouncilEventPanel;

              const startDate = moment.utc(panel.startDate);
              const endDate = moment.utc(panel.endDate);

              const transformedPanels = `<p>${
                panel.panelName
              } on ${startDate.format("LL")} at ${startDate.format(
                "HH:mm a"
              )} until ${endDate.format("LL")} at ${endDate.format(
                "HH:mm a"
              )} (Time zone: ${timezone})</p>`;

              return transformedPanels;
            })
            .join("");

          let bulSendEmail = verificateTime(firstPanelList(panelists)[0])

          if(bulSendEmail){
            const mailOptions = {
                from: process.env.SEND_IN_BLUE_SMTP_USER,
                to: user.email,
                subject:
                  LabEmails.REMINDER_TO_ADD_QUESTION_ONE_DAY_BEFORE_THE_EVENT.subject(
                    event.eventName
                  ),
                html: LabEmails.REMINDER_TO_ADD_QUESTION_ONE_DAY_BEFORE_THE_EVENT.body(
                  user.firstName,
                  transformedPanels,
                  event.linkComments,
                  panelists.length
                ),
                contentType: "text/html",
              };

              smtpService().sendMailUsingSendInBlue(mailOptions);
          }
        });
      });
    } catch (error) {
      console.error(error);
    }
  };

  const verificateTime = (panelist) => {

    const panel = panelist.CouncilEventPanel;

    const startDate = moment.utc(panel.startDate)?.startOf("hour")?.format('YYYYMMDDHHmm')

    let dateNow = moment.utc().startOf("hour").add(1, "day").format('YYYYMMDDHHmm')

    return Number(dateNow) === Number(startDate)
    
  }

  const remindPanelistOneHourBeforeTheEvent = async () => {
    // const anHourBeforeStartOfHour = moment.utc().startOf("hour").add(1, "hour");

    try {
      const councilEventPanels = await CouncilEventPanel.findAll({
        // where: {
        //   startDate: anHourBeforeStartOfHour.format(
        //     "YYYY-MM-DD HH:mm:ss.000 +00:00"
        //   ),
        // },
        order: [["startDate", "ASC"]],
        include: [
          {
            model: CouncilEvent,
            attributes: ["timezone","linkComments"],
            required: true,
            where: {
              status: "active",
            },
          },
          {
            model: CouncilEventPanelist,
            required: true,
            include: [
              {
                model: User,
                attributes: ["email", "firstName", "lastName"],
              },
            ],
          },
        ],
      });

      const councilEventPanelIds = councilEventPanels.map((panel) => panel.id);

      let councilEventPanelComments = councilEventPanelIds.map((id) =>
        CouncilEventPanelComment.findAll({
          where: {
            CouncilEventPanelId: id,
          },
          order: [["createdAt", "ASC"]],
          include: [
            {
              model: CouncilEventPanelist,
              include: [
                {
                  model: User,
                  attributes: ["firstName", "lastName", "email"],
                },
              ],
            },
          ],
        })
      );

      councilEventPanelComments = await Promise.all(councilEventPanelComments);

      if (!isEmpty(councilEventPanels)) {

        councilEventPanels.forEach(async (panel, index) => {

          const panelists = panel.CouncilEventPanelists;
          const event = panel.CouncilEvent;
          let transformedComments;

          let bulSendEmail = verificateTime2(panel,event.timezone)

          if (!isEmpty(councilEventPanelComments)) {
            transformedComments = councilEventPanelComments[index].map(
              (comment) => {
                const user = comment.CouncilEventPanelist.User;

                return `<li>${user.firstName} ${user.lastName}: ${comment.comment}</li>`;
              }
            );
          } else {
            transformedComments = [];
          }

          const transformedPanel = {
            linkToJoin: panel.linkToJoin,
            panelName: panel.panelName,
            startTime: `${
              moment
                .utc(panel.startDate)
                .format("HH:mm a")} (Time zone: ${event.timezone})`,
          };

          let moderator = panelists.filter((panelist) => panelist.isModerator);

          let moderatorText;

          if (moderator !== undefined) {
            moderatorText = `The moderator for your panel is:`;
            moderator.forEach((moderato, index) => {
              if (index === 0) {
                moderatorText = `${moderatorText} ${moderato.User.firstName} ${moderato.User.lastName}`;
              } else {
                moderatorText = `${moderatorText}, ${moderato.User.firstName} ${moderato.User.lastName}`;
              }
            });
          } else {
            moderatorText = ``;
          }

          if(bulSendEmail){
            panelists.forEach((panelist) => {
              const user = panelist.User;

              const mailOptions = {
                from: process.env.SEND_IN_BLUE_SMTP_SENDER,
                to: user.email,
                subject:
                  LabEmails.REMIND_PANELIST_ONE_HOUR_BEFORE_THE_EVENT_AND_ATTACH_ALL_COMMENTS.subject(
                    panel.panelName
                  ),
                html: LabEmails.REMIND_PANELIST_ONE_HOUR_BEFORE_THE_EVENT_AND_ATTACH_ALL_COMMENTS.body(
                  user.firstName,
                  transformedPanel,
                  transformedComments.join(""),
                  moderatorText,
                  panel.linkToJoin
                ),
                contentType: "text/html",
              };

              smtpService().sendMailUsingSendInBlue(mailOptions);
            });
          }
        });
      }
    } catch (error) {
      console.error(error);
    }
  };
  
  const searchTimeZone = (timezone) => {
    let currentTimezone = TimeZoneList.find((item) => item.value === timezone);

    if (currentTimezone) {
      currentTimezone = currentTimezone.utc[0];
    } else {
      currentTimezone = timezone;
    }

    return currentTimezone
  }

  const verificateTime2 = (panel,timezone) => {

    const startDate = moment.utc(panel.startDate)?.startOf("hour")?.format('YYYYMMDDHHmm')

    let dateNow = moment(moment.utc().startOf("hour").add(1, "hour").tz(searchTimeZone(timezone)))?.format('YYYYMMDDHHmm')

    return Number(dateNow) === Number(startDate)
    
  }

  const sendDailyCommentToModerator = async () => {
    try {
      const dayBeforeStartOfDay = moment()
        .tz("America/Los_Angeles")
        .startOf("day")
        .subtract(1, "day");
      const dayBeforeEndOfDay = moment()
        .tz("America/Los_Angeles")
        .endOf("day")
        .subtract(1, "day");

      const councilEventPanels = await CouncilEventPanel.findAll({
        where: {
          startDate: {
            [Op.gt]: moment().tz("America/Los_Angeles").format(),
          },
        },
        order: [
          ["createdAt", "ASC"],
          [CouncilEventPanelComment, "createdAt", "ASC"],
        ],
        include: [
          {
            model: CouncilEvent,
            attributes: [],
            required: true,
            where: {
              status: "active",
            },
          },
          {
            model: CouncilEventPanelComment,
            required: true,
            where: {
              [Op.and]: [
                {
                  createdAt: {
                    [Op.gte]: dayBeforeStartOfDay,
                  },
                },
                {
                  createdAt: {
                    [Op.lte]: dayBeforeEndOfDay,
                  },
                },
              ],
            },
            include: [
              {
                model: CouncilEventPanelist,
                include: [
                  {
                    model: User,
                    attributes: ["firstName", "lastName"],
                  },
                ],
              },
            ],
          },
        ],
      });

      const councilEventPanelIds = councilEventPanels.map((panel) => panel.id);

      let councilEventPanelModerators = councilEventPanelIds.map((id) => {
        return CouncilEventPanelist.findAll({
          where: {
            CouncilEventPanelId: id,
            isModerator: "TRUE",
          },
          include: [
            {
              model: User,
              attributes: ["firstName", "email"],
            },
          ],
        });
      });

      councilEventPanelModerators = await Promise.all(
        councilEventPanelModerators
      );

      councilEventPanels.forEach((panel, index) => {
        const comments = panel.CouncilEventPanelComments.map((comment) => {
          const user = comment.CouncilEventPanelist.User;

          return `<p>${user.firstName} ${user.lastName}: ${comment.comment}</p>`;
        });

        let moderators = councilEventPanelModerators[index];
        moderators = moderators.map(
          (moderator) => moderator.toJSON().User.email
        );

        const mailOptions = {
          from: process.env.SEND_IN_BLUE_SMTP_SENDER,
          to: `${moderators.join(", ")}`,
          subject: LabEmails.SEND_DAILY_COMMENTS_TO_MODERATOR.subject(
            panel.panelName
          ),
          html: LabEmails.SEND_DAILY_COMMENTS_TO_MODERATOR.body(
            comments.join("")
          ),
          contentType: "text/html",
        };

        smtpService().sendMailUsingSendInBlue(mailOptions);
      });
    } catch (error) {
      console.error(error);
    }
  };

  const joinCouncilEventAwaitPanelist = async (req, res) => {
    const {
      councilEventPanelId,
      status,
      UserId,
      isAddedByAdmin,
      isModerator,
      councilEventId,
    } = req.body;

    try {

      let bul = [true]
      let newArray = []

      const councilEventPanelData = await CouncilEventPanel.findOne({
        where: {
          id: councilEventPanelId,
        },
      });

      if (status === "Join") {

        bul = councilEventPanelData.dataValues.arrayControlIdsEvents.map((idArray,index) => {
          if(Number(idArray.id) === Number(UserId.id)){
              return false
          }
        }) 

        if(bul[0] !== false){
          

          if(councilEventPanelData.dataValues.arrayControlIdsEvents[0] === undefined){
            newArray = [`{\"firstName\":\"${UserId.firstName}\",\"img\":\"${UserId.img}\",\"titleProfessions\":\"${UserId.titleProfessions}\",\"lastName\":\"${UserId.lastName}\",\"abbrName\":\"${UserId.abbrName}\",\"id\":\"${UserId.id}\"}`]
          }else{
            let arraUsers = []
            let newNum = 0

            councilEventPanelData.dataValues.arrayControlIdsEvents.forEach((data,index) => {

                newNum = index + 1
                arraUsers[index] = `{\"firstName\":\"${data.firstName}\",\"img\":\"${data.img}\",\"titleProfessions\":\"${data.titleProfessions}\",\"lastName\":\"${data.lastName}\",\"abbrName\":\"${data.abbrName}\",\"id\":\"${data.id}\"}`

            })

            arraUsers[newNum] = `{\"firstName\":\"${UserId.firstName}\",\"img\":\"${UserId.img}\",\"titleProfessions\":\"${UserId.titleProfessions}\",\"lastName\":\"${UserId.lastName}\",\"abbrName\":\"${UserId.abbrName}\",\"id\":\"${UserId.id}\"}`

            newArray = arraUsers
          }

          const [numberOfAffectedRows, affectedRows] = await CouncilEventPanel.update({ 
              arrayControlIdsEvents: newArray
          },{where: {id: councilEventPanelId}})

          await Promise.resolve(
            (() => {
                let mailOptions = {
                from: process.env.SEND_IN_BLUE_SMTP_SENDER,
                to: 'enrique@hackinghr.io',
                subject: LabEmails.COUNCIL_EVENT_AWAIT.subject(councilEventId.eventName),
                html: LabEmails.COUNCIL_EVENT_AWAIT.body(UserId.firstName, councilEventId.eventName, councilEventPanelData.dataValues.panelName, UserId.lastName),
            };
    
            return smtpService().sendMailUsingSendInBlue(mailOptions);

            })()
        );

          return res.status(HttpCodes.OK).json({ numberOfAffectedRows, affectedRows })

        }else{
          return res.status(HttpCodes.BAD_REQUEST).json()
        }

      } else if (status === "Unjoin"){

        newArray = [];

        councilEventPanelData.dataValues.arrayControlIdsEvents.forEach((data,index) => {
          if(Number(data.id) !== Number(UserId.id)){
            newArray.push(`{\"firstName\":\"${data.firstName}\",\"img\":\"${data.img}\",\"titleProfessions\":\"${data.titleProfessions}\",\"lastName\":\"${data.lastName}\",\"abbrName\":\"${data.abbrName}\",\"id\":\"${data.id}\"}`)
          }
        })

        const [numberOfAffectedRows, affectedRows] = await CouncilEventPanel.update({ 
            arrayControlIdsEvents: newArray
        },{where: {id: councilEventPanelId}})

        return res.status(HttpCodes.OK).json({ numberOfAffectedRows, affectedRows })

      }

    } catch (err) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const excelAllPanelsRegisterCouncil = async (req, res) => {
    const {idEvent} = req.params
    try{

      let councilEvents = await CouncilEvent.findOne({
        where: {id: idEvent},
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
                      "firstName",
                      "lastName",
                      "email",
                      "role",
                      "company",
                      "titleProfessions",
                      "about",
                      "about",
                      "timezone",
                      "location",
                      "city",
                      "personalLinks"
                    ],
                  },
                ],
              },
            ],
          },
        ],
      });

      const nombre = moment().format("MM-DD-HH-mm-s")

      await convertJSONToExcelPanelsCouncil(
          nombre,
          formatExcelPanels,
          formatExcelUsers,
          councilEvents.dataValues.CouncilEventPanels.map((panels) => {
              return panels.toJSON()
          })
      );

      await res.status(HttpCodes.OK).download(`${path.join(__dirname, '../utils')}/${nombre}.xlsx`, function(){
          fs.unlinkSync(`${path.join(__dirname, '../utils')}/${nombre}.xlsx`)
      })

    }catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
    }
  }

  const sendEmails = async (req, res) => {

    const { email,firstName,lastName,company,titleProfessions,recentJobLevel,sizeOfOrganization,personalLinks } = req.body;

    try {
      
      await Promise.resolve(
        (() => {
            let mailOptions = {
              from: process.env.SEND_IN_BLUE_SMTP_SENDER,
              to: "enrique@hackinghr.io",
              subject: LabEmails.ADD_EXPERTS_COUNCIL_ENRIQUE.subject(),
              html: LabEmails.ADD_EXPERTS_COUNCIL_ENRIQUE.body(email,firstName,lastName,company,titleProfessions,recentJobLevel,sizeOfOrganization,personalLinks),
            };

            return smtpService().sendMailUsingSendInBlue(mailOptions);
        })()
      );

      await Promise.resolve(
        (() => {
            let mailOptions = {
              from: process.env.SEND_IN_BLUE_SMTP_SENDER,
              to: email,
              subject: LabEmails.ADD_EXPERTS_COUNCIL.subject(),
              html: LabEmails.ADD_EXPERTS_COUNCIL.body(firstName),
            };

            return smtpService().sendMailUsingSendInBlue(mailOptions);
        })()
      );

      return res.status(HttpCodes.OK).json({});
    } catch (err) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  }

  const addDraftEmail = async (req, res) => {

    const { draftEmail } = req.body;

    const { idChannel, name, to, subject, message, id } = draftEmail

    try {

      let draftEmailResponse = undefined

      if(id === -1){

        draftEmailResponse = await EmailDraftChannel.create({
          idChannel,
          name,
          to,
          subject,
          message,
          draft: true,
          type: 'council',
        })

      }else{

        const [numberOfAffectedRows, affectedRows] = await EmailDraftChannel.update({ 
          idChannel,
          name,
          to, 
          subject,
          message,
          draft: true,
          type: 'council',
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
              where: {idChannel: id, draft: true, type: 'council',}
          })

          return res.status(HttpCodes.OK).json({ draftEmailResponse });

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
            where: {send: true, type: 'council',}
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

      const { name, to, subject, message, id } = draftEmail
      try {

          const [numberOfAffectedRows, affectedRows] = await EmailDraftChannel.update({ 
              name,
              to, 
              subject,
              message,
              type: 'council',
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

  const emailAttendee = async (req, res) => {
    const {
      name,
      to,
      subject,
      message,
      test,
      testEmail,
      idChannel,
      id,
    } = req.body

    const userEmail = await User.findAll({
      where: {
        id: to,
      },
      attributes: [
        "email",
        "firstName",
        "dateRenewInvitationEmail",
        "countEmailsSend",
        "id"
      ],
    });

    if(test){

      await Promise.resolve(
        (() => {
            return sendInBlueService().sendNewsLetter(
              LabEmails.ATTENDEE_EVENT.body(message),
              LabEmails.ATTENDEE_EVENT.subject(subject),
              name,
              testEmail,
              true,
              'council'
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
          to,
          subject,
          message,
          draft: false,
          send: true,
          type: 'council',
          date: moment
          .utc(moment().format("YYYY-MM-DD HH:mm"))
          .format()
        })
    
      }else{

        await EmailDraftChannel.update({ 
          name,
          to, 
          subject,
          message,
          draft: false,
          send: true,
          type: 'council',
          date: moment
          .utc(moment().format("YYYY-MM-DD HH:mm"))
          .format()
        },{where: {id: id}})

      }

      await Promise.resolve(
        (() => {
            return sendInBlueService().sendNewsLetter(
              LabEmails.ATTENDEE_EVENT.body(message),
              LabEmails.ATTENDEE_EVENT.subject(subject),
              name,
              userEmail,
              false,
              'council'
            );
        })()
      );

      return res
        .status(HttpCodes.OK)
        .json();
  
    }
      

  };

  const searchUserEvents = async (req, res) => {
    const { id } = req.params;

    try {

      // let query = `
      //   SELECT public."CouncilEvents".id as eventId, public."Users".*
      //   FROM public."Events"
      //   JOIN public."Users" ON public."Users".id = ANY (public."Events".users::int[])
      //   WHERE public."Events".id = ${id};
      // `;

      // const userDataEvent = await db.sequelize.query(query, {
      //   type: QueryTypes.SELECT,
      // });

      // return res.status(HttpCodes.OK).json({ userDataEvent });

    } catch (error) {
        console.log(error);
        return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
    }
  }

  return {
    createOrEditConcil,
    getAll,
    destroy,
    joinCouncilEventPanelist,
    joinCouncilEventAwaitPanelist,
    downloadICS,
    removePanelist,
    search,
    upsertComment,
    reminderToAddQuestionAWeekBeforeTheEvent,
    remindToAddQuestionsAndRemindTheEventStartsTomorrow,
    remindPanelistOneHourBeforeTheEvent,
    sendDailyCommentToModerator,
    excelAllPanelsRegisterCouncil,
    sendEmails,
    addDraftEmail,
    getAllDraftEmail,
    getAllSendEmail,
    editDraftEmail,
    deleteDraftEmail,
    emailAttendee,
    searchUserEvents
  };
};

module.exports = CouncilEventController;
