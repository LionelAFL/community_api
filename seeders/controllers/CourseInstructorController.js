const db = require("../models");
const HttpCodes = require("http-codes");
const moment = require("moment");

const CourseInstructor = db.CourseInstructor;

const CourseInstructorController = () => {
  /**
   * Method to get all CourseInstructor objects
   * @param {*} req 
   * @param {*} res 
   */
  const getAll = async (req, res) => {
    try {
      let CourseInstructor = await CourseInstructor.findAll({
        order: [
          ['createdAt', 'DESC'],
        ],
      });
      if (!CourseInstructor) {
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }

      return res.status(HttpCodes.OK).json({ CourseInstructor });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };
  /**
   * Method to get CourseInstructor object
   * @param {*} req 
   * @param {*} res
   */
  const get = async (req, res) => {
    const { id } = req.params;
    if (id) {
      try {
        const CourseInstructor = await CourseInstructor.findOne({
          where: {
            id,
          },
        });

        if (!CourseInstructor) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }

        return res.status(HttpCodes.OK).json({ CourseInstructor });
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
   * Method to add CourseInstructor object
   * @param {*} req 
   * @param {*} res 
   */
  const add = async (req, res) => {
    try {
      await CourseInstructor.create({ ...req.body });

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
   * Method to update CourseInstructor object
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
          "name",
          "description",
        ];
        for (let item of fields) {
          if (body[item]) {
            data = { ...data, [item]: body[item] };
          }
        }
        await CourseInstructor.update(data, {
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
   * Method to delete CourseInstructor object
   * @param {*} req 
   * @param {*} res 
   */
  const remove = async (req, res) => {
    let { id } = req.params;

    if (id) {
      try {
        await CourseInstructor.destroy({
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
    get,
    add,
    update,
    remove,
  };
};

module.exports = CourseInstructorController;