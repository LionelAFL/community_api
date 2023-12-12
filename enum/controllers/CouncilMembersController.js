const db = require("../models");
const HttpCodes = require("http-codes");
const NotificationController = require("./NotificationController");

const Council = db.Council;
const User = db.User;

const CouncilMembersController = () => {
  const getCouncilMembers = async (req, res) => {
    try {
      const councilMembers = await User.findAll({
        where: {
          councilMember: true,
        },
      });

      if (!councilMembers) {
        return res
          .status(HttpCodes.BAD_REQUEST)
          .json({ msg: "There are not Council Members" });
      }

      return res.status(HttpCodes.OK).json({ councilMembers });
    } catch (error) {
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const getCouncilResource = async (req, res) => {
    const { id } = req.params;
    try {
      const councilResource = await Council.findOne({
        where: {
          id,
        },
      });

      if (!councilResource) {
        return res
          .status(HttpCodes.BAD_REQUEST)
          .json({ msg: "Bad Request: channel not found." });
      }

      return res.status(HttpCodes.OK).json({ councilResource });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const getAll = async (req, res) => {
    try {
      const councilResources = await Council.findAll();

      if (!councilResources) {
        return res
          .status(HttpCodes.BAD_REQUEST)
          .json({ msg: "There are not Council Members" });
      }

      return res.status(HttpCodes.OK).json({ councilResources });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const create = async (req, res) => {
    const { body } = req;
    if (body.title) {
      try {
        let councilInfo = {
          ...body,
          link: body.link ? `https://${body.link}` : "",
        };

        const newCouncil = await Council.create(councilInfo);

        if (!newCouncil) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }

        await NotificationController().createNotification({
          message: `New Council "${
            newCouncil.title || newCouncil.title
          }" was created.`,
          type: "Council",
          meta: {
            ...newCouncil,
          },
          onlyFor: [-1],
        });

        return res.status(HttpCodes.OK).json({ council: newCouncil });
      } catch (error) {
        console.log(error);
        res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error", error: error });
      }
    }

    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: Title is needed." });
  };

  return {
    getCouncilMembers,
    getCouncilResource,
    getAll,
    create,
  };
};

module.exports = CouncilMembersController;
