const db = require("../models");
const HttpCodes = require("http-codes");

const SimulationSprintDeliverable = db.SimulationSprintDeliverable;

const SimulationSprintDeliverableController = () => {
  /**
   * Create resources
   * @param {*} req
   * @param {*} res
   */
  const create = async (req, res) => {
    const { body } = req;

    try {
      const simulationSprintDeliverable =
        await SimulationSprintDeliverable.create({
          ...body,
        });

      return res.status(HttpCodes.OK).json({ simulationSprintDeliverable });
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
    const { id: SimulationSprintId } = req.params;

    try {
      const simulationSprintDeliverables =
        await SimulationSprintDeliverable.findAll({
          where: {
            SimulationSprintId,
          },
          order: [["dueDate"]],
        });

      return res.status(HttpCodes.OK).json({ simulationSprintDeliverables });
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal Server error",
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
        const simulationSprintDeliverable =
          await SimulationSprintDeliverable.findOne({
            where: {
              id,
            },
          });

        if (!simulationSprintDeliverable) {
          return res.status(HttpCodes.BAD_REQUEST).json({
            msg: "Bad Request: Simulation Sprint Deliverable not found.",
          });
        }

        return res.status(HttpCodes.OK).json({ simulationSprintDeliverable });
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
          await SimulationSprintDeliverable.update(
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
        await SimulationSprintDeliverable.destroy({
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

module.exports = SimulationSprintDeliverableController;
