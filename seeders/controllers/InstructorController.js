const db = require("../models");
const HttpCodes = require("http-codes");
const Sequelize = require("sequelize");
const s3Service = require("../services/s3.service");
const { isValidURL } = require("../utils/profile");

const QueryTypes = Sequelize.QueryTypes;
const Instructor = db.Instructor;

const InstructorController = () => {
  /**
   * Method to get all Instructor objects
   * @param {*} req 
   * @param {*} res 
   */
  const getAll = async (req, res) => {
    try {
      let instructors = await Instructor.findAll({
        order: [
          ['createdAt', 'DESC'],
        ],
      });
      if (!instructors) {
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }

      return res.status(HttpCodes.OK).json({ instructors });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };
  /**
   * Method to get Instructor object
   * @param {*} req 
   * @param {*} res 
   */
  const get = async (req, res) => {
    const { id } = req.params;
    if (id) {
      try {
        const instructor = await Instructor.findOne({
          where: {
            id,
          },
        });

        if (!instructor) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }

        return res.status(HttpCodes.OK).json({ instructor });
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
   * Method to add Instructor object
   * @param {*} req 
   * @param {*} res 
   */
  const add = async (req, res) => {
    const { imageData } = req.body;
    try {
      let instructor = await Instructor.create({ ...req.body });
      if (imageData) {
        let image = await s3Service().getInstructorImageUrl("", imageData);
        await Instructor.update(
          { image: image },
          { where: { id: instructor.id }, }
        );
      }
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
   * Method to update Instructor object
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
          "topics",
          "link",
        ];
        for (let item of fields) {
          if (body[item]) {
            data = { ...data, [item]: body[item] };
          }
        }

        const instructor = await Instructor.findOne({
          where: {
            id,
          },
        });
        if (!instructor) {
          return res
            .status(HttpCodes.BAD_REQUEST)
            .json({ msg: "Bad Request: instructor not found." });
        }
        if (body.imageData && !isValidURL(body.imageData)) {
          data.image = await s3Service().getInstructorImageUrl(
            "",
            body.imageData
          );

          if (instructor.image) {
            await s3Service().deleteUserPicture(instructor.imageData);
          }
        }

        await Instructor.update(data, {
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
  /**
   * Method to delete Instructor object
   * @param {*} req 
   * @param {*} res 
   */
  const remove = async (req, res) => {
    let { id } = req.params;

    if (id) {
      try {
        await Instructor.destroy({
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

module.exports = InstructorController;