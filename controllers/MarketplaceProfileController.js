const db = require("../models");
const { Op, Sequelize } = require("sequelize");
const HttpCodes = require("http-codes");
const { isEmpty } = require("lodash");

const User = db.User;
const MarketPlaceProfile = db.MarketPlaceProfile;

const MarketplaceProfileController = () => {
  const add = async (req, res) => {
    const { marketplaceProfile } = req.body;

    try {
      const prevMarketPlaceProfile = await MarketPlaceProfile.findOne({
        where: {
          UserId: marketplaceProfile.UserId,
        },
      });

      if (prevMarketPlaceProfile) {
        return res.status(HttpCodes.CONFLICT);
      }

      const newMarketPlaceProfile = await MarketPlaceProfile.create(
        marketplaceProfile
      );
      if (!newMarketPlaceProfile) {
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
      return res
        .status(HttpCodes.OK)
        .json({ marketPlaceProfile: newMarketPlaceProfile });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error", error: error });
    }
  };
  const getAll = async (req, res) => {
    const filter = req.query;

    try {
      let where = {
        showMarketPlaceProfile: true,
      };

      if (filter?.level && !isEmpty(JSON.parse(filter.level))) {
        where = {
          ...where,
          lookingFor: {
            [Op.overlap]: JSON.parse(filter.level),
          },
        };
      }

      if (filter?.location && !isEmpty(JSON.parse(filter.location))) {
        where = {
          ...where,
          location: {
            [Op.overlap]: JSON.parse(filter.location),
          },
        };
      }

      if (filter?.keyword && !isEmpty(filter.keyword)) {
        where = {
          ...where,
          [Op.or]: [
            {
              "$User.firstName$": {
                [Op.like]: `%${filter.keyword}%`,
              },
            },
            {
              "$User.lastName$": {
                [Op.like]: `%${filter.keyword}%`,
              },
            },
          ],
        };
      }

      // console.log(where2[Op.or][0]);
      const marketPlaceProfiles = await MarketPlaceProfile.findAll({
        where,
        include: {
          model: User,
          attributes: [
            "abbrName",
            "email",
            "firstName",
            "lastName",
            "img",
            "personalLinks",
            "resumeUrl",
          ],
        },
        order: [[Sequelize.fn("RANDOM")]],
      });
      return res.status(HttpCodes.OK).json({ marketPlaceProfiles });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error", error: error });
    }
  };
  const get = async (req, res) => {
    const { id } = req.params;
    try {
      const marketPlaceProfile = await MarketPlaceProfile.findOne({
        where: {
          UserId: id,
        },
        include: {
          model: User,
          required: true,
          attributes: ["resumeUrl", "resumeFileName"],
        },
      });

      if (!marketPlaceProfile) {
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Bad Request: Profile not found" });
      }
      return res.status(HttpCodes.OK).json({ marketPlaceProfile });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error", error: error });
    }
  };

  const update = async (req, res) => {
    const { id } = req.params;
    const { body } = req;

    try {
      const prevMarketPlaceProfile = await MarketPlaceProfile.findOne({
        where: {
          id,
        },
      });

      if (!prevMarketPlaceProfile) {
        return res
          .status(HttpCodes.BAD_REQUEST)
          .json({ msg: "Bad Request: Profile not found." });
      }
      const [numberOfAffectedRows, affectedRows] =
        await MarketPlaceProfile.update(body, {
          where: { id },
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
        .json({ msg: "Internal server error", error: error });
    }
  };
  return {
    add,
    getAll,
    get,
    update,
  };
};

module.exports = MarketplaceProfileController;
