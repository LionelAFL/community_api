"use strict";
const db = require("../models");
const CouncilEventPanel = db.CouncilEventPanel;

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    const councilEventPanels = await CouncilEventPanel.findAll({
      attributes: { exclude: ["startDate", "endDate"] },
    });
    const transformedCouncilEventPanels = councilEventPanels.map((panel) => ({
      ...panel.dataValues,
      startDate: panel.dataValues.panelStartAndEndDate[0],
      endDate: panel.dataValues.panelStartAndEndDate[1],
    }));

    await Promise.all([
      queryInterface.addColumn("CouncilEventPanels", "startDate", {
        type: Sequelize.DATE,
      }),
      queryInterface.addColumn("CouncilEventPanels", "endDate", {
        type: Sequelize.DATE,
      }),
    ]);

    const upsertedData = transformedCouncilEventPanels.map((panel) =>
      CouncilEventPanel.upsert(panel)
    );

    await Promise.all(upsertedData);

    // await queryInterface.removeColumn(
    //   "CouncilEventPanels",
    //   "panelStartAndEndDate"
    // );
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    // await queryInterface.addColumn(
    //   "CouncilEventPanels",
    //   "panelStartAndEndDate",
    //   {
    //     type: Sequelize.ARRAY(Sequelize.DATE),
    //   }
    // );
    const councilEventPanels = await CouncilEventPanel.findAll();
    const transformedCouncilEventPanels = councilEventPanels.map((panel) => ({
      ...panel.dataValues,
      panelStartAndEndDate: [panel.startDate, panel.endDate],
    }));
    const upsertedData = transformedCouncilEventPanels.map((panel) =>
      CouncilEventPanel.upsert(panel)
    );
    await Promise.all(upsertedData);
    await Promise.all([
      queryInterface.removeColumn("CouncilEventPanels", "startDate"),
      queryInterface.removeColumn("CouncilEventPanels", "endDate"),
    ]);
  },
};
