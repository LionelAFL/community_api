const db = require("../models");
const HttpCodes = require("http-codes");

const ChannelCategory = db.ChannelCategory;

const ChannelCategoryController = () => {
  const create = async (req, res) => {
    const { title, value } = req.body;

    if (title) {
      try {
        let categoryInfo = {
          title,
          value,
        };

        const category = await ChannelCategory.create(categoryInfo);

        return res.status(HttpCodes.OK).json({ category });
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error", error });
      }
    }

    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: title is not empty." });
  };

  const getAll = async (req, res) => {
    try {
      const categories = await ChannelCategory.findAll({
        order: [["title"]],
      });

      return res.status(HttpCodes.OK).json({ categories });
    } catch (err) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const get = async (req, res) => {
    const { id } = req.params;

    if (id) {
      try {
        const category = await ChannelCategory.findOne({
          where: {
            id,
          },
        });

        if (!category) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Bad Request: Category not found" });
        }

        return res.status(HttpCodes.OK).json({ category });
      } catch (err) {
        console.log(err);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    }

    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: category id is wrong" });
  };

  const update = async (req, res) => {
    const { id } = req.params;
    const category = req.body;

    if (id) {
      try {
        let categoryInfo = {
          ...category,
        };

        const [
          numberOfAffectedRows,
          affectedRows,
        ] = await ChannelCategory.update(categoryInfo, {
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
          .json({ msg: "Internal server error" });
      }
    }

    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: category id is wrong" });
  };

  const remove = async (req, res) => {
    const { id } = req.params;

    if (id) {
      try {
        await ChannelCategory.destroy({
          where: {
            id,
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
      .json({ msg: "Bad Request: category id is wrong" });
  };

  return {
    create,
    getAll,
    get,
    update,
    remove,
  };
};

module.exports = ChannelCategoryController;
