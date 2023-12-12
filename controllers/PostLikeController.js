const db = require("../models");
const HttpCodes = require("http-codes");
const NotificationController = require("../controllers/NotificationController");

const PostLike = db.PostLike;

const PostLikeController = () => {
  /**
   * Method to add PostLike object
   * @param {*} req
   * @param {*} res
   */
  const add = async (req, res) => {
    try {
      let data = { ...req.body };
      const { firstName, lastName } = req.user;
      data.UserId = req.user.id;
      const postLike = await PostLike.create(data);

      if (data.UserId !== data.postOwnerUserId) {
        await NotificationController().createNotification({
          message: `${firstName} ${lastName} liked your post.`,
          type: "post",
          meta: {
            ...postLike,
          },
          onlyFor: [data.postOwnerUserId],
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
   * Method to delete PostLike object
   * @param {*} req
   * @param {*} res
   */
  const remove = async (req, res) => {
    let { id } = req.params;

    if (id) {
      try {
        await PostLike.destroy({
          where: { PostId: id, UserId: req.user.id },
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
    add,
    remove,
  };
};

module.exports = PostLikeController;
