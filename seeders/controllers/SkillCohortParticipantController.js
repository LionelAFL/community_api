const db = require("../models");
const HttpCodes = require("http-codes");
const smtpService = require("../services/smtp.service");
const { LabEmails } = require("../enum");
const moment = require("moment");

const SkillCohortParticipant = db.SkillCohortParticipant;
const SkillCohort = db.SkillCohort;
const User = db.User;

const SkillCohortParticipantController = () => {
  /**
   * Create a skill cohort participant
   * @param {*} req
   * @param {*} res
   */
  const create = async (req, res) => {
    const { SkillCohortId, UserId } = req.body;
    const { user } = req;

    try {
      const hasProjectXFreeTrial = user.projectXFreeTrialAvailability;
      const isUserPremium = user.memberShip === "premium";

      if (hasProjectXFreeTrial || isUserPremium) {
        const skillCohortParticipant = await SkillCohortParticipant.create({
          SkillCohortId,
          UserId,
        });
        const skillCohort = await SkillCohort.findOne({
          where: {
            id: SkillCohortId,
          },
        });

        if (hasProjectXFreeTrial) {
          await User.update(
            {
              projectXFreeTrialAvailability: false,
            },
            {
              where: {
                id: user.id,
              },
            }
          );
        }

        if (skillCohort) {
          const startDate = moment(skillCohort.startDate).format("LL");
          const mailOptions = {
            from: process.env.SEND_IN_BLUE_SMTP_SENDER,
            to: user.email,
            subject: LabEmails.JOIN_COHORT_EMAIL.subject(
              skillCohort,
              startDate
            ),
            html: LabEmails.JOIN_COHORT_EMAIL.body(
              user,
              skillCohort,
              startDate
            ),
          };

          await smtpService().sendMailUsingSendInBlue(mailOptions);

          return res.status(HttpCodes.OK).json({ skillCohortParticipant });
        }

        return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
          msg: "Internal server error",
        });
      } else {
        return res
          .status(HttpCodes.FORBIDDEN)
          .json({ msg: "Your one-time free trial is consumed." });
      }
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal server error",
        error,
      });
    }
  };

  /**
   * Get a skill cohort participant
   * @param {*} req
   * @param {*} res
   */
  const get = async (req, res) => {
    const { skillCohortId, userId } = req.params;

    try {
      const skillCohortParticipant = await SkillCohortParticipant.findOne({
        where: {
          SkillCohortId: skillCohortId,
          UserId: userId,
        },
      });

      if (!skillCohortParticipant) {
        return res.status(HttpCodes.BAD_REQUEST).json({
          msg: "Bad Request: Skill Cohort Participant not found.",
        });
      }

      return res.status(HttpCodes.OK).json({ skillCohortParticipant });
    } catch (error) {
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal server error",
        error,
      });
    }
  };

  /**
   * Get all skill cohort participants
   * @param {*} req
   * @param {*} res
   */
  const getAll = async (req, res) => {
    const { SkillCohortId } = req.params;

    let where = {};
    try {
      if (SkillCohortId) {
        where = {
          SkillCohortId,
        };
      }

      const allSkillCohortParticipants = await SkillCohortParticipant.findAll({
        where: {
          ...where,
          hasAccess: true,
        },
        include: db.User,
      });

      return res.status(HttpCodes.OK).json({ allSkillCohortParticipants });
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal Server error",
        error,
      });
    }
  };

  /**
   * Get all participants in a skill cohort
   * @param {*} req
   * @param {*} res
   */
  const getParticipantInAllCohortById = async (req, res) => {
    const { userId } = req.params;

    let where = {};
    try {
      if (userId) {
        where = {
          UserId: userId,
          hasAccess: "TRUE",
        };
      }

      const allSkillCohortParticipants = await SkillCohortParticipant.findAll({
        where,
        include: db.User,
      });

      return res.status(HttpCodes.OK).json({ allSkillCohortParticipants });
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal Server error",
        error,
      });
    }
  };

  /**
   * Get each of all skill cohort participants by the given skill cohort resources
   * @param {*} skillCohortResources
   */
  const getAllParticipantsByListOfSkillCohortResources = async (
    skillCohortResources
  ) => {
    const participants = skillCohortResources.map((resource) => {
      const id = resource.SkillCohortId;

      return SkillCohortParticipant.findAll({
        where: {
          SkillCohortId: id,
          hasAccess: "TRUE",
        },
        include: [
          {
            model: db.User,
          },
          {
            model: db.SkillCohort,
          },
        ],
      });
    });

    return Promise.all(participants);
  };

  /**
   * Get all participants by the list of skill cohort
   * @param {*} allSkillCohorts
   */
  const getAllParticipantsByListOfSkillCohort = async (allSkillCohorts) => {
    const participants =
      allSkillCohorts.map((skillCohort) => {
        return SkillCohortParticipant.findAll({
          where: {
            SkillCohortId: skillCohort.id,
            hasAccess: "TRUE",
          },
          include: db.User,
          raw: true,
          nest: true,
        });
      }) || [];

    return Promise.all(participants);
  };

  /**
   * Increment comment strike
   * @param {*} participant
   * @param {*} SkillCohortId
   */
  const incrementCommentStrike = async (participant, SkillCohortId) => {
    try {
      await SkillCohortParticipant.increment(
        {
          numberOfCommentStrike: +1,
        },
        {
          where: {
            SkillCohortId,
            id: participant.id,
          },
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Increment assessment strike
   * @param {*} participant
   * @param {*} SkillCohortId
   */
  const incrementAssessmentStrike = async (participant, SkillCohortId) => {
    try {
      await SkillCohortParticipant.increment(
        {
          numberOfAssessmentStrike: +1,
        },
        {
          where: {
            SkillCohortId,
            id: participant.id,
          },
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Remove participant access
   * @param {*} participant
   * @param {*} SkillCohortId
   */
  const removeParticipantAccess = async (participant, SkillCohortId) => {
    try {
      await SkillCohortParticipant.update(
        {
          hasAccess: "FALSE",
        },
        {
          where: {
            SkillCohortId,
            id: participant.id,
          },
        }
      );

      const skillCohort = await SkillCohort.findOne({
        where: {
          id: SkillCohortId,
        },
      });

      const mailOptions = {
        from: process.env.SEND_IN_BLUE_SMTP_SENDER,
        to: participant.User.email,
        subject: LabEmails.KICK_OUT.subject(skillCohort),
        html: LabEmails.KICK_OUT.body(participant.User, skillCohort),
        contentType: "text/html",
      };

      return smtpService().sendMailUsingSendInBlue(mailOptions);
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Reset strike counters
   */
  const resetCounter = async () => {
    try {
      SkillCohortParticipant.update(
        {
          numberOfCommentStrike: 0,
          numberOfAssessmentStrike: 0,
        },
        {
          where: {
            hasAccess: "TRUE",
          },
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Withdraw participation
   * @param {*} req
   * @param {*} res
   */
  const withdrawParticipation = async (req, res) => {
    const { SkillCohortParticipantId } = req.params;

    try {
      const participant = await SkillCohortParticipant.findOne({
        where: {
          id: SkillCohortParticipantId,
        },
        include: [
          {
            model: db.User,
          },
          {
            model: db.SkillCohort,
          },
        ],
      });

      if (!participant) {
        return res.status(HttpCodes.BAD_REQUEST).json({
          msg: "User not found.",
          error,
        });
      }

      await SkillCohortParticipant.destroy({
        where: {
          id: participant.id,
        },
      });

      const mailOptions = {
        from: process.env.SEND_IN_BLUE_SMTP_SENDER,
        to: participant.User.email,
        subject: LabEmails.WITHDRAW_PARTICIPATION.subject(
          participant.SkillCohort
        ),
        html: LabEmails.WITHDRAW_PARTICIPATION.body(participant.User),
        contentType: "text/html",
      };

      await smtpService().sendMailUsingSendInBlue(mailOptions);

      return res.status(HttpCodes.OK).json({});
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal server error",
        error,
      });
    }
  };

  const exportAllSkillCohortParticipantData = async (req, res) => {
    try {
      const participants = await SkillCohortParticipant.findAll({
        attributes: [],
        include: [
          {
            model: db.SkillCohort,
            attributes: ["title", "id", "startDate"],
          },
          {
            model: db.User,
            attributes: ["firstName", "lastName", "id", "email"],
          },
        ],
        raw: true,
        nest: true,
      });

      return res.status(HttpCodes.OK).json({ participants });
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal server error",
        error,
      });
    }
  };

  return {
    create,
    get,
    getAll,
    getAllParticipantsByListOfSkillCohortResources,
    getParticipantInAllCohortById,
    getAllParticipantsByListOfSkillCohort,
    incrementCommentStrike,
    removeParticipantAccess,
    resetCounter,
    incrementAssessmentStrike,
    withdrawParticipation,
    exportAllSkillCohortParticipantData,
  };
};

module.exports = SkillCohortParticipantController;
