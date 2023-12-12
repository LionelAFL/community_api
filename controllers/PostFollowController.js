const db = require("../models");
const HttpCodes = require("http-codes");

const PostFollow = db.PostFollow;

const PostFollowController = () => {
  /**
   * Method to add PostFollow object
   * @param {*} req
   * @param {*} res
   */
  const add = async (req, res) => {
    try {
      let data = { ...req.body };
      data.UserId = req.user.id;
      await PostFollow.create(data);

      return res.status(HttpCodes.OK).send();
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };
  /**
   * Method to delete PostFollow object
   * @param {*} req
   * @param {*} res
   */
  const remove = async (req, res) => {
    let { id } = req.params;

    if (id) {
      try {
        await PostFollow.destroy({
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

module.exports = PostFollowController;
