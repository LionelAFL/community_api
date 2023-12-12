const db = require("../models");
const HttpCodes = require("http-codes");
const s3Service = require("../services/s3.service");
const isEmpty = require("lodash/isEmpty");
const { Op } = require("sequelize");
const NotificationController = require("../controllers/NotificationController");

const Marketplace = db.Marketplace;
const Category = db.Category;

const MarketplaceController = () => {
  /**
   * Method to get all MarketPlace objects
   * @param {*} req
   * @param {*} res
   */
  const getAll = async (req, res) => {
    const { orderParam, filter } = req.body;
    try {
      let where = {};
      if (filter) {
        if (filter && !isEmpty(JSON.parse(filter))) {
          where = {
            ...where,
            topics: {
              [Op.overlap]: JSON.parse(filter),
            },
          };
        }
      }
      let marketplace = await Marketplace.findAll({
        where,
        order: [["name", orderParam]],
      });
      if (!marketplace) {
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }

      return res.status(HttpCodes.OK).json(marketplace);
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };
  /**
   * Method to get MarketPlace object
   * @param {*} req
   * @param {*} res
   */
  const get = async (req, res) => {
    const { id } = req.params;
    if (id) {
      try {
        const marketPlace = await Marketplace.findOne({
          where: {
            id,
          },
        });

        if (!marketPlace) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }

        return res.status(HttpCodes.OK).json(marketPlace);
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
   * Method to add MarketPlace object
   * @param {*} req
   * @param {*} res
   */
  const add = async (req, res) => {
    const {
      name,
      description,
      url,
      contact_name,
      contact_email,
      contact_phone,
      contact_position,
      logoUrl,
      topics,
      demoUrl,
      isPartner,
    } = req.body;
    try {
      let marketplace = await Marketplace.create({
        name,
        description,
        url,
        contact_name,
        contact_email,
        contact_phone,
        contact_position,
        topics,
        demoUrl,
        isPartner,
      });
      if (logoUrl) {
        let imageUrl = await s3Service().getMarketplaceImageUrl("", logoUrl);
        await Marketplace.update(
          { logoUrl: imageUrl },
          {
            where: { id: marketplace.id },
          }
        );
        marketplace = {
          ...marketplace,
          id: marketplace.id,
          name,
          imageUrl,
        };
      }

      await NotificationController().createNotification({
        message: `New Company "${marketplace.name}" was created.`,
        type: "marketplace",
        meta: {
          ...marketplace,
        },
        onlyFor: [-1],
      });

      return res.status(HttpCodes.OK).send();
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };
  /**
   * Method to updated MarketPlace object
   * @param {*} req
   * @param {*} res
   */
  const update = async (req, res) => {
    const { id } = req.params;
    const { body } = req;

    if (id) {
      try {
        let data = {};
        let fields = [
          "name",
          "description",
          "url",
          "contact_name",
          "contact_email",
          "contact_phone",
          "contact_position",
          "topics",
          "demoUrl",
          "twitter",
          "facebook",
          "linkedin",
          "instagram",
          "isPartner",
        ];
        for (let item of fields) {
          if (body[item]) {
            data = { ...data, [item]: body[item] };
          }
        }
        if (body.logoUrl) {
          const marketplace = await Marketplace.findOne({
            where: {
              id,
            },
          });
          let imageUrl = await s3Service().getMarketplaceImageUrl(
            marketplace.logoUrl || "",
            body.logoUrl
          );
          data = { ...data, logoUrl: imageUrl };
        }
        await Marketplace.update(data, {
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
   * Method to delete MarketPlace object
   * @param {*} req
   * @param {*} res
   */
  const remove = async (req, res) => {
    let { id } = req.params;

    if (id) {
      try {
        await Marketplace.destroy({
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

module.exports = MarketplaceController;
