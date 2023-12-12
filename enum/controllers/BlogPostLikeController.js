const db = require("../models");
const HttpCodes = require("http-codes");
const NotificationController = require("../controllers/NotificationController");

const BlogPostLike = db.BlogPostLike;

const BlogPostLikeController = () => {
  /**
   * Method to add PostLike object
   * @param {*} req
   * @param {*} res
   */
  const add = async (req, res) => {
    try {
      let data = { ...req.body };
      const { firstName, lastName, id: UserId } = req.user;

      data = {
        ...data,
        UserId,
      };
      const blogPostLike = await BlogPostLike.create(data);

      if (data.UserId !== data.blogPostOwnerUserId) {
        await NotificationController().createNotification({
          message: `${firstName} ${lastName} liked your post.`,
          type: "Blog Post",
          meta: {
            ...blogPostLike,
          },
          onlyFor: [data.blogPostOwnerUserId],
        });
      }

      return res.status(HttpCodes.OK).send({ blogPostLike });
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
        await BlogPostLike.destroy({
          where: { BlogPostId: id, UserId: req.user.id },
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

module.exports = BlogPostLikeController;
