const db = require("../models");
const { literal } = require("sequelize");
const HttpCodes = require("http-codes");
const NotificationController = require("../controllers/NotificationController");

const PostComment = db.PostComment;

const PostCommentController = () => {
  /**
   * Method to add PostComment object
   * @param {*} req
   * @param {*} res
   */
  const add = async (req, res) => {
    try {
      let data = { ...req.body };
      const { firstName, lastName } = req.user;
      data.UserId = req.user.id;
      const postComment = await PostComment.create(data);

      const notifications = [];

      if (data.isAComment && data.postOwnerUserId !== data.UserId) {
        const notif = NotificationController().createNotification({
          message: `${firstName} ${lastName} commented on your post.`,
          type: "post",
          meta: {
            ...postComment,
          },
          onlyFor: [data.postOwnerUserId],
        });

        notifications.push(notif);
      }

      if (!data.isAComment) {
        if (data.postCommentUserId !== data.UserId) {
          const commentOwnerNotif = NotificationController().createNotification(
            {
              message: `${firstName} ${lastName} replied to your comment.`,
              type: "post",
              meta: {
                ...postComment,
              },
              onlyFor: [data.postCommentUserId],
            }
          );

          notifications.push(commentOwnerNotif);
        }

        if (
          data.postOwnerUserId !== data.postCommentUserId &&
          data.postOwnerUserId !== data.UserId
        ) {
          const postOwnerNotif = NotificationController().createNotification({
            message: `Someone replied to a comment on your post.`,
            type: "post",
            meta: {
              ...postComment,
            },
            onlyFor: [data.postOwnerUserId],
          });

          notifications.push(postOwnerNotif);
        }
      }

      await Promise.all(notifications);

      return res.status(HttpCodes.OK).send();
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  /**
   * Method to get comments bu post
   * @param {*} req
   * @param {*} res
   */
  const getAll = async (req, res) => {
    const filter = req.query;
    try {
      let where = { PostCommentId: null };

      if (filter.postId) {
        where = {
          ...where,
          PostId: filter.postId,
        };
      }

      let comments = await PostComment.findAndCountAll({
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
                      UserFN.id = "PostComment"."UserId"
                )`),
              "userImg",
            ],
            [
              literal(`(
                    SELECT UserFN."firstName"
                    FROM "Users" as UserFN
                    WHERE
                      UserFN.id = "PostComment"."UserId"
                )`),
              "userFirstName",
            ],
            [
              literal(`(
                    SELECT UserFN."lastName"
                    FROM "Users" as UserFN
                    WHERE
                      UserFN.id = "PostComment"."UserId"
                )`),
              "userLastName",
            ],
          ],
        },
      });

      let requests = comments.rows.map((pc) =>
        PostComment.findAll({
          where: { PostCommentId: pc.dataValues.id, PostId: filter.postId },
          order: [["createdAt", "DESC"]],
          attributes: {
            include: [
              [
                literal(`(
                    SELECT UserFN."img"
                    FROM "Users" as UserFN
                    WHERE
                      UserFN.id = "PostComment"."UserId"
                )`),
                "userImg",
              ],
              [
                literal(`(
                    SELECT UserFN."firstName"
                    FROM "Users" as UserFN
                    WHERE
                      UserFN.id = "PostComment"."UserId"
                )`),
                "userFirstName",
              ],
              [
                literal(`(
                    SELECT UserFN."lastName"
                    FROM "Users" as UserFN
                    WHERE
                      UserFN.id = "PostComment"."UserId"
                )`),
                "userLastName",
              ],
            ],
          },
        })
      );
      let results = await Promise.all(requests);
      results.map((item, index) => {
        comments.rows[index].dataValues["PostComments"] = item;
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
   * Method to delete PostComment object
   * @param {*} req
   * @param {*} res
   */
  const remove = async (req, res) => {
    let { id } = req.params;

    if (id) {
      try {
        await PostComment.destroy({
          where: { PostCommentId: id },
        });
        await PostComment.destroy({
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

module.exports = PostCommentController;
