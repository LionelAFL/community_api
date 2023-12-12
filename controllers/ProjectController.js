const db = require("../models");
const HttpCodes = require("http-codes");
const { Op } = require("sequelize");
const isEmpty = require("lodash/isEmpty");

const Project = db.Project;

const ProjectController = () => {
  const create = async (req, res) => {
    const reqProject = req.body;

    try {
      let projectInfo = {
        ...reqProject,
      };

      const project = await Project.create(projectInfo);

      return res.status(HttpCodes.OK).json({ project });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error", error });
    }
  };

  const getAll = async (req, res) => {
    const filter = req.query;
    let where = {};

    try {
      if (filter.topics && !isEmpty(JSON.parse(filter.topics))) {
        where = {
          ...where,
          categories: {
            [Op.overlap]: JSON.parse(filter.topics),
          },
        };
      }

      const projects = await Project.findAll({
        where,
        order: [["datePosted"]],
      });

      return res.status(HttpCodes.OK).json({ projects });
    } catch (err) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const get = async (req, res) => {
    const { id } = req.params;

    if (id) {
      try {
        let project = await Project.findOne({
          where: {
            id,
          },
        });

        if (!project) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Bad Request: Project not found" });
        }

        return res.status(HttpCodes.OK).json({ project });
      } catch (err) {
        console.log(err);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    }

    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: project id is wrong" });
  };

  const update = async (req, res) => {
    const { id } = req.params;
    const reqProject = req.body;

    if (id) {
      try {
        let projectInfo = {
          ...reqProject,
        };

        const prevProject = await Project.findOne({
          where: {
            id,
          },
        });

        if (!prevProject) {
          return res
            .status(HttpCodes.BAD_REQUEST)
            .json({ msg: "Bad Request: project not found." });
        }

        const [numberOfAffectedRows, affectedRows] = await Project.update(
          projectInfo,
          {
            where: { id },
            returning: true,
            plain: true,
          }
        );

        return res
          .status(HttpCodes.OK)
          .json({ numberOfAffectedRows, affectedRows });
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    }

    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: Project id is wrong" });
  };

  const remove = async (req, res) => {
    const { id } = req.params;

    if (id) {
      try {
        await Project.destroy({
          where: {
            id,
          },
        });

        return res.status(HttpCodes.OK).json({});
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    }
  };

  return {
    create,
    getAll,
    get,
    update,
    remove,
  };
};

module.exports = ProjectController;
