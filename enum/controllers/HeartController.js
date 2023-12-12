const db = require("../models");
const Sequelize = require('sequelize');
const HttpCodes = require("http-codes");

const Heart = db.Heart;
const HeartUserRate = db.HeartUserRate;

const HeartController = () => {
  /**
   * Method to get all Heart objects
   * @param {*} req 
   * @param {*} res 
   */
  const getAll = async (req, res) => {
    try {
      let heart = await Heart.findAll({
        where: { parentId: null },
        order: [
          ['createdAt', 'DESC'],
        ],
      });
      if (!heart) {
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }

      let requests = heart.map(h => Heart.findAll({
        where: { parentId: h.id },
        order: [
          ['createdAt', 'DESC'],
        ],
      }));
      let results = await Promise.all(requests);
      results.map((item, index) => { heart[index].dataValues['responses'] = item });

      return res.status(HttpCodes.OK).json({ heart });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };
  /**
   * Method to get Heart object
   * @param {*} req 
   * @param {*} res 
   */
  const get = async (req, res) => {
    const { id } = req.params;
    if (id) {
      try {
        const heart = await Heart.findOne({
          where: {
            id,
          },
        });

        if (!heart) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }

        return res.status(HttpCodes.OK).json({ heart });
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
   * Method to add Heart object
   * @param {*} req 
   * @param {*} res 
   */
  const add = async (req, res) => {
    const { category, content, rate, parentId } = req.body
    const { id } = req.token;
    try {
      await Heart.create({
        parentId,
        category,
        content,
        rate,
        UserId: id
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
  };
  /**
   * Method to updated Heart object
   * @param {*} req 
   * @param {*} res 
   */
  const update = async (req, res) => {
    const { id } = req.params;
    const { id: userId } = req.token;
    const { category, content, rate } = req.body

    if (id) {
      try {
        let data = {};
        if(category){
          data = {...data, category};
        }
        if(content){
          data = {...data, content};
        }
        if(rate){
          let rateAvg = await setCommentRateByUser(userId, id, rate);
          data = {...data, rate: rateAvg};
        }
        await Heart.update(data, {
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
   * Method to delete Heart object
   * @param {*} req 
   * @param {*} res 
   */
  const remove = async (req, res) => {
    let { id } = req.params;

    if (id) {
      try {
        await HeartUserRate.destroy({
          where: { HeartId: id }
        });
        await Heart.destroy({
          where: { parentId: id }
        });
        await Heart.destroy({
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
   * Set comment by user and return average rate by comment
   * @param {number} userId 
   * @param {number} heartId 
   * @param {decimal} rate 
   */
  const setCommentRateByUser = async (userId, heartId, rate) => {
    try {
      let heartUserRate = await HeartUserRate.findOne({
        where: {
          UserId: userId,
          HeartId: heartId,
        }
      });
  
      let data = {
        rate,
        UserId: userId,
        HeartId: heartId,
      };
  
      if (!heartUserRate) {
        await HeartUserRate.create(data);
      } else {
        await HeartUserRate.update(data, {
          where: { id: heartUserRate.id }
        });
      }
  
      let rateAvg = await HeartUserRate.findOne({
        where: {
          HeartId: heartId,
        },
        attributes: [[Sequelize.fn('AVG', Sequelize.col('rate')), 'rate']]
      })
      return rateAvg.rate;
    }catch (error) {
      console.log(error);
    }
  }

  return {
    getAll,
    get,
    add,
    update,
    remove,
  };
};

module.exports = HeartController;
