const db = require("../models");
const HttpCodes = require("http-codes");
const isEmpty = require("lodash/isEmpty");
const { Op } = require("sequelize");
const { isValidURL } = require("../utils/profile");
const s3Service = require("../services/s3.service");
const smtpService = require("../services/smtp.service");
const cryptoService = require("../services/crypto.service");
const { LabEmails } = require("../enum");

const PodcastSeries = db.PodcastSeries;
const Podcast = db.Podcast;

const PodcastSeriesController = () => {
  const create = async (req, res) => {
    const reqPodcastSeries = req.body;

    try {
      let podcastSeriesInfo = {
        ...reqPodcastSeries,
      };

      if (podcastSeriesInfo.img) {
        podcastSeriesInfo.img = await s3Service().getPodcastImageUrl(
          "",
          podcastSeriesInfo.img
        );
      }

      const podcastSeries = await PodcastSeries.create(podcastSeriesInfo);

      return res.status(HttpCodes.OK).json({ podcastSeries });
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

      const podcastSeries = await PodcastSeries.findAll({
        where,
        order: [["title"]],
      });

      return res.status(HttpCodes.OK).json({ podcastSeries });
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
        let podcastSeries = await PodcastSeries.findOne({
          where: {
            id,
          },
        });

        const podcasts = await Promise.all(
          podcastSeries.podcasts.map((item) => {
            return Podcast.findOne({
              where: {
                id: item,
              },
            });
          })
        );

        podcastSeries.podcasts = podcasts;

        if (!podcastSeries) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Bad Request: Podcast Series not found" });
        }

        return res.status(HttpCodes.OK).json({ podcastSeries });
      } catch (err) {
        console.log(err);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    }

    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: podcastseries id is wrong" });
  };

  const update = async (req, res) => {
    const { id } = req.params;
    const reqPodcastSeries = req.body;

    if (id) {
      try {
        let podcastSeriesInfo = {
          ...reqPodcastSeries,
        };

        const prevPodcastSeries = await PodcastSeries.findOne({
          where: {
            id,
          },
        });

        if (!prevPodcastSeries) {
          return res
            .status(HttpCodes.BAD_REQUEST)
            .json({ msg: "Bad Request: Podcast Series not found." });
        }

        if (reqPodcastSeries.img && !isValidURL(reqPodcastSeries.img)) {
          podcastSeriesInfo.img = await s3Service().getPodcastImageUrl(
            "",
            reqPodcastSeries.img
          );

          if (prevPodcastSeries.img) {
            await s3Service().deleteUserPicture(prevPodcastSeries.img);
          }
        }

        if (prevPodcastSeries.img && !reqPodcastSeries.img) {
          await s3Service().deleteUserPicture(prevPodcastSeries.img);
        }

        const [numberOfAffectedRows, affectedRows] = await PodcastSeries.update(
          podcastSeriesInfo,
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
      .json({ msg: "Bad Request: Podcast Series id is wrong" });
  };

  const remove = async (req, res) => {
    const { id } = req.params;

    if (id) {
      try {
        await PodcastSeries.destroy({
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
      .json({ msg: "Bad Request: Podcast Series id is wrong" });
  };

  const claim = async (req, res) => {
    const { id, pdf } = req.body;
    const { user } = req;

    if (id) {
      try {
        let podcastSeries = await PodcastSeries.findOne({
          where: {
            id,
          },
        });

        podcastSeries = podcastSeries.toJSON();
        podcastSeries = {
          ...podcastSeries,
          shrmCode: cryptoService().decrypt(podcastSeries.shrmCode),
          hrciCode: cryptoService().decrypt(podcastSeries.hrciCode),
        };

        let mailOptions = {
          from: process.env.SEND_IN_BLUE_SMTP_SENDER,
          to: user.email,
          subject: LabEmails.PODCAST_SERIES_CLAIM.subject(podcastSeries.title),
          html: LabEmails.PODCAST_SERIES_CLAIM.body(user, podcastSeries),
          attachments: [
            {
              filename: "certificate.pdf",
              contentType: "application/pdf",
              content: Buffer.from(pdf.substr(pdf.indexOf(",") + 1), "base64"),
            },
          ],
        };

        await smtpService().sendMailUsingSendInBlue(mailOptions);

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
      .json({ msg: "Bad Request: Podcast Series id is wrong" });
  };

  const markAsViewed = async (req, res) => {
    const { id: podcastseriesId, mark } = req.body;
    const { id: userId } = req.token;

    if (podcastseriesId) {
      try {
        let prevSeries = await PodcastSeries.findOne({
          where: { id: podcastseriesId },
        });

        const saveForLater = prevSeries.saveForLater.filter((item) => {
          return item !== userId;
        });
        prevSeries = prevSeries.toJSON();

        const [numberOfAffectedRows, affectedRows] = await PodcastSeries.update(
          {
            viewed: { ...prevSeries.viewed, [userId]: mark },
            saveForLater,
          },
          {
            where: { id: podcastseriesId },
            returning: true,
            plain: true,
          }
        );

        const data = {
          ...affectedRows.dataValues,
          type: "podcastSeries",
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
      let podcastSeries = await PodcastSeries.findOne({
        where: {
          id,
        },
      });

      podcastSeries = podcastSeries.toJSON();

      if (!podcastSeries) {
        return res
          .status(HttpCodes.BAD_REQUEST)
          .json({ msg: "Podcast Series not found." });
      }

      const saveForLater =
        status === "saved"
          ? [...podcastSeries.saveForLater, UserId.toString()]
          : podcastSeries.saveForLater.filter((item) => item !== UserId);

      const [numberOfAffectedRows, affectedRows] = await PodcastSeries.update(
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
        type: "podcastSeries",
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

module.exports = PodcastSeriesController;
