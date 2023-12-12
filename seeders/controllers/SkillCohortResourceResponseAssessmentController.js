const db = require("../models");
const HttpCodes = require("http-codes");
const { Op } = require("sequelize");
const { isEmpty } = require("lodash");

const SkillCohortResponseAssessment = db.SkillCohortResponseAssessment;

const SkillCohortResourceResponseAssessmentController = () => {
  /**
   * Create skill cohort assessment
   * @param {*} req
   * @param {*} res
   */
  const create = async (req, res) => {
    const { body } = req;

    try {
      const skillCohortResourceResponseAssessment =
        await SkillCohortResponseAssessment.create({
          ...body,
        });

      return res
        .status(HttpCodes.OK)
        .json({ skillCohortResourceResponseAssessment });
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal server error",
        error,
      });
    }
  };

  /**
   * Get all skill cohort assessment
   * @param {*} req
   * @param {*} res
   */
  const getAllAssessmentByIds = async (req, res) => {
    const {
      resourceId: SkillCohortResourceId,
      participantId: SkillCohortParticipantId,
    } = req.params;

    try {
      const allSkillCohortResourceResponseAssessments =
        await SkillCohortResponseAssessment.findAll({
          where: {
            SkillCohortResourceId,
            SkillCohortParticipantId,
            SkillCohortResourceResponseId: {
              [Op.in]: Object.values(req.query),
            },
          },
        });

      return res
        .status(HttpCodes.OK)
        .json({ allSkillCohortResourceResponseAssessments });
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal server error",
        error,
      });
    }
  };

  /**
   * Update or insert an assessment
   * @param {*} req
   * @param {*} res
   */
  const upsertAssessment = async (req, res) => {
    const { body } = req;

    try {
      const [skillCohortResourceResponseAssessment, isCreated] =
        await SkillCohortResponseAssessment.upsert(body.payload, {
          returning: true,
        });

      const allSkillCohortResourceResponseAssessments =
        await SkillCohortResponseAssessment.findAll({
          where: {
            SkillCohortResourceId:
              skillCohortResourceResponseAssessment.SkillCohortResourceId,
            SkillCohortParticipantId:
              skillCohortResourceResponseAssessment.SkillCohortParticipantId,
          },
        });

      return res
        .status(HttpCodes.OK)
        .json({ allSkillCohortResourceResponseAssessments });
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal server error",
        error,
      });
    }
  };

  /**
   * Check if participant has assessed other comments
   * @param {*} skillCohort
   * @param {*} participant
   */
  const checkIfParticipantHasAssessedOtherComments = async (
    skillCohort,
    participant
  ) => {
    const SkillCohortResourceId = skillCohort.SkillCohortResources.id;
    const SkillCohortParticipantId = participant.id;

    try {
      const allAssessments = await SkillCohortResponseAssessment.findAll({
        where: {
          SkillCohortResourceId,
          SkillCohortParticipantId,
        },
      });

      if (isEmpty(allAssessments) || allAssessments.length === 0) {
        return false;
      }

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  return {
    create,
    getAllAssessmentByIds,
    upsertAssessment,
    checkIfParticipantHasAssessedOtherComments,
  };
};

module.exports = SkillCohortResourceResponseAssessmentController;
