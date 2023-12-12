const db = require("../models");
const HttpCodes = require("http-codes");
const socketService = require("../services/socket.service");
const SocketEventType = require("../enum/SocketEventTypes");

const Live = db.Live;

const LiveController = () => {
  /**
   * Method to get Live object
   * @param {*} req
   * @param {*} res
   */
  const get = async (req, res) => {
    try {
      const live = await Live.findAll({
        limit: 1,
      });

      if (live.length > 0) {
        return res.status(HttpCodes.OK).json({ live: live[0] });
      } else {
        return res.status(HttpCodes.OK).json({ live: { title: "Live" } });
      }
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  /**
   * Method to save Live object
   * @param {*} req
   * @param {*} res
   */
  const save = async (req, res) => {

    try {
      const live = await Live.findAll({
        limit: 1,
      });
      if (live.length > 0) {
        update(live[0].id, req.body);
      } else {
        add(req.body);
      }

      socketService().emit(SocketEventType.LIVE_CHANGE);

      return res.status(HttpCodes.OK).send();
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  /**
   * Method to add Live object
   */
  const add = async (params) => {
    try {
      await Live.create({ ...params });
    } catch (error) {
      console.log(error);
    }
  };
  /**
   * Method to update Live object
   */
  const update = async (id, params) => {
    try {
      let data = {};
      let fields = [
        "live",
        "url",
        "eventAssistence",
        "event",
        "title",
        "description",
        "isFree",
      ];
      for (let item of fields) {
        if (params.hasOwnProperty(item)) {
          data = { ...data, [item]: params[item] };
        }
      }
      await Live.update(data, {
        where: { id },
      });
    } catch (error) {
      console.log(error);
    }
  };

  return {
    get,
    save,
    add,
    update,
  };
};

module.exports = LiveController;
