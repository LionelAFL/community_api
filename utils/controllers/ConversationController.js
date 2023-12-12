const db = require("../models");
const HttpCodes = require("http-codes");
const { Op, Sequelize } = require("sequelize");
const socketService = require("../services/socket.service");
const SocketEventTypes = require("../enum/SocketEventTypes");
const Conversation = db.Conversation;
const QueryTypes = Sequelize.QueryTypes;

const ConversationController = () => {
  const create = async (req, res) => {
    const { members } = req.body;
    try {
      const prevConversation = await Conversation.findOne({
        where: {
          members: {
            [Op.contains]: members,
          },
        },
      });

      if (prevConversation.showConversation === false) {
        const [numberOfAffectedRows, affectedRows] = await Conversation.update(
          { showConversation: true },
          {
            where: { id: prevConversation.id },
            returning: true,
            plain: true,
          }
        );

        return socketService().emit(
          SocketEventTypes.NEW_CONVERSATION,
          affectedRows
        );
      }

      if (prevConversation) {
        return socketService().emit(
          SocketEventTypes.NEW_CONVERSATION,
          prevConversation
        );
      }
      const conversation = await Conversation.create({ members });

      const query = `
        SELECT public."Conversations".* FROM public."Conversations" WHERE public."Conversations".id = ${conversation.id}
        `;

      let [newConversation] = await db.sequelize.query(query, {
        type: QueryTypes.SELECT,
      });

      const query2 = `SELECT public."Users".id, public."Users"."abbrName", public."Users"."email", 
      public."Users".img, public."Users"."isOnline", public."Users"."firstName", public."Users"."lastName", public."Users"."timezone",
      public."Users"."isOnline" FROM public."Users" WHERE public."Users".id = ANY (ARRAY[${newConversation.members}]::int[])`;

      let membersInfo = await db.sequelize.query(query2, {
        type: QueryTypes.SELECT,
      });

      newConversation = {
        ...newConversation,
        members: membersInfo,
      };

      socketService().emit(SocketEventTypes.NEW_CONVERSATION, newConversation);
      return newConversation;
    } catch (error) {
      console.log(error);
    }
  };

  const getAll = async (req, res) => {
    const { userId } = req.params;

    try {
      const query = `
     SELECT public."Conversations".*, public."Users".id as userId, public."Users"."abbrName", public."Users"."email", 
     public."Users".img, public."Users"."isOnline", public."Users"."firstName", public."Users"."lastName", public."Users"."timezone",
     public."Users"."isOnline" FROM public."Conversations"
     INNER JOIN public."Users" ON public."Users".id = ANY (public."Conversations".members::int[])
     WHERE public."Conversations"."members" && ARRAY[${userId}]::int[]
     LIMIT 50
     `;

      let conversations = await db.sequelize.query(query, {
        type: QueryTypes.SELECT,
      });

      if (conversations) {
        conversations = await Promise.all(
          conversations.map(async (conversation) => {
            const query2 = `SELECT public."Messages".id, public."Messages".sender, public."Messages"."ConversationId", public."Messages".text,
            public."Messages"."createdAt" as "messageDate", public."Messages"."viewedUser", public."Messages"."documentFileUrl", public."Messages"."type"
            FROM public."Messages" WHERE public."Messages"."ConversationId" = ${conversation.id} 
            ORDER BY public."Messages"."createdAt" DESC LIMIT 50`;

            let messages = await db.sequelize.query(query2, {
              type: QueryTypes.SELECT,
            });

            return {
              ...conversation,
              messages: messages.reverse(),
            };
          })
        );
      }

      return res.status(HttpCodes.OK).json({ conversations });
    } catch (error) {
      res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal Server Error",
      });
      console.log(error);
    }
  };

  const get = async (req, res) => {
    const { conversationId } = req.params;

    try {
      const query = `
      SELECT public."Conversations".*, public."Users".id as userId, public."Users"."abbrName", public."Users"."email", 
      public."Users".img, public."Users"."isOnline", public."Users"."firstName", public."Users"."lastName", public."Users"."timezone",
      public."Users"."isOnline" FROM public."Conversations"
      INNER JOIN public."Users" ON public."Users".id = ANY (public."Conversations".members::int[]) WHERE public."Conversations".id = ${conversationId}
      `;

      const conversation = await db.sequelize.query(query, {
        type: QueryTypes.SELECT,
      });

      return res.status(HttpCodes.OK).json({ conversation });
    } catch (error) {
      res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal Server Error",
      });
      console.log(error);
    }
  };

  const hideConversation = async (req, res) => {
    const { conversationId } = req.params;
    try {
      const [numberOfAffectedRows, affectedRows] = await Conversation.update(
        { showConversation: false },
        {
          where: { id: conversationId },
          returning: true,
          plain: true,
        }
      );

      return res.status(HttpCodes.OK).json({ conversation: affectedRows });
    } catch (error) {
      res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Something went wrong",
      });
      console.log(error);
    }
  };

  return {
    create,
    getAll,
    get,
    hideConversation,
  };
};

module.exports = ConversationController;
