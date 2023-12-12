const db = require("../models");
const { literal } = require("sequelize");
const HttpCodes = require("http-codes");
const NotificationController = require("./NotificationController");

const BusinessPartnerComment = db.BusinessPartnerComment;

const BusinessPartnerCommentController = () => {
  /**
   * Method to add BusinessPartnerComment object
   * @param {*} req
   * @param {*} res
   */
  const add = async (req, res) => {
    try {
      let data = { ...req.body };
      data.UserId = req.user.id;
      const businessPartnerComment = await BusinessPartnerComment.create(data);

      if (businessPartnerComment) {
        await NotificationController().createNotification({
          message: `New Comment "${businessPartnerComment.comment}" was created.`,
          type: "comment",
          meta: {
            ...businessPartnerComment,
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
   * Method to get comments bu businessPartners
   * @param {*} req
   * @param {*} res
   */
  const getAll = async (req, res) => {
    const filter = req.query;
    try {
      let where = {};

      if (filter.businessPartnerId) {
        where = {
          ...where,
          BusinessPartnerId: filter.businessPartnerId,
        };
      }

      let comments = await BusinessPartnerComment.findAndCountAll({
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
                      UserFN.id = "BusinessPartnerComment"."UserId"
                )`),
              "userImg",
            ],
            [
              literal(`(
                    SELECT UserFN."firstName"
                    FROM "Users" as UserFN
                    WHERE
                      UserFN.id = "BusinessPartnerComment"."UserId"
                )`),
              "userFirstName",
            ],
            [
              literal(`(
                    SELECT UserFN."lastName"
                    FROM "Users" as UserFN
                    WHERE
                      UserFN.id = "BusinessPartnerComment"."UserId"
                )`),
              "userLastName",
            ],
          ],
        },
      });

      let requests = comments.rows.map((pc) =>
        BusinessPartnerComment.findAll({
          where: {
            // businessPartnerCommentId: pc.dataValues.id,
            BusinessPartnerId: filter.businessPartnerId,
          },
          order: [["createdAt", "DESC"]],
          attributes: {
            include: [
              [
                literal(`(
                    SELECT UserFN."img"
                    FROM "Users" as UserFN
                    WHERE
                      UserFN.id = "BusinessPartnerComment"."UserId"
                )`),
                "userImg",
              ],
              [
                literal(`(
                    SELECT UserFN."firstName"
                    FROM "Users" as UserFN
                    WHERE
                      UserFN.id = "BusinessPartnerComment"."UserId"
                )`),
                "userFirstName",
              ],
              [
                literal(`(
                    SELECT UserFN."lastName"
                    FROM "Users" as UserFN
                    WHERE
                      UserFN.id = "BusinessPartnerComment"."UserId"
                )`),
                "userLastName",
              ],
            ],
          },
        })
      );
      let results = await Promise.all(requests);
      results.map((item, index) => {
        comments.rows[index].dataValues["BusinessPartnerComments"] = item;
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
   * Method to delete BusinessPartnerComment object
   * @param {*} req
   * @param {*} res
   */
  const remove = async (req, res) => {
    let { id } = req.params;
    if (id) {
      try {
        await BusinessPartnerComment.destroy({
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

module.exports = BusinessPartnerCommentController;
