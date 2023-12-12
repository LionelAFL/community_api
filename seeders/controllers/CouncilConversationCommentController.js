const db = require("../models");
const HttpCodes = require("http-codes");

const CouncilConversationComment = db.CouncilConversationComment;
const CouncilConversation = db.CouncilConversation;
const CouncilConversationReply = db.CouncilConversationReply;
const CouncilConversationLike = db.CouncilConversationLike;
const User = db.User;

const CouncilConversationCommentController = () => {
  const upsert = async (req, res) => {
    const data = req.body;
    const { id } = req.token;

    console.log("cringe", data);

    try {
      await CouncilConversationComment.upsert({
        ...data,
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
    const data = req.body;

    try {
      await CouncilConversationComment.destroy({
        where: {
          id,
        },
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
    upsert,
    destroy,
  };
};

module.exports = CouncilConversationCommentController;
