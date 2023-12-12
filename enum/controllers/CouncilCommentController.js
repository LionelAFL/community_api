const db = require("../models");
const { literal } = require("sequelize");
const HttpCodes = require("http-codes");
const NotificationController = require("./NotificationController");

const CouncilComment = db.CouncilComment;

const CouncilCommentController = () => {
  /**
   * Method to add CouncilComment object
   * @param {*} req
   * @param {*} res
   */
  const add = async (req, res) => {
    try {
      let data = { ...req.body };
      data.UserId = req.user.id;

      const councilComment = await CouncilComment.create(data);

      if (councilComment) {
        await NotificationController().createNotification({
          message: `New Comment "${councilComment.comment}" was created.`,
          type: "comment",
          meta: {
            ...councilComment,
          },
          UserId: req.user.id,
          onlyFor: [-1],
        });
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
   * Method to get comments bu councils
   * @param {*} req
   * @param {*} res
   */
  const getAll = async (req, res) => {
    const filter = req.query;
    try {
      let where = {};

      if (filter.councilId) {
        where = {
          ...where,
          CouncilId: filter.councilId,
        };
      }

      let comments = await CouncilComment.findAndCountAll({
        where,
        limit: filter.num,
        order: [["createdAt", "DESC"]],
        attributes: {
          include: [
            [
              literal(`(
                    SELECT UserFN."img"
                    FROM "Users" as UserFN
                    WHERE
                      UserFN.id = "CouncilComment"."UserId"
                )`),
              "userImg",
            ],
            [
              literal(`(
                    SELECT UserFN."firstName"
                    FROM "Users" as UserFN
                    WHERE
                      UserFN.id = "CouncilComment"."UserId"
                )`),
              "userFirstName",
            ],
            [
              literal(`(
                    SELECT UserFN."lastName"
                    FROM "Users" as UserFN
                    WHERE
                      UserFN.id = "CouncilComment"."UserId"
                )`),
              "userLastName",
            ],
          ],
        },
      });

      let requests = comments.rows.map((pc) =>
        CouncilComment.findAll({
          where: {
            // CouncilCommentId: pc.dataValues.id,
            CouncilId: filter.councilId,
          },
          order: [["createdAt", "DESC"]],
          attributes: {
            include: [
              [
                literal(`(
                    SELECT UserFN."img"
                    FROM "Users" as UserFN
                    WHERE
                      UserFN.id = "CouncilComment"."UserId"
                )`),
                "userImg",
              ],
              [
                literal(`(
                    SELECT UserFN."firstName"
                    FROM "Users" as UserFN
                    WHERE
                      UserFN.id = "CouncilComment"."UserId"
                )`),
                "userFirstName",
              ],
              [
                literal(`(
                    SELECT UserFN."lastName"
                    FROM "Users" as UserFN
                    WHERE
                      UserFN.id = "CouncilComment"."UserId"
                )`),
                "userLastName",
              ],
            ],
          },
        })
      );
      let results = await Promise.all(requests);
      results.map((item, index) => {
        comments.rows[index].dataValues["CouncilComments"] = item;
      });

      if (!comments) {
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }

      return res.status(HttpCodes.OK).json({ comments });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  /**
   * Method to delete CouncilComment object
   * @param {*} req
   * @param {*} res
   */
  const remove = async (req, res) => {
    let { id } = req.params;

    if (id) {
      try {
        await CouncilComment.destroy({
          where: { id },
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

  return {
    getAll,
    add,
    remove,
  };
};

module.exports = CouncilCommentController;
