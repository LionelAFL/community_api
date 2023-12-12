const db = require("../models");
const HttpCodes = require("http-codes");
const Sequelize = require("sequelize");
const s3Service = require("../services/s3.service");
const { isValidURL } = require("../utils/profile");

const QueryTypes = Sequelize.QueryTypes;
const Sponsor = db.Sponsor;

const SponsorController = () => {
  /**
   * Method to get all Sponsor objects
   * @param {*} req
   * @param {*} res
   */
  const getAll = async (req, res) => {
    try {
      let sponsors = await Sponsor.findAll({
        order: [["createdAt", "DESC"]],
      });
      if (!sponsors) {
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }

      return res.status(HttpCodes.OK).json({ sponsors });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };
  /**
   * Method to get Sponsor object
   * @param {*} req
   * @param {*} res
   */
  const get = async (req, res) => {
    const { id } = req.params;
    if (id) {
      try {
        const sponsor = await Sponsor.findOne({
          where: {
            id,
          },
        });

        if (!sponsor) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }

        return res.status(HttpCodes.OK).json({ sponsor });
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
   * Method to add Sponsor object
   * @param {*} req
   * @param {*} res
   */
  const add = async (req, res) => {
    const { imageData } = req.body;
    try {
      let sponsor = await Sponsor.create({ ...req.body });
      if (imageData) {
        let image = await s3Service().getSponsorImageUrl("", imageData);
        await Sponsor.update({ image: image }, { where: { id: sponsor.id } });
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
   * Method to update Sponsor object
   * @param {*} req
   * @param {*} res
   */
  const update = async (req, res) => {
    const { id } = req.params;
    const { body } = req;

    if (id) {
      try {
        let data = {};
        let fields = ["name", "description", "topics", "link"];
        for (let item of fields) {
          if (body[item]) {
            data = { ...data, [item]: body[item] };
          }
        }

        const sponsor = await Sponsor.findOne({
          where: {
            id,
          },
        });
        if (!sponsor) {
          return res
            .status(HttpCodes.BAD_REQUEST)
            .json({ msg: "Bad Request: sponsor not found." });
        }
        if (body.imageData && !isValidURL(body.imageData)) {
          data.image = await s3Service().getSponsorImageUrl("", body.imageData);

          if (sponsor.image) {
            await s3Service().deleteUserPicture(sponsor.imageData);
          }
        }

        await Sponsor.update(data, {
          where: { id },
        });

        return res.status(HttpCodes.OK).send();
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
   * Method to delete Sponsor object
   * @param {*} req
   * @param {*} res
   */
  const remove = async (req, res) => {
    let { id } = req.params;

    if (id) {
      try {
        await Sponsor.destroy({
          where: { id },
        });
        return res.status(HttpCodes.OK).send();
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

module.exports = SponsorController;
