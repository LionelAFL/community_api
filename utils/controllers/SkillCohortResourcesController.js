const db = require("../models");
const HttpCodes = require("http-codes");
const { Op } = require("sequelize");
const moment = require("moment-timezone");

const SkillCohortResources = db.SkillCohortResources;
const SkillCohort = db.SkillCohort;
const SkillCohortResourceResponse = db.SkillCohortResourceResponse;
const SkillCohortResponseAssessment = db.SkillCohortResponseAssessment;
const SkillCohortParticipant = db.SkillCohortParticipant;
const User = db.User;

const SkillCohortResourcesController = () => {
  /**
   * Create resources
   * @param {*} req
   * @param {*} res
   */
  const create = async (req, res) => {
    const { body } = req;

    try {
      const skillCohortResource = await SkillCohortResources.create({
        ...body,
      });

      return res.status(HttpCodes.OK).json({ skillCohortResource });
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
    const { skillCohortId } = req.params;

    let where = {
      SkillCohortId: skillCohortId,
    };

    try {
      const skillCohortResources = await SkillCohortResources.findAll({
        where,
        include: [
          {
            model: SkillCohortResourceResponse,
          },
          {
            model: SkillCohortResponseAssessment,
          },
        ],
        order: [["releaseDate"]],
      });

      return res.status(HttpCodes.OK).json({ skillCohortResources });
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal Server error",
        error,
      });
    }
  };

  const getEntire = async (req, res) => {
    const { skillCohortId } = req.params;
    const { date } = req.body;

    let where = {
      SkillCohortId: skillCohortId,
      releaseDate: {
        [Op.lte]: moment
          .tz(date, "America/Los_Angeles")
          .startOf("day")
          .format("YYYY-MM-DD HH:mm:ssZ"),
      },
    };

    try {
      const entireSkillCohortResources = await SkillCohortResources.findAll({
        where,
        order: [["releaseDate", "DESC"]],
      });

      return res.status(HttpCodes.OK).json({ entireSkillCohortResources });
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal Server error",
        error,
      });
    }
  };

  const getAllAndCount = async (req, res) => {
    const { date, page, num } = req.query;
    const { skillCohortId } = req.params;

    let where = {
      SkillCohortId: skillCohortId,
    };

    try {
      if (date) {
        where = {
          ...where,
          releaseDate: {
            [Op.lte]: moment
              .tz(date, "America/Los_Angeles")
              .startOf("day")
              .format("YYYY-MM-DD HH:mm:ssZ"),
          },
        };
      }

      let skillCohortResources = await SkillCohortResources.findAndCountAll({
        where,
        distinct: true,
        offset: (+page - 1) * +num,
        limit: +num * +page,
        order: [["releaseDate", "DESC"]],
      });

      return res.status(HttpCodes.OK).json({ skillCohortResources });
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal Server error",
        error,
      });
    }
  };

  /**
   * Get resource
   * @param {*} req
   * @param {*} res
   */
  const get = async (req, res) => {
    const { resourceId } = req.params;

    if (resourceId) {
      try {
        const skillCohortResource = await SkillCohortResources.findOne({
          where: {
            id: resourceId,
          },
          include: [
            {
              model: SkillCohortResourceResponse,
              where: {
                isDeleted: "FALSE",
              },
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
                {
                  model: SkillCohortResponseAssessment,
                  where: {
                    isDeleted: "FALSE",
                  },
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
            },
          ],
        });

        if (!skillCohortResource) {
          return res.status(HttpCodes.BAD_REQUEST).json({
            msg: "Bad Request: Skill Cohort Resource not found.",
          });
        }

        return res.status(HttpCodes.OK).json({ skillCohortResource });
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error." });
      }
    }
  };

  const getTodaysResource = async (req, res) => {
    const { SkillCohortId } = req.params;

    if (SkillCohortId) {
      try {
        const skillCohortResource = await SkillCohortResources.findOne({
          where: {
            SkillCohortId,
            releaseDate: moment()
              .tz("America/Los_Angeles")
              .startOf("day")
              .format("YYYY-MM-DD HH:mm:ssZ"),
          },
        });

        if (!skillCohortResource) {
          return res.status(HttpCodes.BAD_REQUEST).json({
            msg: "Bad Request: Skill Cohort Resource not found.",
          });
        }

        return res.status(HttpCodes.OK).json({ skillCohortResource });
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error." });
      }
    }
  };

  /**
   * Remove a resource
   * @param {*} req
   * @param {*} res
   */
  const remove = async (req, res) => {
    const { resourceId } = req.params;

    if (resourceId) {
      try {
        await SkillCohortResources.destroy({
          where: {
            id: resourceId,
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
      .json({ msg: "Bad Request: Skill Cohort id is wrong." });
  };

  /**
   * Update a resource
   * @param {*} req
   * @param {*} res
   */
  const update = async (req, res) => {
    const { resourceId } = req.params;
    const reqSkillCohortResource = req.body;

    if (resourceId) {
      try {
        const [numberOfAffectedRows, affectedRows] =
          await SkillCohortResources.update(reqSkillCohortResource, {
            where: { id: resourceId },
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
   * Get resources released today
   */
  const getResourcesToBeReleasedToday = async () => {
    const dateToday = moment().tz("America/Los_Angeles").startOf("day");

    return await SkillCohortResources.findAll({
      where: {
        releaseDate: dateToday,
        SkillCohortId: {
          [Op.ne]: null,
        },
      },
      include: {
        model: SkillCohort,
        required: true,
        include: {
          model: SkillCohortParticipant,
          required: true,
          where: {
            hasAccess: "TRUE",
          },
          include: {
            model: User,
            attributes: ["id", "email", "firstName"],
          },
        },
      },
    });
  };

  /**
   * Get yesterday's released resource by id's
   */
  const getYesterdayResourcesByCohortIds = async () => {
    const yesterdayDate = moment()
      .tz("America/Los_Angeles")
      .startOf("day")
      .utc()
      .subtract(1, "day")
      .format("YYYY-MM-DD HH:mm:ssZ");
    const dateToday = moment()
      .tz("America/Los_Angeles")
      .startOf("day")
      .utc()
      .format("YYYY-MM-DD HH:mm:ssZ");

    const allResources = await SkillCohortResources.findAll({
      where: {
        releaseDate: yesterdayDate,
      },
      include: {
        model: SkillCohort,
        where: {
          startDate: {
            [Op.lte]: dateToday,
          },
          endDate: {
            [Op.gte]: dateToday,
          },
        },
      },
      raw: true,
      nest: true,
    });

    return allResources;
  };

  const batchWrite = async (req, res) => {
    const { skillCohortResources } = req.body;

    const transformedSkillCohortResources = skillCohortResources.map(
      (resource) => {
        let releaseDate = resource.releaseDate.replace(/\//g, "-");

        releaseDate = moment
          .tz(releaseDate, "MM-DD-YYYY", "America/Los_Angeles")
          .startOf("day");

        return {
          ...resource,
          releaseDate,
        };
      }
    );

    try {
      const allSkillCohortResources = SkillCohortResources.bulkCreate(
        transformedSkillCohortResources
      );

      return res.status(HttpCodes.OK).json({ allSkillCohortResources });
    } catch (error) {
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
    getResourcesToBeReleasedToday,
    getYesterdayResourcesByCohortIds,
    batchWrite,
    getAllAndCount,
    getTodaysResource,
    getEntire,
  };
};

module.exports = SkillCohortResourcesController;
