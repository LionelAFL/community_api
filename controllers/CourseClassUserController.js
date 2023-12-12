const db = require("../models");
const HttpCodes = require("http-codes");
const isEmpty = require("lodash/isEmpty");
const Sequelize = require("sequelize");
const { Op } = require("sequelize");
const s3Service = require("../services/s3.service");
const { isValidURL } = require("../utils/profile");

const QueryTypes = Sequelize.QueryTypes;
const CourseClassUser = db.CourseClassUser;
const User = db.User;

const CourseClassUserController = () => {
  /**
   * Method to get Course object
   * @param {*} req
   * @param {*} res
   */
  const getProgressCourseByUser = async (req, res) => {
    const { course } = req.params;
    if (course) {
      try {
        const query = `SELECT ccu.* FROM "CourseClassUsers" ccu
        INNER JOIN "CourseClasses" cc on ccu."CourseClassId" = cc.id
        WHERE cc."CourseId" = ${course} AND ccu."UserId" = ${req.user.id}`;

        let courseClassUser = await db.sequelize.query(query, {
          type: QueryTypes.SELECT,
        });

        if (!courseClassUser) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }

        return res.status(HttpCodes.OK).json({ courseClassUser });
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    } else {
      return res
        .status(HttpCodes.BAD_REQUEST)
        .json({ msg: "Bad Request: data is wrong" });
    }
  };

  /**
   * Method to add CourseClassUser object
   * @param {*} req
   * @param {*} res
   */
  const setProgress = async (req, res) => {
    try {
      let courseClassUser = await CourseClassUser.findOne({
        where: { CourseClassId: req.body.CourseClassId, UserId: req.user.id },
      });

      if (!courseClassUser) {
        add({ ...req.body, UserId: req.user.id });
      } else {
        if (req.body.progressVideo > courseClassUser.progressVideo) {
          update({ ...req.body, UserId: req.user.id });
        } else if (req.body.viewed) {
          update({ ...req.body, UserId: req.user.id });
        }
      }

      return res.status(HttpCodes.OK).send();
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  /**
   * Method to add CourseClassUser object
   */
  const add = async (params) => {
    try {
      await CourseClassUser.create(params);
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Method to update Course Class User object
   */
  const update = async (params) => {
    try {
      await CourseClassUser.update(params, {
        where: { CourseClassId: params.CourseClassId, UserId: params.UserId },
      });
    } catch (error) {
      console.log(error);
    }
  };

  return {
    getProgressCourseByUser,
    add,
    update,
    setProgress,
  };
};

module.exports = CourseClassUserController;
