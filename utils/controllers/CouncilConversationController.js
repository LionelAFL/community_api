const db = require("../models");
const HttpCodes = require("http-codes");
const { isValidURL } = require("../utils/profile");
const s3Service = require("../services/s3.service");
const NotificationController = require("../controllers/NotificationController");
const { Op } = require("sequelize");
const { isEmpty } = require("lodash");
const qs = require("query-string");

const CouncilConversation = db.CouncilConversation;
const CouncilConversationComment = db.CouncilConversationComment;
const CouncilConversationReply = db.CouncilConversationReply;
const CouncilConversationLike = db.CouncilConversationLike;
const User = db.User;

const CouncilConversationController = () => {
  const upsert = async (req, res) => {
    const data = req.body;
    const { id } = req.token;

    let transformedData = {
      ...data,
      UserId: id,
    };

    try {
      if (transformedData.imageUrl && !isValidURL(transformedData.imageUrl)) {
        transformedData.imageUrl =
          await s3Service().getCouncilConversationImageUrl(
            "",
            transformedData.imageUrl
          );
      }
      const [_data] = await CouncilConversation.upsert(transformedData, {
        returning: true,
      });

      const councilConversation = await CouncilConversation.findOne({
        where: {
          id: _data.id,
        },
        include: [
          {
            model: User,
          },
          {
            model: CouncilConversationLike,
            include: [
              {
                model: User,
              },
            ],
          },
          {
            model: CouncilConversationComment,
            separate: true,
            include: [
              {
                model: User,
              },
              {
                model: CouncilConversationReply,
                include: [
                  {
                    model: User,
                  },
                ],
              },
            ],
          },
        ],
      });

      const users = await User.findAll({
        where: {
          id: {
            [Op.ne]: id,
          },
          councilMember: "TRUE",
        },
      });

      const userIds = users.map((user) => user.id);

      if (!isEmpty(userIds)) {
        await NotificationController().createNotification({
          message: `A new conversation is created.`,
          type: "council-conversation",
          meta: {
            ..._data,
          },
          onlyFor: userIds,
        });
      }

      return res.status(HttpCodes.OK).json({ councilConversation });
    } catch (err) {
      console.log(err);

      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const getAll = async (req, res) => {
    const { filters } = req.query;

    const { filters: _filters } = qs.parse(filters, { arrayFormat: "comma" });

    let where = {};

    try {
      if (!isEmpty(_filters)) {
        where = {
          topics: {
            [Op.overlap]: Array.isArray(_filters) ? _filters : [_filters],
          },
        };
      }

      const councilConversations = await CouncilConversation.findAll({
        where,
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: User,
          },
        ],
      });

      let councilConversation;

      if (!isEmpty(councilConversations)) {
        councilConversation = await CouncilConversation.findOne({
          where: {
            id: councilConversations[0].id,
          },
          include: [
            {
              model: User,
            },
            {
              model: CouncilConversationLike,
              include: [
                {
                  model: User,
                },
              ],
            },
            {
              model: CouncilConversationLike,
              include: [
                {
                  model: User,
                },
              ],
            },
            {
              model: CouncilConversationComment,
              separate: true,
              include: [
                {
                  model: User,
                },
                {
                  model: CouncilConversationReply,
                  include: [
                    {
                      model: User,
                    },
                  ],
                },
              ],
            },
          ],
        });
      }

      return res
        .status(HttpCodes.OK)
        .json({ councilConversations, councilConversation });
    } catch (err) {
      console.log(err);

      return res
        .sendStatus(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const get = async (req, res) => {
    const { id } = req.params;

    try {
      const councilConversation = await CouncilConversation.findOne({
        where: {
          id,
        },
        include: [
          {
            model: User,
          },
          {
            model: CouncilConversationLike,
            include: [
              {
                model: User,
              },
            ],
          },
          {
            model: CouncilConversationComment,
            separate: true,
            include: [
              {
                model: User,
              },
              {
                model: CouncilConversationReply,
                include: [
                  {
                    model: User,
                  },
                ],
              },
            ],
          },
        ],
      });

      return res.status(HttpCodes.OK).json({ councilConversation });
    } catch (err) {
      console.log(err);

      return res
        .sendStatus(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const destroy = async (req, res) => {
    const { id } = req.params;

    try {
      await CouncilConversation.destroy({
        where: {
          id,
        },
      });

      const councilConversation = await CouncilConversation.findAll({
        order: [["createdAt", "DESC"]],
        limit: 1,
        include: [
          {
            model: User,
          },
          {
            model: CouncilConversationLike,
            include: [
              {
                model: User,
              },
            ],
          },
          {
            model: CouncilConversationComment,
            separate: true,
            include: [
              {
                model: User,
              },
              {
                model: CouncilConversationReply,
                include: [
                  {
                    model: User,
                  },
                ],
              },
            ],
          },
        ],
      });

      return res
        .status(HttpCodes.OK)
        .json({ councilConversation: councilConversation[0] });
    } catch (err) {
      console.log(err);

      return res
        .sendStatus(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  return {
    upsert,
    getAll,
    get,
    destroy,
  };
};

module.exports = CouncilConversationController;
