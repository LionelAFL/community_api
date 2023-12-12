const db = require("../models");
const HttpCodes = require("http-codes");
const Sequelize = require("sequelize");

const QueryTypes = Sequelize.QueryTypes;
const JourneyItems = db.JourneyItems;

const JourneyItemController = () => {
  /**
   * Method to get all JourneyItem objects by Journey
   * @param {*} req 
   * @param {*} res 
   */
  const getItemsByJourney = async (req, res) => {
    const { id } = req.params;
    let { removed } = req.query;
    let loadRemovedItems = '';

    try {
      removed = (removed === 'true');

      if(removed === false){
        loadRemovedItems = ' WHERE removed = FALSE ';
      }

      const query = `
        SELECT * FROM (
          SELECT ji.*, l.title, l.description, l.link, l.image FROM "Libraries" l
          INNER JOIN "JourneyItems" ji ON l.id = ji."contentId"
          WHERE ji."JourneyId" = ${id}
          AND ji."contentType" IN ('article', 'video')
          UNION
          SELECT ji.*, p.title, p.description, p."appleLink" AS link, p."imageUrl" as image FROM "Podcasts" p
          INNER JOIN "JourneyItems" ji ON p.id = ji."contentId"
          WHERE ji."JourneyId" = ${id}
          AND ji."contentType" = 'podcast'
          UNION
          SELECT ji.*, e.title, CAST(e.description AS varchar) AS description, e."publicLink" as link, e.image FROM "Events" e
          INNER JOIN "JourneyItems" ji ON e.id = ji."contentId"
          WHERE ji."JourneyId" = ${id}
          AND ji."contentType" = 'event'
        ) JourneyItemsUnion
        ${loadRemovedItems}
        ORDER BY "title" ASC
      `;

      const results = await db.sequelize.query(query, {
        type: QueryTypes.SELECT,
      });

      if (!results) {
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }

      return res
          .status(HttpCodes.OK)
          .json({ journeyItems: results });

    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  /**
   * Method to updated JourneyItem object
   * @param {*} req 
   * @param {*} res 
   */
  const update = async (req, res) => {
    const { id } = req.params;
    const { body } = req

    if (id) {
      try {
        let data = {};
        let fields = [
          "viewed",
          "removed",
          "isNew",
          "order",
        ];
        for (let item of fields) {
          if (body[item] != null && body[item] != undefined) {
            data = { ...data, [item]: body[item] };
          }
        }
        await JourneyItems.update(data, {
          where: { id }
        });
        return res
          .status(HttpCodes.OK)
          .send();
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
    getItemsByJourney,
    update,
  };
};
module.exports = JourneyItemController;