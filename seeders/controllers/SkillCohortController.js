const db = require("../models");
const HttpCodes = require("http-codes");
const { isEmpty } = require("lodash");
const { Op } = require("sequelize");
const { isValidURL } = require("../utils/profile");
const s3Service = require("../services/s3.service");
const moment = require("moment-timezone");

const SkillCohort = db.SkillCohort;
const SkillCohortResources = db.SkillCohortResources;
const SkillCohortParticipant = db.SkillCohortParticipant;
const SkillCohortResourceResponse = db.SkillCohortResourceResponse;
const SkillCohortResponseAssessment = db.SkillCohortResponseAssessment;
const User = db.User;

const SkillCohortController = () => {
  /**
   * Method to create skill cohorts
   * @param {*} req
   * @param {*} res
   */
  const create = async (req, res) => {
    const { body } = req;

    try {
      let skillCohortInfo = {
        ...body,
      };

      if (skillCohortInfo.image) {
        skillCohortInfo.image = await s3Service().getSkillCohortImageUrl(
          "",
          skillCohortInfo.image
        );
      }

      const skillCohort = await SkillCohort.create(skillCohortInfo);

      return res.status(HttpCodes.OK).json({ skillCohort });
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
        const skillCohort = await SkillCohort.findOne({
          where: {
            id,
          },
        });

        if (!skillCohort) {
          return res
            .status(HttpCodes.BAD_REQUEST)
            .json({ msg: "Bad Request: Skill Cohort not found." });
        }

        return res.status(HttpCodes.OK).json({ skillCohort });
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error." });
      }
    }
  };

  /**
   * Method to get all upcoming skill cohorts
   * @param {*} req
   * @param {*} res
   */
  const getAllActiveUserSide = async (req, res) => {
    const { filter } = req.query;
    const dateToday = moment()
      .tz("America/Los_Angeles")
      .startOf("day")
      .utc()
      .format("YYYY-MM-DD HH:mm:ssZ");

    const user = req.user;

    let where = {
      startDate: {
        [Op.gt]: dateToday,
      },
    };

    try {
      if (filter && !isEmpty(JSON.parse(filter))) {
        where = {
          ...where,
          categories: {
            [Op.overlap]: JSON.parse(filter),
          },
        };
      }

      let skillCohorts = await SkillCohort.findAll({
        where,
        order: [["startDate", "ASC"]],
      });

      let participatedCohorts = await SkillCohortParticipant.findAll({
        where: {
          UserId: user.id,
        },
        include: {
          model: SkillCohort,
          required: true,
        },
        raw: true,
        nest: true,
      });

      participatedCohorts = participatedCohorts.map((participated) => {
        return participated.SkillCohort;
      });

      skillCohorts = skillCohorts.filter((cohort) => {
        return !participatedCohorts.some((participatedCohort) => {
          return participatedCohort.id === cohort.id;
        });
      });

      return res.status(HttpCodes.OK).json({ skillCohorts });
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal Server error",
        error,
      });
    }
  };

  /**
   * Method to get all skill cohorts
   * @param {*} req
   * @param {*} res
   */
  const getAll = async (req, res) => {
    try {
      const skillCohorts = await SkillCohort.findAll({
        order: [
          ["id", "ASC"],
          [SkillCohortResources, "releaseDate", "ASC"],
        ],
        include: {
          model: SkillCohortResources,
        },
      });

      return res.status(HttpCodes.OK).json({ skillCohorts });
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal Server error",
        error,
      });
    }
  };

  const duplicate = async (req, res) => {
    const { skillCohort, skillCohortResources } = req.body;

    try {
      const newSkillCohort = await SkillCohort.create(skillCohort);

      const transformedSkillCohortResources = skillCohortResources.map(
        (resource) => ({
          ...resource,
          SkillCohortId: newSkillCohort.id,
        })
      );

      await SkillCohortResources.bulkCreate(transformedSkillCohortResources);

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
   * Get all participated cohort
   * @param {*} req
   * @param {*} res
   */
  const getAllOfMyCohort = async (req, res) => {
    const { UserId } = req.params;

    const dateToday = moment()
      .tz("America/Los_Angeles")
      // .startOf("day")
      .utc()
      .format("YYYY-MM-DD HH:mm:ssZ");

    try {
      const allParticipated = await SkillCohortParticipant.findAll({
        where: {
          UserId,
        },
        include: [
          {
            model: SkillCohort,
            // where: {
            //   endDate: {
            //     [Op.gt]: dateToday,
            //   },
            // },
            nest: true,
            required: true,
            include: [
              {
                model: SkillCohortResources,
                attributes: ["id", "title", "releaseDate"],
                where: {
                  SkillCohortId: {
                    [Op.ne]: null,
                  },
                  // releaseDate: {
                  //   [Op.lt]: dateToday,
                  // },
                },
              },
            ],
          },
          {
            model: SkillCohortResourceResponse,
            attributes: [
              "id",
              "SkillCohortResourceId",
              "SkillCohortParticipantId",
            ],
            nest: true,
          },
          {
            model: SkillCohortResponseAssessment,
            attributes: [
              "id",
              "SkillCohortResourceId",
              "SkillCohortParticipantId",
            ],
            nest: true,
          },
        ],
        nest: true,
      });

      const allOfMySkillCohorts = allParticipated.map((participated) => {
        return {
          ...participated.SkillCohort.dataValues,
          ParticipantId: participated.id,
          hasAccess: participated.hasAccess,
          SkillCohortResourceResponses:
            participated.SkillCohortResourceResponses,
          SkillCohortResponseAssessments:
            participated.SkillCohortResponseAssessments,
          hasAccess: participated.hasAccess,
        };
      });

      return res.status(HttpCodes.OK).json({ allOfMySkillCohorts });
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
    const reqSkillCohort = req.body;

    if (id) {
      try {
        const skillCohortInfo = {
          ...reqSkillCohort,
        };

        const fetchedSkillCohort = await SkillCohort.findOne({
          where: {
            id,
          },
        });

        if (!fetchedSkillCohort) {
          return res
            .status(HttpCodes.BAD_GATEWAY)
            .json({ msg: "Bad Request: Skill Cohort not found." });
        }

        if (reqSkillCohort.image && !isValidURL(reqSkillCohort.image)) {
          skillCohortInfo.image = await s3Service().getSkillCohortImageUrl(
            "",
            reqSkillCohort.image
          );

          if (fetchedSkillCohort.image) {
            await s3Service().deleteUserPicture(fetchedSkillCohort.image);
          }
        }

        if (fetchedSkillCohort.image && !reqSkillCohort.image) {
          await s3Service().deleteUserPicture(fetchedSkillCohort.image);
        }

        const [numberOfAffectedRows, affectedRows] = await SkillCohort.update(
          skillCohortInfo,
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
   * Method to remove a skill cohort
   * @param {*} req
   * @param {*} res
   */
  const remove = async (req, res) => {
    const { id } = req.params;
    const user = req.user;

    if (id) {
      try {
        await SkillCohort.destroy({
          where: {
            id,
          },
        });

        let isFreeTrial = user.memberShip === "free";

        if (isFreeTrial) {
          await User.update(
            {
              projectXFreeTrialAvailability: "TRUE",
            },
            {
              where: {
                id: user.id,
              },
            }
          );
        }

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

  /**
   * Method to get all active skill cohort with the associated skill cohort resource
   * @param {DATETIME} passedDate
   */
  const getAllActiveSkillCohortsWithResource = async (passedDate) => {
    try {
      const dateToday = moment()
        .tz("America/Los_Angeles")
        .startOf("day")
        .utc()
        .format("YYYY-MM-DD HH:mm:ssZ");

      const allSkillCohorts = await SkillCohort.findAll({
        where: {
          startDate: {
            [Op.lte]: dateToday,
          },
          endDate: {
            [Op.gte]: dateToday,
          },
        },
        include: {
          model: SkillCohortResources,
          where: {
            releaseDate: passedDate,
            SkillCohortId: {
              [Op.ne]: null,
            },
          },
          required: true,
        },
        raw: true,
        nest: true,
      });

      return allSkillCohorts;
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  /**
   * Get all active skill cohort
   */
  const getAllActiveSkillCohorts = async () => {
    try {
      const dateToday = moment()
        .tz("America/Los_Angeles")
        .startOf("day")
        .utc()
        .format("YYYY-MM-DD HH:mm:ssZ");

      const allSkillCohorts = await SkillCohort.findAll({
        where: {
          startDate: {
            [Op.lte]: dateToday,
          },
          endDate: {
            [Op.gte]: dateToday,
          },
        },
        raw: true,
        nest: true,
      });

      return allSkillCohorts;
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  const getAllActiveSkillCohortsWithParticipants = async () => {
    try {
      const dateToday = moment()
        .tz("America/Los_Angeles")
        .startOf("day")
        .utc()
        .format("YYYY-MM-DD HH:mm:ssZ");

      const allSkillCohorts = await SkillCohort.findAll({
        where: {
          startDate: {
            [Op.lte]: dateToday,
          },
          endDate: {
            [Op.gte]: dateToday,
          },
        },
        include: [
          {
            model: SkillCohortParticipant,
            where: {
              hasAccess: "TRUE",
            },
            required: true,
            include: db.User,
          },
        ],
      });

      return allSkillCohorts;
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  const getAllSkillCohortThatWillStartWeekLater = async () => {
    try {
      const weekLaterDate = moment()
        .tz("America/Los_Angeles")
        .startOf("day")
        .utc()
        .add(1, "week")
        .format("YYYY-MM-DD HH:mm:ssZ");

      const allSkillCohorts = SkillCohort.findAll({
        where: {
          startDate: weekLaterDate,
        },
        include: [
          {
            model: SkillCohortParticipant,
            where: {
              hasAccess: "TRUE",
            },
            required: true,
            include: db.User,
          },
        ],
      });

      return allSkillCohorts;
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  const getAllSkillCohortThatWillStartTomorrow = async () => {
    try {
      const tomorrowDate = moment()
        .tz("America/Los_Angeles")
        .startOf("day")
        .utc()
        .add(1, "day")
        .format("YYYY-MM-DD HH:mm:ssZ");

      const allSkillCohorts = SkillCohort.findAll({
        where: {
          startDate: tomorrowDate,
        },
        include: [
          {
            model: SkillCohortParticipant,
            where: {
              hasAccess: "TRUE",
            },
            required: true,
            include: db.User,
          },
        ],
      });

      return allSkillCohorts;
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  const getAllCohortsThatFinishedTheDayBefore = async (dateToday) => {
    try {
      const cohorts = await SkillCohort.findAll({
        where: {
          endDate: {
            [Op.lt]: dateToday,
          },
        },
        include: [
          {
            model: SkillCohortParticipant,
            where: {
              hasAccess: "TRUE",
            },
            include: [
              {
                model: User,
              },
            ],
          },
        ],
      });

      const finishedCohorts = cohorts.filter((cohort) =>
        moment(cohort.endDate).add(1, "day").isSame(dateToday)
      );

      return finishedCohorts;
    } catch (err) {
      return [];
    }
  };

  return {
    create,
    getAllActiveUserSide,
    get,
    remove,
    update,
    getAllActiveSkillCohortsWithResource,
    getAllActiveSkillCohorts,
    getAllOfMyCohort,
    getAll,
    getAllActiveSkillCohortsWithParticipants,
    getAllSkillCohortThatWillStartWeekLater,
    getAllSkillCohortThatWillStartTomorrow,
    duplicate,
    getAllCohortsThatFinishedTheDayBefore,
  };
};

module.exports = SkillCohortController;
