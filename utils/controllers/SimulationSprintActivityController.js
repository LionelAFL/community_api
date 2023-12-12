const db = require("../models");
const moment = require("moment-timezone");
const HttpCodes = require("http-codes");
const smtpService = require("../services/smtp.service");

const SimulationSprintActivity = db.SimulationSprintActivity;

const SimulationSprintActivityController = () => {
  /**
   * Create resources
   * @param {*} req
   * @param {*} res
   */
  const create = async (req, res) => {
    const { body } = req;

    try {
      const simulationSprintActivity = await SimulationSprintActivity.create({
        ...body,
      });

      return res.status(HttpCodes.OK).json({ simulationSprintActivity });
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal server error",
        error,
      });
    }
  };

  /**
   * Get all resources
   * @param {*} req
   * @param {*} res
   */
  const getAll = async (req, res) => {
    const { id: SimulationSprintId } = req.params;

    try {
      const simulationSprintActivities = await SimulationSprintActivity.findAll(
        {
          where: {
            SimulationSprintId,
          },
          order: [["deliveryDate"]],
        }
      );

      return res.status(HttpCodes.OK).json({ simulationSprintActivities });
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal Server error",
      });
    }
  };

  /**
   * Get resource
   * @param {*} req
   * @param {*} res
   */
  const get = async (req, res) => {
    const { id } = req.params;

    if (id) {
      try {
        const simulationSprintActivity = await SimulationSprintActivity.findOne(
          {
            where: {
              id,
            },
          }
        );

        if (!simulationSprintActivity) {
          return res.status(HttpCodes.BAD_REQUEST).json({
            msg: "Bad Request: Simulation Sprint Acitvity not found.",
          });
        }

        return res.status(HttpCodes.OK).json({ simulationSprintActivity });
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error." });
      }
    }
  };

  /**
   * Update a resource
   * @param {*} req
   * @param {*} res
   */
  const update = async (req, res) => {
    const { id } = req.params;

    if (id) {
      try {
        const [numberOfAffectedRows, affectedRows] =
          await SimulationSprintActivity.update(
            { ...req.body },
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
  };

  /**
   * Remove a resource
   * @param {*} req
   * @param {*} res
   */
  const remove = async (req, res) => {
    const { id } = req.params;

    if (id) {
      try {
        await SimulationSprintActivity.destroy({
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
      .json({ msg: "Bad Request: Simulation Sprint Resource id is wrong." });
  };

  const downloadICS = async (req, res) => {
    const { id } = req.params;
    const { userTimezone } = req.query;

    try {
      const simulationSprintActivity = await SimulationSprintActivity.findOne({
        where: {
          id,
        },
      });

      if (!simulationSprintActivity) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }

      let time = moment(simulationSprintActivity.deliveryDate).format(
        "YYYY-MM-DD"
      );

      const calendarInvite = smtpService().generateCalendarInvite(
        time,
        time,
        simulationSprintActivity.title,
        "",
        "https://www.hackinghrlab.io/",
        // event.location,
        `${process.env.DOMAIN_URL}`,
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
        `attachment; filename=${encodeURIComponent(
          simulationSprintActivity.title
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

  return {
    create,
    getAll,
    get,
    remove,
    update,
    downloadICS,
  };
};

module.exports = SimulationSprintActivityController;
