const db = require("../models");
const HttpCodes = require("http-codes");
const { isEmpty, flatten } = require("lodash");
const { Op } = require("sequelize");
const moment = require("moment-timezone");

const Podcast = db.Podcast;
const PodcastSeries = db.PodcastSeries;
const Library = db.Library;
const ConferenceLibrary = db.ConferenceLibrary;
const Event = db.Event;
const AnnualConference = db.AnnualConference;
const HrCredits = db.HrCredits
const User = db.User

const LearningController = () => {
  const getAllSaved = async (req, res) => {
    const query = req.query;
    const user = req.user;

    let where = {
      saveForLater: {
        [Op.contains]: [user.id],
      },
    };

    let libraryWhere = {
      ...where,
    };

    try {
      if (query.category && !isEmpty(JSON.parse(query.category))) {
        libraryWhere = {
          ...where,
          categories: {
            [Op.overlap]: JSON.parse(query.category),
          },
        };
      }

      const allLibraries = await Library.findAll({
        where: {
          ...libraryWhere,
        },
        order: [["updatedAt", "DESC"]],
        raw: true,
      });

      const allConferenceLibraries = await ConferenceLibrary.findAll({
        where: {
          ...libraryWhere,
        },
        order: [["updatedAt", "DESC"]],
        raw: true,
      });

      const allPodcasts = await Podcast.findAll({
        where,
        order: [["updatedAt", "DESC"]],
        raw: true,
      });

      const allPodcastSeries = await PodcastSeries.findAll({
        where,
        order: [["updatedAt", "DESC"]],
        raw: true,
      });

      const allSessions = await AnnualConference.findAll({
        where,
        order: [["updatedAt", "DESC"]],
        raw: true,
      });

      let allSaved = [
        allLibraries,
        allConferenceLibraries,
        allPodcasts,
        allPodcastSeries,
        allSessions,
      ];

      allSaved = allSaved.map((items, itemsIndex) => {
        return items.map((item) => {
          let type;
          if (itemsIndex === 0) {
            type = "libraries";
          } else if (itemsIndex === 1) {
            type = "conferences";
          } else if (itemsIndex === 2) {
            type = "podcasts";
          } else if (itemsIndex === 3) {
            type = "podcastSeries";
          } else {
            type = item.type;
          }

          return {
            ...item,
            type,
          };
        });
      });

      allSaved = flatten(allSaved);

      allSaved = allSaved.sort((a, b) => {
        if (moment(a.updatedAt) > moment(b.updatedAt)) {
          return -1;
        } else if (moment(b.updatedAt) < moment(a.updatedAt)) {
          return 1;
        } else {
          return 0;
        }
      });

      const offset = (+query.page - 1) * +query.num;
      const limit = offset + +query.num;

      allSaved = {
        count: allSaved.length,
        rows: allSaved.slice(offset, limit),
      };

      return res.status(HttpCodes.OK).json({ allSaved });
    } catch (error) {
      console.error(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal Server error",
        error,
      });
    }
  };

  const getAllCompleted = async (req, res) => {
    const query = req.query;
    const user = req.user;

    let where = {
      viewed: {
        [Op.contains]: {
          [user.id]: "mark",
        },
      },
    };

    let libraryWhere = {
      ...where,
    };

    try {
      if (query.category && !isEmpty(JSON.parse(query.category))) {
        libraryWhere = {
          ...where,
          categories: {
            [Op.overlap]: JSON.parse(query.category),
          },
        };
      }

      const allLibraries = await Library.findAll({
        where: {
          ...libraryWhere,
        },
        raw: true,
      });

      const allConferenceLibraries = await ConferenceLibrary.findAll({
        where: {
          ...libraryWhere,
        },
        raw: true,
      });

      const allPodcasts = await Podcast.findAll({
        where,
        raw: true,
      });

      const allPodcastSeries = await PodcastSeries.findAll({
        where,
        raw: true,
      });

      console.log(where);

      const allSessions = await AnnualConference.findAll({
        where,
        order: [["updatedAt", "DESC"]],
        raw: true,
      });

      let allCompleted = [
        allLibraries,
        allConferenceLibraries,
        allPodcasts,
        allPodcastSeries,
        allSessions,
      ];

      allCompleted = allCompleted.map((items, itemsIndex) => {
        return items.map((item) => {
          let type;

          if (itemsIndex === 0) {
            type = "libraries";
          } else if (itemsIndex === 1) {
            type = "conferences";
          } else if (itemsIndex === 2) {
            type = "podcasts";
          } else if (itemsIndex === 3) {
            type = "podcastSeries";
          } else {
            type = item.type;
          }

          return {
            ...item,
            type,
          };
        });
      });

      allCompleted = flatten(allCompleted);

      allCompleted = allCompleted.sort((a, b) => {
        if (moment(a.updatedAt) > moment(b.updatedAt)) {
          return -1;
        } else if (moment(b.updatedAt) < moment(a.updatedAt)) {
          return 1;
        } else {
          return 0;
        }
      });

      const offset = (+query.page - 1) * +query.num;
      const limit = offset + +query.num;

      allCompleted = {
        count: allCompleted.length,
        rows: allCompleted.slice(offset, limit),
      };

      return res.status(HttpCodes.OK).json({ allCompleted });
    } catch (error) {
      console.error(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal Server error",
        error,
      });
    }
  };

  const getAllItemsWithHrCredit = async (req, res) => {
    const query = req.query;

    try {
      let where = {};
      let where2 = {};

      if (query.category && !isEmpty(JSON.parse(query.category))) {
        where2 = {
          ...where,
          categories: {
            [Op.overlap]: JSON.parse(query.category),
          },
        };
      }

      if (query.meta) {
        where = {
          ...where,
          meta: {
            [Op.iLike]: `%${query.meta}%`,
          },
        };
      }

      const num = query.num / 3;

      const data = [];

      let conferences = ConferenceLibrary.findAndCountAll({
        where: {
          ...where2,
          showClaim: 1,
        },
        offset: (query.page - 1) * num,
        limit: num,
        order: [["createdAt", "DESC"]],
        raw: true,
      });

      let libraries = Library.findAndCountAll({
        where: {
          ...where,
          showClaim: 1,
        },
        offset: (query.page - 1) * num,
        limit: num,
        order: [["createdAt", "DESC"]],
        raw: true,
      });

      let podcastSeries = PodcastSeries.findAndCountAll({
        where2,
        offset: (query.page - 1) * num,
        limit: num,
        order: [["createdAt", "DESC"]],
        raw: true,
      });

      data.push(conferences);
      data.push(libraries);
      data.push(podcastSeries);

      const itemsWithHRCreditsData = await Promise.all(data);

      const count = itemsWithHRCreditsData.reduce((a, b) => {
        return a + b.count;
      }, 0);

      const items = itemsWithHRCreditsData.map((items, index) => {
        return items.rows.map((item) => {
          let type;
          if (index === 0) {
            type = "conferences";
          } else if (index === 1) {
            type = "libraries";
          } else {
            type = "podcastSeries";
          }

          return {
            ...item,
            type,
          };
        });
      });

      let itemsWithHRCredits = {
        count,
        rows: items,
      };

      itemsWithHRCredits.rows = flatten(itemsWithHRCredits.rows);

      itemsWithHRCredits.rows = itemsWithHRCredits.rows.sort((a, b) => {
        if (moment(a.createdAt) < moment(b.createdAt)) {
          return -1;
        } else if (moment(b.createdAt) < moment(a.createdAt)) {
          return 1;
        } else {
          return 0;
        }
      });

      return res.status(HttpCodes.OK).json({ itemsWithHRCredits });
    } catch (error) {
      console.error(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal Server error",
        error,
      });
    }
  };

  const getAllEventVideos = async (req, res) => {
    const user = req.user;

    try {
      const events = await Event.findAll({
        attributes: ["id", "title", "ticket", "startAndEndTimes", "startDate", "endDate", "showPopupMyLearning", "bulCodeEvent"],
        include: {
          model: Library,
          where: {
            EventId: {
              [Op.not]: null,
            },
            contentType: "video",
          },
          required: true,
          order: [["createdAt", "DESC"]],
        },
        order: [["createdAt", "DESC"]],
      });

      return res.status(HttpCodes.OK).json({ events });
    } catch (error) {
      console.error(error);
      return res
        .status(HttpCodes.BAD_REQUEST)
        .json({ msg: "Bad Request: User id is wrong" });
    }
  };

  const getAllLibraries = async (req, res) => {

    try {
      const libraries = await Library.findAll({
        where: {
          EventId: {
            [Op.not]: null,
          },
          contentType: "video",
        },
      });

      return res.status(HttpCodes.OK).json({ libraries });
    } catch (error) {
      console.error(error);
      return res
        .status(HttpCodes.BAD_REQUEST)
        .json({ msg: "Bad Request: User id is wrong" });
    }
  };

  const setAllMyHrCreditse = async (req, res) => {
    // const data = req.body
    // const user = req.user;

    // console.log(data)

    try{

      // if(!user.hrLoad){
      //   await Promise.resolve(
      //     data.map(async (dat) => {
      //       await HrCredits.create({
      //         email: dat.email,
      //         idUser: user.id,
      //         type: 'myLearning',
      //         nameEvent: dat.subject.substring(44,Number(dat.subject.length) - 1),
      //       });
      //     })
      //   );
      // }

      // await User.update(
      //   {
      //     hrLoad: true
      //   },
      //   {
      //     where: { id: user.id },
      //   }
      // );

      return res.status(HttpCodes.OK).json({});
    }catch (error) {
      console.error(error);
      return res
        .status(HttpCodes.BAD_REQUEST)
        .json({ msg: "Bad Request: User id is wrong" });
    } 

  }

  const getAllMyHrCreditse = async (req, res) => {
    const user = req.user;

    try{
      const credits = await HrCredits.findAll({
        where: {
          email: user.email,
          type: "myLearning",
        },
      });

      return res.status(HttpCodes.OK).json({credits});
    }catch (error) {
      console.error(error);
      return res
        .status(HttpCodes.BAD_REQUEST)
        .json({ msg: "Bad Request: User id is wrong" });
    } 
  }

  return {
    getAllSaved,
    getAllCompleted,
    getAllItemsWithHrCredit,
    getAllEventVideos,
    getAllLibraries,
    setAllMyHrCreditse,
    getAllMyHrCreditse
  };
};

module.exports = LearningController;
