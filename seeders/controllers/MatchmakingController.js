const db = require("../models");
const { Op } = require("sequelize");
const { isEmpty } = require("lodash");
const HttpCodes = require("http-codes");
const { LabEmails } = require("../enum");
const smtpService = require("../services/smtp.service");
const moment = require("moment-timezone");

const User = db.User;

const MatchmakingController = () => {
  const getMatchmake = async (req, res) => {
    const filters = req.query;
    const { id } = req.token;

    let where = {
      percentOfCompletion: 100,
      matchedCount: {
        [Op.lt]: 5,
      },
      id: {
        [Op.ne]: id,
      },
    };

    console.log(filters, "filters");

    try {
      if (!isEmpty(filters)) {
        if (!isEmpty(JSON.parse(filters.countries))) {
          where = {
            ...where,
            location: {
              [Op.in]: JSON.parse(filters.countries),
            },
          };
        }

        if (!isEmpty(JSON.parse(filters.topicsOfInterest))) {
          where = {
            ...where,
            topicsOfInterest: {
              [Op.overlap]: JSON.parse(filters.topicsOfInterest),
            },
          };
        }

        if (!isEmpty(JSON.parse(filters.recentJobLevel))) {
          where = {
            ...where,
            recentJobLevel: {
              [Op.in]: JSON.parse(filters.recentJobLevel),
            },
          };
        }

        if (!isEmpty(JSON.parse(filters.recentWorkArea))) {
          where = {
            ...where,
            recentWorkArea: {
              [Op.overlap]: JSON.parse(filters.recentWorkArea),
            },
          };
        }

        if (!isEmpty(JSON.parse(filters.sizeOfOrganization))) {
          where = {
            ...where,
            sizeOfOrganization: {
              [Op.in]: JSON.parse(filters.sizeOfOrganization),
            },
          };
        }
      }

      const matchmakingUsers = await User.findAll({
        attributes: [
          "id",
          "titleProfessions",
          "sizeOfOrganization",
          "location",
        ],
        where,
      });

      return res.status(HttpCodes.OK).json({ matchmakingUsers });
    } catch (error) {
      console.log(error);

      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal server error",
        error,
      });
    }
  };

  const sendMatchEmail = async (req, res) => {
    const { id, message } = req.body;
    const { id: advertiserId } = req.token;

    try {
      const user = await User.findOne({
        attributes: [
          "firstName",
          "lastName",
          "email",
          "titleProfessions",
          "company",
          "personalLinks",
        ],
        where: {
          id,
        },
      });

      const advertiser = await User.findOne({
        attributes: ["firstName", "lastName", "email"],
        where: {
          id: advertiserId,
        },
      });

      if (!user) {
        return res.status(HttpCodes.NOT_FOUND).json({
          msg: "User not found.",
          error,
        });
      }

      const mailOptions = {
        from: process.env.SEND_IN_BLUE_SMTP_SENDER,
        to: "enrique@hackinghr.io",
        subject: LabEmails.MATCHMAKE_USERS.subject(),
        html: LabEmails.MATCHMAKE_USERS.body(user, advertiser, message),
        contentType: "text/html",
      };

      await smtpService().sendMailUsingSendInBlue(mailOptions);

      // await User.increment(
      //   {
      //     matchedCount: +1,
      //   },
      //   {
      //     where: {
      //       id,
      //     },
      //   }
      // );

      return res.status(HttpCodes.OK).json({});
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal server error",
        error,
      });
    }
  };

  const resetMatchedCount = async () => {
    try {
      await User.update(
        { matchedCount: 0 },
        {
          where: {
            percentOfCompletion: 100,
          },
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  return {
    getMatchmake,
    sendMatchEmail,
    resetMatchedCount,
  };
};

module.exports = MatchmakingController;
