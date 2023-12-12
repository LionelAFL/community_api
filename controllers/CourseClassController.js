const db = require("../models");
const HttpCodes = require("http-codes");
const Sequelize = require("sequelize");

const QueryTypes = Sequelize.QueryTypes;
const CourseClass = db.CourseClass;

const CourseClassController = () => {
  /**
   * Method to get all CourseClass objects
   * @param {*} req 
   * @param {*} res 
   */
  const getAll = async (req, res) => {
    try {
      let courseClass = await CourseClass.findAll({
        order: [
          ['createdAt', 'DESC'],
        ],
      });
      if (!courseClass) {
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }

      return res.status(HttpCodes.OK).json({ courseClass });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };
  /**
   * Method to get CourseClass by Course object
   * @param {*} req 
   * @param {*} res 
   */
  const getByCourse = async (req, res) => {
    const { course } = req.params;
    if (course) {
      try {
        const courseClasses = await CourseClass.findAll({
          where: {
            CourseId: course,
          },
          order: [
            ['createdAt', 'ASC'],
          ],
        });

        if (!courseClasses) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }

        return res.status(HttpCodes.OK).json({ courseClasses });
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
   * Method to get CourseClass object
   * @param {*} req 
   * @param {*} res 
   */
  const get = async (req, res) => {
    const { id } = req.params;
    if (id) {
      try {
        const courseClass = await CourseClass.findOne({
          where: {
            id,
          },
        });

        if (!courseClass) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }

        return res.status(HttpCodes.OK).json({ courseClass });
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
   * Method to add CourseClass object
   * @param {*} req 
   * @param {*} res 
   */
  const add = async (req, res) => {
    try {
      await CourseClass.create({ ...req.body });

      return res
        .status(HttpCodes.OK)
        .send();
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };
  /**
   * Method to update CourseClass object
   * @param {*} req 
   * @param {*} res 
   */
  const update = async (req, res) => {
    const { id } = req.params;
    const { body } = req

    if (id) {
      try {
        let data = {};
        let fields = [
          "title",
          "description",
          "videoUrl",
          "duration",
          "topics",
        ];
        for (let item of fields) {
          if (body[item]) {
            data = { ...data, [item]: body[item] };
          }
        }
        await CourseClass.update(data, {
          where: { id }
        })

        return res
          .status(HttpCodes.OK)
          .send();
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
   * Method to delete CourseClass object
   * @param {*} req 
   * @param {*} res 
   */
  const remove = async (req, res) => {
    let { id } = req.params;

    if (id) {
      try {
        let query = `
        DELETE FROM "CourseClassUsers" 
        WHERE 
        "CourseClassUsers"."CourseClassId" = ${id}
        `;

        await db.sequelize.query(query, {
          type: QueryTypes.DELETE,
        });

        await CourseClass.destroy({
          where: { id }
        });
        return res
          .status(HttpCodes.OK)
          .send();
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

  return {
    getAll,
    getByCourse,
    get,
    add,
    update,
    remove,
  };
};

module.exports = CourseClassController;