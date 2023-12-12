const db = require("../models");
const HttpCodes = require("http-codes");
const { Op, fn } = require("sequelize");

const Library = db.Library;
const Podcast = db.Podcast;
const Event = db.Event;
const ConferenceLibrary = db.ConferenceLibrary;

const HomeController = () => {
  /**
   * New algorithm to get recommendations.
   * @param {*} req 
   * @param {*} res 
   * @returns Json object with all recommendations.
   */
  const getRecommendations = async (req, res) => {
    const { user } = req;

    try {
      let order = [ [fn('RANDOM')] ];
      let limit = 1;
      let where = {
        libraries: {
          approvalStatus: 'approved',
        },
        podcast: {},
        events: {
          startDate: {
            [Op.gte]: new Date(),
          }
        },
        conference: {},
      };

      if(user.topicsOfInterest != null && user.topicsOfInterest.length > 0){
        where["libraries"]["topics"] = { [Op.overlap]: user.topicsOfInterest };
        where["podcast"]["topics"] = { [Op.overlap]: user.topicsOfInterest };
        where["events"]["categories"] = { [Op.overlap]: user.topicsOfInterest };
        where["conference"]["categories"] = { [Op.overlap]: user.topicsOfInterest };
      }
      const libraries = await Library.findAll({
        where: where["libraries"],
        order,
        limit,
      });

      const podcasts = await Podcast.findAll({
        where: where["podcast"],
        order,
        limit,
      });

      const events = await Event.findAll({
        where: where["events"],
        order,
        limit,
      });

      const conferenceLibrary = await ConferenceLibrary.findAll({
        where: where["conference"],
        order,
        limit,
      });

      return res.status(HttpCodes.OK).json({
        libraries,
        podcasts,
        events,
        conferenceLibrary,
      });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };
  return {
    getRecommendations,
  };
};

module.exports = HomeController;