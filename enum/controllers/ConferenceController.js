const db = require("../models");
const HttpCodes = require("http-codes");
const isEmpty = require("lodash/isEmpty");
const { Op } = require("sequelize");
const smtpService = require("../services/smtp.service");
const cryptoService = require("../services/crypto.service");
const { LabEmails } = require("../enum");

const ConferenceLibrary = db.ConferenceLibrary;
const HrCredits = db.HrCredits;

const ConferenceController = () => {
  const create = async (req, res) => {
    const { body } = req;

    if (body.title) {
      try {
        let conferenceInfo = {
          ...body,
        };

        const newConference = await ConferenceLibrary.create(conferenceInfo);

        if (!newConference) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }

        return res.status(HttpCodes.OK).json({ conference: newConference });
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error", error: error });
      }
    }

    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: Title is needed." });
  };

  const getAll = async (req, res) => {
    const query = req.query;

    try {
      let where = {};

      // if (query.topics && !isEmpty(JSON.parse(query.topics))) {
      //   where = {
      //     ...where,
      //     categories: {
      //       [Op.overlap]: JSON.parse(query.topics),
      //     },
      //   };
      // }

      if (query.year && !isEmpty(JSON.parse(query.year))) {
        where = {
          ...where,
          year: {
            [Op.in]: JSON.parse(query.year),
          },
        };
      }

      if (query.meta) {
        where = {
          ...where,
          [Op.or]: {
            meta: {
              [Op.iLike]: `%${query.meta}%`,
            },
            title: {
              [Op.iLike]: `%${query.meta}%`,
            },
            shrmCode: {
              [Op.iLike]: `%${query.meta}%`,
            },
            hrciCode: {
              [Op.iLike]: `%${query.meta}%`,
            }
          }
        };
      }

      const listOfYears = JSON.parse(query.listOfYears);
      let conferences = listOfYears.map((year, index) => {
        return ConferenceLibrary.findAndCountAll({
          where: {
            ...where,
            year,
          },
          offset: (query.page - 1) * query.num,
          limit: query.num,
          order: [
            ["year", "DESC"],
            ["order", "DESC"],
          ],
        });
      });

      conferences = await Promise.all(conferences);

      return res.status(HttpCodes.OK).json({ conferences });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const get = async (req, res) => {
    const { id } = req.params;

    try {
      const conference = await ConferenceLibrary.findOne({
        where: {
          id,
        },
      });

      if (!conference) {
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Bad Request: Conferernce not found" });
      }

      return res.status(HttpCodes.OK).json({ conference });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const update = async (req, res) => {
    const { id } = req.params;
    const conference = req.body;

    try {
      let conferenceInfo = {
        ...conference,
      };

      const prevConference = await ConferenceLibrary.findOne({
        where: {
          id,
        },
      });

      if (!prevConference) {
        return res
          .status(HttpCodes.BAD_REQUEST)
          .json({ msg: "Bad Request: Conference not found." });
      }

      const [numberOfAffectedRows, affectedRows] =
        await ConferenceLibrary.update(conferenceInfo, {
          where: { id },
          returning: true,
          plain: true,
        });

      return res
        .status(HttpCodes.OK)
        .json({ numberOfAffectedRows, affectedRows });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const remove = async (req, res) => {
    const { id } = req.params;

    if (id) {
      try {
        await ConferenceLibrary.destroy({
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
      .json({ msg: "Bad Request: category id is wrong" });
  };

  const claim = async (req, res) => {
    const { id } = req.body;
    const { user } = req;

    if (id) {
      try {
        let library = await ConferenceLibrary.findOne({
          where: {
            id,
          },
        });

        library = library.toJSON();

        library = {
          ...library,
          shrmCode: cryptoService().decrypt(library.shrmCode),
          hrciCode: cryptoService().decrypt(library.hrciCode),
        };

        // await HrCredits.create({
        //   email: user.email,
        //   idUser: user.id,
        //   type: 'myLearning',
        //   nameEvent: library.title,
        // });

        if (library.showClaim === 1) {
          let mailOptions = {
            from: process.env.SEND_IN_BLUE_SMTP_SENDER,
            to: user.email,
            subject: LabEmails.LIBRARY_CLAIM.subject(library.title),
            html: LabEmails.LIBRARY_CLAIM.body(user, library),
          };

          await smtpService().sendMailUsingSendInBlue(mailOptions);

          return res.status(HttpCodes.OK).json({});
        }

        return res.status(HttpCodes.BAD_REQUEST).json({
          msg: "Bad Request: This conference library is not allowed to confirm",
        });
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    }
    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: Conference library id is wrong" });
  };

  const markAsViewed = async (req, res) => {
    const { id: libraryId, mark } = req.body;
    const { id: userId } = req.token;

    if (libraryId) {
      try {
        let prevLibrary = await ConferenceLibrary.findOne({
          where: { id: libraryId },
        });
        const saveForLater = prevLibrary.saveForLater.filter((item) => {
          return item !== userId;
        });
        prevLibrary = prevLibrary.toJSON();

        const [numberOfAffectedRows, affectedRows] =
          await ConferenceLibrary.update(
            {
              viewed: { ...prevLibrary.viewed, [userId]: mark },
              saveForLater,
            },
            {
              where: { id: libraryId },
              returning: true,
              plain: true,
            }
          );

        const data = {
          ...affectedRows.dataValues,
          type: "conferences",
        };

        return res
          .status(HttpCodes.OK)
          .json({ numberOfAffectedRows, affectedRows: data });
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    }
    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: Conference library id is wrong" });
  };

  const saveForLater = async (req, res) => {
    const { id } = req.params;
    const { UserId, status } = req.body;

    try {
      let conference = await ConferenceLibrary.findOne({
        where: {
          id,
        },
      });

      conference = conference.toJSON();

      if (!conference) {
        return res
          .status(HttpCodes.BAD_REQUEST)
          .json({ msg: "Conference Library not found." });
      }

      const saveForLater =
        status === "saved"
          ? [...conference.saveForLater, UserId.toString()]
          : conference.saveForLater.filter((item) => item !== UserId);

      const [numberOfAffectedRows, affectedRows] =
        await ConferenceLibrary.update(
          {
            saveForLater,
          },
          {
            where: {
              id,
            },
            returning: true,
            plain: true,
          }
        );

      const data = {
        ...affectedRows.dataValues,
        type: "conferences",
      };

      return res
        .status(HttpCodes.OK)
        .json({ numberOfAffectedRows, affectedRows: data });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  return {
    create,
    getAll,
    get,
    update,
    remove,
    claim,
    markAsViewed,
    saveForLater,
  };
};

module.exports = ConferenceController;
