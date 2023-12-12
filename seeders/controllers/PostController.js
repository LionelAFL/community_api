const db = require("../models");
const HttpCodes = require("http-codes");
const Sequelize = require("sequelize");
const isEmpty = require("lodash/isEmpty");
const { literal, Op } = require("sequelize");
const s3Service = require("../services/s3.service");
const { isValidURL } = require("../utils/profile");

const QueryTypes = Sequelize.QueryTypes;
const Post = db.Post;
const User = db.User;

const PostController = () => {
  /**
   * Method to get all Post objects
   * @param {*} req
   * @param {*} res
   */
  const getAll = async (req, res) => {
    const filter = req.query;
    try {
      let posts = await Post.findAll();

      if (!posts) {
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }

      return res.status(HttpCodes.OK).json({ posts });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };
  /**
   * Method to get all Podcast objects
   * @param {*} req
   * @param {*} res
   */
  const searchPost = async (req, res) => {
    const filter = req.query;
    try {
      let where = {};

      if (filter.topics && !isEmpty(JSON.parse(filter.topics))) {
        where = {
          ...where,
          topics: {
            [Op.overlap]: JSON.parse(filter.topics),
          },
        };
      }

      if (filter.text) {
        where = {
          ...where,
          text: {
            [Op.iLike]: `%${filter.text}%`,
          },
        };
      }

      let posts = await Post.findAndCountAll({
        where,
        offset: (filter.page - 1) * filter.num,
        limit: filter.num,
        order: [["createdAt", "DESC"]],
        include: User,
        attributes: {
          include: [
            [
              literal(`(
                    SELECT 
                    CASE WHEN count(1) > 0 
                      THEN TRUE
                      ELSE FALSE
                    END
                    FROM "PostLikes" pl 
                    WHERE pl."PostId" = "Post"."id" AND pl."UserId" = ${req.user.id}
                  )`),
              "like",
            ],
            [
              literal(`(
                    SELECT 
                    CASE WHEN count(1) > 0 
                      THEN TRUE
                      ELSE FALSE
                    END
                    FROM "PostFollows" pf 
                    WHERE pf."PostId" = "Post"."id" AND pf."UserId" = ${req.user.id}
                  )`),
              "follow",
            ],
            [
              literal(`(
                    SELECT 
                    count(1)
                    FROM "PostLikes" pl 
                    WHERE pl."PostId" = "Post"."id"
                  )`),
              "likes",
            ],
            [
              literal(`(
                    SELECT 
                    count(1)
                    FROM "PostComments" pc
                    WHERE pc."PostId" = "Post"."id"
                  )`),
              "comments",
            ],
          ],
        },
      });
      if (!posts) {
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }

      return res.status(HttpCodes.OK).json({ posts });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };
  /**
   * Method to get Post object
   * @param {*} req
   * @param {*} res
   */
  const get = async (req, res) => {
    const { id } = req.params;
    if (id) {
      try {
        let post = await Post.findOne({
          where: {
            id,
          },
          include: User,
          attributes: {
            include: [
              [
                literal(`(
                    SELECT 
                    CASE WHEN count(1) > 0 
                      THEN TRUE
                      ELSE FALSE
                    END
                    FROM "PostLikes" pl 
                    WHERE pl."PostId" = "Post"."id" AND pl."UserId" = ${req.user.id}
                  )`),
                "like",
              ],
              [
                literal(`(
                      SELECT 
                      CASE WHEN count(1) > 0 
                        THEN TRUE
                        ELSE FALSE
                      END
                      FROM "PostFollows" pf 
                      WHERE pf."PostId" = "Post"."id" AND pf."UserId" = ${req.user.id}
                    )`),
                "follow",
              ],
              [
                literal(`(
                      SELECT 
                      count(1)
                      FROM "PostLikes" pl 
                      WHERE pl."PostId" = "Post"."id"
                    )`),
                "likes",
              ],
              [
                literal(`(
                      SELECT 
                      count(1)
                      FROM "PostComments" pc
                      WHERE pc."PostId" = "Post"."id"
                    )`),
                "comments",
              ],
            ],
          },
        });

        if (!post) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }

        return res.status(HttpCodes.OK).json({ post });
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
  /**
   * Method to add Post object
   * @param {*} req
   * @param {*} res
   */
  const add = async (req, res) => {
 
    try {
      let data = { ...req.body };
      let imageResponseArray = []
      if (data.text) {
        data.text = data.text.html;
      }
      data.UserId = req.user.id;
      let post = await Post.create(data);

      if (data.imageObject) {

        await Promise.all(
          data.imageObject.map(async (imageData) => {
            let image = await s3Service().getPostImageUrl("", imageData);
            imageResponseArray = [...imageResponseArray,image]
            return
          })
        )
        
        await Post.update({ imageUrl: JSON.stringify(imageResponseArray) }, { where: { id: post.id } });
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
   * Method to update Post object
   * @param {*} req
   * @param {*} res
   */
  const update = async (req, res) => {
    const { id } = req.params;
    const { body } = req;

    if (id) {
      try {
        let data = {};
        let fields = ["text", "videoUrl", "topics"];
        for (let item of fields) {
          if (body[item]) {
            if (item === "text") {
              data = { ...data, [item]: body[item].html };
            } else {
              data = { ...data, [item]: body[item] };
            }
          }
        }

        let post = await Post.findOne({
          where: {
            id,
          },
        });

        if (!post) {
          return res
            .status(HttpCodes.BAD_REQUEST)
            .json({ msg: "Bad Request: post not found." });
        }

        if (body.imageData && !isValidURL(body.imageData)) {
          data.imageUrl = await s3Service().getPostImageUrl("", body.imageData);

          if (post.imageUrl) {
            await s3Service().deleteUserPicture(post.imageUrl);
          }
        }

        if (post.imageUrl && !body.imageData) {
          await s3Service().deleteUserPicture(post.imageUrl);
          data.imageUrl = "";
        }

        post = await Post.update(data, {
          where: { id },
        });

        post = await Post.findOne({
          where: {
            id,
          },
          include: User,
          attributes: {
            include: [
              [
                literal(`(
                    SELECT 
                    CASE WHEN count(1) > 0 
                      THEN TRUE
                      ELSE FALSE
                    END
                    FROM "PostLikes" pl 
                    WHERE pl."PostId" = "Post"."id" AND pl."UserId" = ${req.user.id}
                  )`),
                "like",
              ],
            ],
          },
        });

        return res.status(HttpCodes.OK).send({ post });
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
  /**
   * Method to delete Post object
   * @param {*} req
   * @param {*} res
   */
  const remove = async (req, res) => {
    let { id } = req.params;

    if (id) {
      try {
        let query = `
        DELETE FROM "PostComments" 
        WHERE 
        "PostComments"."PostId" = ${id}
        `;

        await db.sequelize.query(query, {
          type: QueryTypes.DELETE,
        });

        query = `DELETE FROM "PostFollows" 
        WHERE 
        "PostFollows"."PostId" = ${id}`;

        await db.sequelize.query(query, {
          type: QueryTypes.DELETE,
        });

        query = `DELETE FROM "PostLikes" 
        WHERE 
        "PostLikes"."PostId" = ${id}`;

        await db.sequelize.query(query, {
          type: QueryTypes.DELETE,
        });

        await Post.destroy({
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
    get,
    add,
    update,
    remove,
    searchPost,
  };
};

module.exports = PostController;
