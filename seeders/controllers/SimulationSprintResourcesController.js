const db = require("../models");
const HttpCodes = require("http-codes");

const SimulationSprintResource = db.SimulationSprintResource;

const SimulationSprintResourcesController = () => {
  /**
   * Create resources
   * @param {*} req
   * @param {*} res
   */
  const create = async (req, res) => {
    const { body } = req;

    try {
      const simulationSprintResource = await SimulationSprintResource.create({
        ...body,
      });

      return res.status(HttpCodes.OK).json({ simulationSprintResource });
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal server error",
        error,
      });
    }
  };

  /**
   * Get all resources
   * @param {*} req
   * @param {*} res
   */
  const getAll = async (req, res) => {
    const { SimulationSprintId } = req.params;

    try {
      const simulationSprintResources = await SimulationSprintResource.findAll({
        where: {
          SimulationSprintId,
        },
        order: [["releaseDate"]],
      });

      return res.status(HttpCodes.OK).json({ simulationSprintResources });
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal Server error",
        error,
      });
    }
  };

  /**
   * Get resource
   * @param {*} req
   * @param {*} res
   */
  const get = async (req, res) => {
    const { id } = req.params;

    if (id) {
      try {
        const simulationSprintResource = await SimulationSprintResource.findOne(
          {
            where: {
              id,
            },
          }
        );

        if (!simulationSprintResource) {
          return res.status(HttpCodes.BAD_REQUEST).json({
            msg: "Bad Request: Simulation Sprint Resource not found.",
          });
        }

        return res.status(HttpCodes.OK).json({ simulationSprintResource });
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error." });
      }
    }
  };

  /**
   * Update a resource
   * @param {*} req
   * @param {*} res
   */
  const update = async (req, res) => {
    const { id } = req.params;

    if (id) {
      try {
        const [numberOfAffectedRows, affectedRows] =
          await SimulationSprintResource.update(
            { ...req.body },
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
  };

  /**
   * Remove a resource
   * @param {*} req
   * @param {*} res
   */
  const remove = async (req, res) => {
    const { id } = req.params;

    if (id) {
      try {
        await SimulationSprintResource.destroy({
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

    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: Simulation Sprint Resource id is wrong." });
  };

  return {
    create,
    getAll,
    get,
    remove,
    update,
  };
};

module.exports = SimulationSprintResourcesController;
