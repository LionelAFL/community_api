const db = require("../models");
const moment = require("moment-timezone");
const HttpCodes = require("http-codes");
const { isValidURL } = require("../utils/profile");
const s3Service = require("../services/s3.service");
const smtpService = require("../services/smtp.service");
const { convertToLocalTime } = require("../utils/format");
const { Op } = require("sequelize");
const cronService = require("../services/cron.service");
const { LabEmails } = require("../enum");

const SimulationSprint = db.SimulationSprint;
const SimulationSprintResource = db.SimulationSprintResource;
const SimulationSprintParticipant = db.SimulationSprintParticipant;
const SimulationSprintGroup = db.SimulationSprintGroup;
const SimulationSprintDeliverable = db.SimulationSprintDeliverable;
const SimulationSprintActivity = db.SimulationSprintActivity;

const User = db.User;

const SimulationSprintController = () => {
  const setSimulationSprintReminders = (simulationSprint) => {
    const dateBefore24Hours = moment(simulationSprint.startDate).subtract(
      1,
      "days"
    );

    const dayStart = moment(simulationSprint.startDate);

    const interval1 = `0 ${dateBefore24Hours.minutes()} ${dateBefore24Hours.hours()} ${dateBefore24Hours.date()} ${dateBefore24Hours.month()} *`;
    const interval2 = `0 ${dayStart.minutes()} ${dayStart.hours()} ${dayStart.date()} ${dayStart.month()} *`;

    console.log("////////////////////////////////////////////");
    console.log("/////// setSimulationSprint //////");

    if (dateBefore24Hours.isAfter(moment())) {
      cronService().addTask(
        `${simulationSprint.id}-24`,
        interval1,
        true,
        async () => {
          let targetSimulationSprint = await SimulationSprint.findOne({
            where: { id: simulationSprint.id },
          });
          targetSimulationSprint = targetSimulationSprint.toJSON();

          const simulationSprintParticipants =
            await SimulationSprintParticipant.findAll({
              where: {
                SimulationSprintId: targetSimulationSprint.id,
              },
              include: [
                {
                  model: User,
                  attributes: ["firstName", "lastName", "email"],
                },
              ],
            });

          await Promise.all(
            simulationSprintParticipants.map((participant) => {
              const _participant = participant.User.toJSON();

              let mailOptions = {
                from: process.env.FEEDBACK_EMAIL_CONFIG_SENDER,
                subject: LabEmails.SIMULATION_SPRINT_REMINDER_24_HOURS.subject(
                  targetSimulationSprint
                ),
                html: LabEmails.SIMULATION_SPRINT_REMINDER_24_HOURS.body(
                  _participant,
                  targetSimulationSprint
                ),
              };

              console.log("***** mailOptions ", mailOptions);

              return smtpService().sendMailUsingSendInBlue(mailOptions);
            })
          );
        }
      );
    }

    if (dayStart.isAfter(moment())) {
      cronService().addTask(
        `${simulationSprint.id}-0`,
        interval2,
        true,
        async () => {
          let targetSimulationSprint = await SimulationSprint.findOne({
            where: { id: simulationSprint.id },
          });
          targetSimulationSprint = targetSimulationSprint.toJSON();

          const simulationSprintParticipants =
            await SimulationSprintParticipant.findAll({
              where: {
                SimulationSprintId: targetSimulationSprint.id,
              },
              include: [
                {
                  model: User,
                  attributes: ["firstName", "lastName", "email"],
                },
              ],
            });

          await Promise.all(
            simulationSprintParticipants.map((participant) => {
              const _participant = participant.User.toJSON();
              let mailOptions = {
                from: process.env.FEEDBACK_EMAIL_CONFIG_SENDER,
                subject: LabEmails.SIMULATION_SPRINT_REMINDER_SAME_DAY.subject(
                  targetSimulationSprint
                ),
                html: LabEmails.SIMULATION_SPRINT_REMINDER_SAME_DAY.body(
                  _participant,
                  targetSimulationSprint
                ),
              };

              console.log("***** mailOptions ", mailOptions);
              return smtpService().sendMailUsingSendInBlue(mailOptions);
            })
          );
        }
      );
    }
  };

  const removeSimulationSprintReminders = (simulationSprintId) => {
    cronService().stopTask(`${simulationSprintId}-24`);
    cronService().stopTask(`${simulationSprintId}-0`);
  };

  const create = async (req, res) => {
    const { body } = req;

    try {
      if (body.image) {
        body.image = await s3Service().getSimulationSprintImageUrl(
          "",
          body.image
        );
      }

      const simulationSprint = await SimulationSprint.create({ ...body });

      setSimulationSprintReminders(simulationSprint);

      return res.status(HttpCodes.OK).json({ simulationSprint });
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal server error",
        error,
      });
    }
  };

  /**
   * Method to get a skill cohort
   * @param {*} req
   * @param {*} res
   */
  const get = async (req, res) => {
    const { id } = req.params;

    if (id) {
      try {
        const simulationSprint = await SimulationSprint.findOne({
          where: {
            id,
          },
          include: [
            {
              model: SimulationSprintDeliverable,
              include: [
                {
                  model: SimulationSprintResource,
                },
              ],
            },
            {
              model: SimulationSprintActivity,
            },
            {
              model: SimulationSprintGroup,
              include: [
                {
                  model: SimulationSprintParticipant,
                },
              ],
            },
            {
              model: SimulationSprintParticipant,
              include: [
                {
                  model: User,
                  attributes: [
                    "firstName",
                    "lastName",
                    "email",
                    "img",
                    "abbrName",
                    "titleProfessions",
                    "company",
                    "personalLinks",
                  ],
                },
              ],
            },
          ],
        });

        if (!simulationSprint) {
          return res
            .status(HttpCodes.BAD_REQUEST)
            .json({ msg: "Bad Request: Simulation Sprint not found." });
        }

        return res.status(HttpCodes.OK).json({ simulationSprint });
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error." });
      }
    }
  };

  /**
   * Method to get all skill cohorts
   * @param {*} req
   * @param {*} res
   */
  const getAll = async (req, res) => {
    const { date } = req.query;
    try {
      const timezone = moment.tz.guess();

      const dateTransform = moment(date).tz(timezone).format();

      let where = {};

      if (date) {
        where = {
          ...where,
          startDate: {
            [Op.gte]: dateTransform,
          },
        };
      }
      const simulationSprints = await SimulationSprint.findAll({
        where,
        order: [["id", "ASC"]],
        include: [
          {
            model: SimulationSprintResource,
          },
          {
            model: SimulationSprintParticipant,
            include: [
              {
                model: User,
                attributes: ["firstName", "lastName", "email"],
              },
            ],
          },
        ],
      });

      return res.status(HttpCodes.OK).json({ simulationSprints });
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal Server error",
        error,
      });
    }
  };

  const getSimulationSprintByUser = async (req, res) => {
    const { user } = req;

    try {
      const simulationSprintofUser = await SimulationSprintParticipant.findAll({
        where: {
          UserId: user.id,
        },
        include: [
          {
            model: SimulationSprint,
          },
        ],
        raw: true,
      });

      return res.status(HttpCodes.OK).json({ simulationSprintofUser });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Something went wrong" });
    }
  };

  const duplicate = async (req, res) => {
    const { simulationSprint } = req.body;
    const { SimulationSprintResources } = simulationSprint;

    try {
      const newSimulationSprint = await SimulationSprint.create(
        simulationSprint
      );

      const tranformedSimulationSprintResources = SimulationSprintResources.map(
        (resource) => ({
          ...resource,
          SimulationSprintId: newSimulationSprint.id,
        })
      );

      await SimulationSprintResource.bulkCreate(
        tranformedSimulationSprintResources
      );

      return res.status(HttpCodes.OK).json({});
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal Server error",
        error,
      });
    }
  };
  /**
   * Method to update a skill cohort
   * @param {*} req
   * @param {*} res
   */
  const update = async (req, res) => {
    const { id } = req.params;

    if (id) {
      try {
        const simulationSprint = await SimulationSprint.findOne({
          where: {
            id,
          },
        });

        if (!simulationSprint) {
          return res
            .status(HttpCodes.BAD_GATEWAY)
            .json({ msg: "Bad Request: Simulation Sprint not found." });
        }

        if (req.body.image && !isValidURL(req.body.image)) {
          req.body.image = await s3Service().getSimulationSprintImageUrl(
            "",
            req.body.image
          );
        }

        const [numberOfAffectedRows, affectedRows] =
          await SimulationSprint.update(req.body, {
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
    }
  };

  /**
   * Method to remove a skill cohort
   * @param {*} req
   * @param {*} res
   */
  const remove = async (req, res) => {
    const { id } = req.params;

    if (id) {
      try {
        await SimulationSprint.destroy({
          where: {
            id,
          },
        });

        removeSimulationSprintReminders(id);

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
      .json({ msg: "Bad Request: Skill Cohort id is wrong." });
  };

  const downloadICS = async (req, res) => {
    const { id } = req.params;
    try {
      const simulationSprint = await SimulationSprint.findOne({
        where: { id },
      });

      if (!simulationSprint) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }

      let startDate = moment(simulationSprint.startDate)
        .tz("America/Los_Angeles")
        .utcOffset(-7, true);

      let endDate = moment(simulationSprint.endDate)
        .tz("America/Los_Angeles")
        .utcOffset(-7, true);

      startDate = convertToLocalTime(startDate);
      endDate = convertToLocalTime(endDate);

      startDate = startDate.format("YYYY-MM-DD h:mm a");

      endDate = endDate.format("YYYY-MM-DD h:mm a");

      const localTimezone = moment.tz.guess();

      const calendarInvite = smtpService().generateCalendarInvite(
        startDate,
        endDate,
        simulationSprint.title,
        simulationSprint.description.html.replace(/<[^>]+>/g, ""),
        "https://www.hackinghrlab.io/simulation-sprints",
        // event.location,
        `${process.env.DOMAIN_URL}/simulation-sprints${simulationSprint.id}`,
        "hacking Lab HR",
        process.env.FEEDBACK_EMAIL_CONFIG_SENDER,
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
        `attachment; filename=${encodeURIComponent(simulationSprint.title)}.ics`
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
    get,
    remove,
    update,
    getAll,
    getSimulationSprintByUser,
    duplicate,
    downloadICS,
  };
};

module.exports = SimulationSprintController;
