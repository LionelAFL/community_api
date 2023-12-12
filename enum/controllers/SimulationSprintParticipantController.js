const db = require("../models");
const HttpCodes = require("http-codes");
const moment = require("moment-timezone");
const smtpService = require("../services/smtp.service");
const { LabEmails } = require("../enum");

const SimulationSprintParticipant = db.SimulationSprintParticipant;
const SimulationSprint = db.SimulationSprint;
const User = db.User;

const SimulationSprintParticipantController = () => {
  /**
   * Create a skill cohort participant
   * @param {*} req
   * @param {*} res
   */
  const create = async (req, res) => {
    const { SimulationSprintId } = req.body;
    const { user } = req;

    try {
      const simulationSprint = await SimulationSprint.findOne({
        where: {
          id: SimulationSprintId,
        },
      });

      const userFound = await User.findOne({
        where: {
          id: user.id,
        },
      });

      if (!userFound) {
        return res
          .status(HttpCodes.BAD_REQUEST)
          .json({ msg: "user not found" });
      }

      if (userFound.memberShip !== "premium") {
        return res.status(HttpCodes.BAD_REQUEST).json({
          msg: "You have to be a premium user to join the simulations ",
        });
      }

      if (simulationSprint) {
        const simulationSprintParticipantExist =
          await SimulationSprintParticipant.findOne({
            where: {
              SimulationSprintId,
              UserId: user.id,
            },
          });

        if (simulationSprintParticipantExist) {
          return res.status(HttpCodes.BAD_REQUEST).json({
            msg: "Bad Request: You have already joined this Simulation Sprint.",
          });
        }
        const simulationSprintParticipant =
          await SimulationSprintParticipant.create({
            ...req.body,
          });

        if (simulationSprintParticipant) {
          const mailOptions = {
            from: process.env.SEND_IN_BLUE_SMTP_SENDER,
            to: user.email,
            subject: LabEmails.JOIN_SIMULATION_SPRINT.subject(
              user.firstName,
              simulationSprint.title
            ),
            html: LabEmails.JOIN_SIMULATION_SPRINT.body(
              user.firstName,
              simulationSprint.title,
              moment(simulationSprint.startDate).format("LL"),
              moment(simulationSprint.endDate).format("LL")
            ),
          };

          const userUpdated = await User.increment(
            {
              simulationSprintsAvailable: -1,
            },
            {
              where: {
                id: user.id,
              },
            }
          );

          await smtpService().sendMailUsingSendInBlue(mailOptions);

          return res
            .status(HttpCodes.OK)
            .json({ simulationSprintParticipant, userUpdated });
        }

        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "BSomething Went Wrong" });
      } else {
        return res
          .status(HttpCodes.BAD_REQUEST)
          .json({ msg: "Bad Request: Simulation Sprint not found." });
      }
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal server error",
        error,
      });
    }
  };

  const getParticipantsBySimulationSprint = async (req, res) => {
    const { SimulationSprintId } = req.params;
    try {
      const simulationSprintParticipants =
        await SimulationSprintParticipant.findAll({
          where: {
            SimulationSprintId,
          },
          include: [
            {
              model: User,
              attributes: ["firstName", "lastName", "email", "img"],
            },
          ],
        });

      return res.status(HttpCodes.OK).json({ simulationSprintParticipants });
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal Server error",
        error,
      });
    }
  };

  return {
    create,
    getParticipantsBySimulationSprint,
  };
};

module.exports = SimulationSprintParticipantController;
