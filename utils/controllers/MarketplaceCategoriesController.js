const db = require("../models");
const HttpCodes = require("http-codes");

const MarketplaceCategories = db.MarketplaceCategories;

const MarketplaceCategoriesController = () => {
  /**
   * Method to get all MarketplaceCategories objects
   * @param {*} req 
   * @param {*} res 
   */
  const getAll = async (req, res) => {
    try {
      let marketplaceCategories = await MarketplaceCategories.findAll();
      if (!marketplaceCategories) {
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }

      return res
        .status(HttpCodes.OK)
        .json(marketplaceCategories);
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
        const marketplaceCategories = await MarketplaceCategories.findOne({
          where: {
            id,
          },
        });

        if (!marketplaceCategories) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }

        return res
          .status(HttpCodes.OK)
          .json(marketplaceCategories);
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
    try {
      await MarketplaceCategories.create(req.body);
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
          'name',
        ];
        for (let item of fields) {
          if (body[item]) {
            data = { ...data, [item]: body[item] };
          }
        }
        await MarketplaceCategories.update(data, {
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
   * Method to delete MarketPlace object
   * @param {*} req 
   * @param {*} res 
   */
  const remove = async (req, res) => {
    let { id } = req.params;

    if (id) {
      try {
        await MarketplaceCategories.destroy({
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

module.exports = MarketplaceCategoriesController;