const db = require("../models");
const HttpCodes = require("http-codes");
const socketService = require("../services/socket.service");
const SocketEventType = require("../enum/SocketEventTypes");

const LiveChat = db.LiveChat;

const LiveChatControllers = () => {
   /**
   * Method to get all AnnualConferenceClass objects
   * @param {*} req
   * @param {*} res
   */
  
   const getAll = async (req, res) => {
    try {
      let data = await LiveChat.findAll();
      if (!data) {
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }

      return res.status(HttpCodes.OK).json({ data });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const add = async (req, res) => {

    try {
  
        const info = {
          ...req.body,
          idOrder: 0
        }
        
        const livechat = await LiveChat.create(info);

        if(livechat.idOrder === 0){
          livechat.idOrder = livechat.dataValues.id
          livechat.save();
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
   * Method to update AnnualConferenceClass object
   * @param {*} req
   * @param {*} res
   */
  const update = async (req, res) => {
    const { body } = req;

    if (body.id) {
      try {
        const audioFileType = body?.audioFileUrl?.match(
          /[^:]\w+\/[\w-+\d.]+(?=;|,)/
        );

        const documentFileType = body?.documentFileUrl?.match(
          /[^:]\w+\/[\w-+\d.]+(?=;|,)/
        );

        let data = {
          ...body,
        };

        if (audioFileType) {
          const { Location: audioFileUrl, key: audioFileName } =
            await s3Service().uploadFile(
              body.audioFileUrl,
              audioFileType[0],
              body.title
            );

          data = {
            ...data,
            audioFileUrl,
            audioFileName,
          };
        }

        if (documentFileType) {
          const { Location: documentFileUrl, key: documentFileName } =
            await s3Service().uploadFile(
              body.documentFileUrl,
              documentFileType[0],
              body.title
            );

          data = {
            ...data,
            documentFileUrl,
            documentFileName,
          };
        }

        await LiveChat.update(data, {
            where: { id: body.id },
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
   * Method to delete AnnualConferenceClass object
   * @param {*} req
   * @param {*} res
   */
  const remove = async (req, res) => {
    const { id } = req.params;

    if (id) {
      try {
        await LiveChat.destroy({
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
      .json({ msg: "Bad Request: id is wrong" });
  };

  
  const order = async (req, res) => {
    const {position, position2} = req.body.data;

    try {

      const [numberOfAffectedRows, affectedRows] = await LiveChat.update(
        {
          idOrder: position.change
        },
        {
          where: { id: position.id },
        }
      );

      const [numberOfAffectedRows2, affectedRows2] = await LiveChat.update(
        {
          idOrder: position2.change
        },
        {
          where: { id: position2.id },
        }
      );

      return res
        .status(HttpCodes.OK)
        .json({ numberOfAffectedRows, affectedRows });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  return {
    getAll,
    // getByAnnualConference,
    // get,
    add,
    update,
    remove,
    order
  };
};

module.exports = LiveChatControllers;
