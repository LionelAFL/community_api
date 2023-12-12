const db = require("../models");
const HttpCodes = require("http-codes");

const CouncilConversationComment = db.CouncilConversationComment;
const CouncilConversation = db.CouncilConversation;
const CouncilConversationReply = db.CouncilConversationReply;
const CouncilConversationLike = db.CouncilConversationLike;
const User = db.User;

const CouncilConversationLikeController = () => {
  const create = async (req, res) => {
    const data = req.body;
    const { id } = req.token;

    try {
      await CouncilConversationLike.create({
        CouncilConversationId: data.CouncilConversationId,
        UserId: id,
      });

      const councilConversation = await CouncilConversation.findOne({
        where: {
          id: data.CouncilConversationId,
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

      return res.status(HttpCodes.OK).json({ councilConversation });
    } catch (error) {
      console.log(error);

      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const destroy = async (req, res) => {
    const { id } = req.params;
    const { id: userId } = req.token;

    try {
      await CouncilConversationLike.destroy({
        where: {
          CouncilConversationId: id,
          UserId: userId,
        },
      });

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
    } catch (error) {
      console.log(error);

      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  return {
    create,
    destroy,
  };
};

module.exports = CouncilConversationLikeController;
