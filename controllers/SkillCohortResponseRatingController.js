const db = require("../models");
const HttpCodes = require("http-codes");

const SkillCohortResponseRating = db.SkillCohortResponseRating;

const SkillCohortResponseRatingController = () => {
  /**
   * Upsert skill cohort rating
   * @param {*} req
   * @param {*} res
   */
  const upsert = async (req, res) => {
    const { body } = req;

    try {
      const [skillCohortResponseRating, isCreated] =
        await SkillCohortResponseRating.upsert(body, {
          returning: true,
        });

      const allSkillCohortResourceResponseRatings =
        await SkillCohortResponseRating.findAll({
          where: {
            SkillCohortResourceId:
              skillCohortResponseRating.SkillCohortResourceId,
            SkillCohortParticipantId:
              skillCohortResponseRating.SkillCohortParticipantId,
          },
          limit: 5,
        });

      return res
        .status(HttpCodes.OK)
        .json({ allSkillCohortResourceResponseRatings });
    } catch (error) {
      console.error(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal server error",
        error,
      });
    }
  };

  /**
   * Get all rating by id
   * @param {*} req
   * @param {*} res
   */
  const getAllByIds = async (req, res) => {
    const {
      resourceId: SkillCohortResourceId,
      participantId: SkillCohortParticipantId,
    } = req.params;

    try {
      const allSkillCohortResourceResponseRatings =
        await SkillCohortResponseRating.findAll({
          where: {
            SkillCohortResourceId,
            SkillCohortParticipantId,
          },
          limit: 5,
        });

      return res
        .status(HttpCodes.OK)
        .json({ allSkillCohortResourceResponseRatings });
    } catch (error) {
      console.error(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal server error",
        error,
      });
    }
  };

  return {
    upsert,
    getAllByIds,
  };
};

module.exports = SkillCohortResponseRatingController;
