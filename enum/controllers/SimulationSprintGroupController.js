const db = require("../models");
const HttpCodes = require("http-codes");

const SimulationSprint = db.SimulationSprint;
const SimulationSprintGroup = db.SimulationSprintGroup;
const SimulationSprintParticipant = db.SimulationSprintParticipant;

const User = db.User;

const SimulationSprintGroupController = () => {
  const create = async (req, res) => {
    const { SimulationSprintId, members, groupName } = req.body;

    try {
      const simulationSprint = await SimulationSprint.findOne({
        where: {
          id: SimulationSprintId,
        },
      });

      if (simulationSprint) {
        const simulationSprintGroupExist = await SimulationSprintGroup.findOne({
          where: {
            SimulationSprintId,
            groupName,
          },
        });

        if (simulationSprintGroupExist) {
          return res.status(HttpCodes.CONFLICT).json({
            msg: "A group already exists in this simulation with this identification number",
          });
        }

        const simulationSprintGroup = await SimulationSprintGroup.create({
          ...req.body,
        });

        if (simulationSprintGroup) {
          await Promise.all(
            members.map(async (participantId) => {
              return await SimulationSprintParticipant.update(
                { SimulationSprintGroupId: simulationSprintGroup.id },
                {
                  where: {
                    id: participantId,
                  },
                }
              );
            })
          );

          return res
            .status(HttpCodes.CREATED)
            .json({ msg: "Simulation Sprint Group created Successfully" });
        }

        return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
          msg: "Internal server error",
        });
      }

      return res
        .status(HttpCodes.BAD_REQUEST)
        .json({ msg: "Simulation Sprint Not found" });
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal server error",
        error,
      });
    }
  };

  const get = async (req, res) => {
    const { id } = req.params;
    if (id) {
      try {
        const simulationSprintGroup = await SimulationSprintGroup.findOne({
          where: {
            id,
          },
          include: [
            {
              model: SimulationSprintParticipant,
              include: [
                {
                  model: User,
                  attributes: ["firstName", "lastName", "email", "img"],
                },
              ],
            },
          ],
        });

        if (!simulationSprintGroup) {
          return res
            .status(HttpCodes.BAD_REQUEST)
            .json({ msg: "Bad Request: Simulation Sprint not found." });
        }

        return res.status(HttpCodes.OK).json({ simulationSprintGroup });
      } catch (error) {
        console.log(error);
        return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
          msg: "Internal server error",
          error,
        });
      }
    }
  };

  const update = async (req, res) => {
    const { id } = req.params;
    const { members, membersRemoved } = req.body;

    if (id) {
      try {
        const [numberOfAffectedRows, affectedRows] =
          await SimulationSprintGroup.update(
            { ...req.body },
            {
              where: { id },
              returning: true,
              plain: true,
            }
          );

        await Promise.all(
          members.map(async (participantId) => {
            return await SimulationSprintParticipant.update(
              { SimulationSprintGroupId: id },
              {
                where: {
                  id: participantId,
                },
              }
            );
          })
        );

        if (membersRemoved) {
          await Promise.all(
            membersRemoved.map(async (participantId) => {
              return await SimulationSprintParticipant.update(
                { SimulationSprintGroupId: null },
                {
                  where: {
                    id: participantId,
                  },
                }
              );
            })
          );
        }

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

  const remove = async (req, res) => {
    const { id } = req.params;

    if (id) {
      try {
        await SimulationSprintGroup.destroy({
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
      .json({ msg: "Bad Request: Simulation Sprint Group id is wrong." });
  };

  return {
    create,
    get,
    update,
    remove,
  };
};

module.exports = SimulationSprintGroupController;
