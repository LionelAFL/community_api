const db = require("../models");
const HttpCodes = require("http-codes");
const { Op, Sequelize } = require("sequelize");
const { uniqBy } = require("lodash");

const SkillCohortResourceResponse = db.SkillCohortResourceResponse;
const SkillCohortResponseAssessment = db.SkillCohortResponseAssessment;

const SkillCohortResourceResponseController = () => {
  /**
   * Create skill cohort response
   * @param {*} req
   * @param {*} res
   */
  const create = async (req, res) => {
    const { body } = req;
    const { resourceId: SkillCohortResourceId } = req.params;

    try {
      const skillCohortResourceResponse =
        await SkillCohortResourceResponse.create({
          ...body,
          SkillCohortResourceId,
          include: [
            {
              model: db.SkillCohortParticipant,
              include: [
                {
                  model: db.User,
                },
              ],
            },
            {
              model: db.SkillCohortResponseAssessment,
              separate: true,
              include: [
                {
                  model: db.SkillCohortParticipant,
                  include: [
                    {
                      model: db.User,
                    },
                  ],
                },
              ],
            },
          ],
        });

      return res.status(HttpCodes.OK).json({ skillCohortResourceResponse });
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal server error",
        error,
      });
    }
  };

  /**
   * Get skill cohort response
   * @param {*} req
   * @param {*} res
   */
  const get = async (req, res) => {
    const {
      resourceId: SkillCohortResourceId,
      participantId: SkillCohortParticipantId,
    } = req.params;

    try {
      const skillCohortResourceResponse =
        await SkillCohortResourceResponse.findOne({
          where: {
            SkillCohortParticipantId,
            SkillCohortResourceId,
          },
        });

      return res.status(HttpCodes.OK).json({ skillCohortResourceResponse });
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal server error",
        error,
      });
    }
  };

  /**
   * Get all skill cohort response except the current user's response
   * @param {*} req
   * @param {*} res
   */
  const getAllExceptCurrentUser = async (req, res) => {
    const { resourceId: SkillCohortResourceId, participantId } = req.params;

    try {
      let initialSkillCohortResourceResponses =
        await SkillCohortResponseAssessment.findAll({
          where: {
            SkillCohortResourceId,
            SkillCohortParticipantId: participantId,
          },
          include: {
            model: SkillCohortResourceResponse,
          },
        });

      const limit = 5 - initialSkillCohortResourceResponses.length;

      initialSkillCohortResourceResponses =
        initialSkillCohortResourceResponses.map((responses) => {
          return responses.dataValues.SkillCohortResourceResponse;
        });

      let allSkillCohortResourceResponses =
        await SkillCohortResourceResponse.findAll({
          where: {
            SkillCohortResourceId,
            SkillCohortParticipantId: {
              [Op.ne]: participantId,
            },
          },
          order: [[Sequelize.fn("RANDOM")]],
          limit: limit,
        });

      allSkillCohortResourceResponses = [
        ...initialSkillCohortResourceResponses,
        ...allSkillCohortResourceResponses,
      ];

      allSkillCohortResourceResponses = uniqBy(
        allSkillCohortResourceResponses,
        "id"
      );

      console.log(allSkillCohortResourceResponses);
      return res.status(HttpCodes.OK).json({ allSkillCohortResourceResponses });
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal server error",
        error,
      });
    }
  };

  /**
   * Update skill cohort response
   * @param {*} req
   * @param {*} res
   */
  const update = async (req, res) => {
    const { responseId } = req.params;
    const { body } = req;

    try {
      const skillCohortResourceResponse =
        await SkillCohortResourceResponse.findOne({
          where: {
            id: responseId,
          },
        });

      if (!skillCohortResourceResponse) {
        return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
          msg: "Internal server error",
          error,
        });
      }

      const [numberOfAffectedRows, affectedRows] =
        await SkillCohortResourceResponse.update(body, {
          where: {
            id: responseId,
          },
          plain: true,
          returning: true,
        });

      return res
        .status(HttpCodes.OK)
        .json({ numberOfAffectedRows, affectedRows });
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal server error",
        error,
      });
    }
  };

  /**
   * Check if participant has responded to a daily resource
   * @param {*} skillCohort
   * @param {*} participant
   */
  const checkIfParticipantHasRespondedToTheResource = async (
    skillCohort,
    participant
  ) => {
    const SkillCohortResourceId = skillCohort.SkillCohortResources.id;
    const SkillCohortParticipantId = participant.id;

    try {
      const resourceResponse = await SkillCohortResourceResponse.findOne({
        where: {
          SkillCohortResourceId,
          SkillCohortParticipantId,
        },
      });

      if (!resourceResponse) {
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
    get,
    getAllExceptCurrentUser,
    update,
    checkIfParticipantHasRespondedToTheResource,
  };
};

module.exports = SkillCohortResourceResponseController;
