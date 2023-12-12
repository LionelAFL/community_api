const db = require("../models");
const HttpCodes = require("http-codes");
const moment = require("moment");

const CourseSponsor = db.CourseSponsor;

const CourseSponsorController = () => {
  /**
   * Method to get all CourseSponsor objects
   * @param {*} req 
   * @param {*} res 
   */
  const getAll = async (req, res) => {
    try {
      let courseSponsor = await CourseSponsor.findAll({
        order: [
          ['createdAt', 'DESC'],
        ],
      });
      if (!courseSponsor) {
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }

      return res.status(HttpCodes.OK).json({ courseSponsor });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };
  /**
   * Method to get CourseSponsor object
   * @param {*} req 
   * @param {*} res
   */
  const get = async (req, res) => {
    const { id } = req.params;
    if (id) {
      try {
        const courseSponsor = await CourseSponsor.findOne({
          where: {
            id,
          },
        });

        if (!courseSponsor) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }

        return res.status(HttpCodes.OK).json({ courseSponsor });
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
   * Method to add CourseSponsor object
   * @param {*} req 
   * @param {*} res 
   */
  const add = async (req, res) => {
    try {
      await CourseSponsor.create({ ...req.body });

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
   * Method to update CourseSponsor object
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
        await CourseSponsor.update(data, {
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
   * Method to delete CourseSponsor object
   * @param {*} req 
   * @param {*} res 
   */
  const remove = async (req, res) => {
    let { id } = req.params;

    if (id) {
      try {
        await CourseSponsor.destroy({
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

module.exports = CourseSponsorController;