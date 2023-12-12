const db = require("../models");
const HttpCodes = require("http-codes");
const { Sequelize, Op } = require("sequelize");
const s3Service = require("../services/s3.service");
const socketService = require("../services/socket.service");
const SocketEventTypes = require("../enum/SocketEventTypes");
const Message = db.Message;

const MessageController = () => {
  const create = async (message) => {
    try {
      if (message.thumbUrl) {
        const fileType = message.thumbUrl.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/);

        const index = fileType[0].indexOf("/");

        let type = fileType[0];

        if (index !== -1) {
          type = fileType[0].slice(0, index);
        }

        const { Location: documentFileUrl } = await s3Service().uploadFile(
          message.thumbUrl,
          fileType[0],
          message.name
        );

        const newMessage = await Message.create({
          ConversationId: message.ConversationId,
          sender: message.sender,
          viewedUser: message.viewedUser,
          documentFileUrl: documentFileUrl,
          type: type === "application" ? "document" : type,
        });

        return newMessage;
      }

      const newMessage = await Message.create(message);
      return newMessage;
    } catch (error) {
      // res
      //   .status(HttpCodes.INTERNAL_SERVER_ERROR)
      //   .json({ msg: "Internal server error" });
      console.log(error);
    }
  };

  const getAll = async (req, res) => {
    const { ConversationId } = req.params;

    try {
      const messages = await Message.findAll({
        where: {
          ConversationId,
        },
      });

      return res.status(HttpCodes.OK).json({ messages });
    } catch (error) {
      res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal Server Error",
      });
      console.log(error);
    }
  };

  const readMessages = async (req, res) => {
    const { userId } = req.body;
    const { ConversationId } = req.params;
    try {
      const [numberOfAffectedRows, affectedRows] = await Message.update(
        {
          viewedUser: Sequelize.fn(
            "array_append",
            Sequelize.col("viewedUser"),
            userId
          ),
        },
        {
          where: {
            [Op.and]: [
              { ConversationId },
              {
                [Op.not]: {
                  viewedUser: {
                    [Op.contains]: [userId],
                  },
                },
              },
            ],
          },
          returning: true,
        }
      );

      return res.status(HttpCodes.OK).json({ messages: affectedRows });
    } catch (error) {
      console.log(error);
    }
  };

  const getMoreMessages = async (req, res) => {
    const { ConversationId } = req.params;
    const { offset } = req.query;

    try {
      const messages = await Message.findAll({
        where: {
          ConversationId,
        },
        order: [["updatedAt", "DESC"]],
        offset,
        limit: 20,
        attributes: [
          "id",
          "ConversationId",
          "sender",
          "text",
          ["updatedAt", "messageDate"],
          "viewedUser",
        ],
      });

      return res.status(HttpCodes.OK).json({ messages });
    } catch (error) {
      console.log(error);
    }
  };

  return {
    create,
    getAll,
    readMessages,
    getMoreMessages,
  };
};

module.exports = MessageController;
