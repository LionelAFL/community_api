const db = require("../models");
const { Op } = require("sequelize");
const moment = require("moment-timezone");
const sendInBlueService = require("../services/sendinblue.service");
const { JOB_BOARD } = require("../enum");

const Podcast = db.Podcast;
const Library = db.Library;
const JobPost = db.JobPost;
const User = db.User;
const Channel = db.Channel;

const WeeklyDigestController = () => {
  const getThisWeeksPodcastsByCreators = async (
    dateToday,
    dateSevenDaysFromDateToday
  ) => {
    try {
      let podcasts = await Podcast.findAll({
        attributes: ["id", "title", "channel"],
        where: {
          channel: {
            [Op.ne]: null,
          },
          [Op.and]: [
            {
              dateEpisode: {
                [Op.lte]: dateToday,
              },
            },
            {
              dateEpisode: {
                [Op.gte]: dateSevenDaysFromDateToday,
              },
            },
          ],
        },
        raw: true,
      });

      let channels = podcasts.map((podcast) => {
        return Channel.findOne({
          attributes: ["id", "name"],
          where: {
            id: podcast.channel,
          },
          raw: true,
        });
      });

      channels = await Promise.all(channels);

      podcasts = podcasts.map((podcast, index) => {
        return {
          ...podcast,
          channel: channels[index].name,
          channelId: channels[index].id,
        };
      });

      return podcasts;
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  const getThisWeeksContentFromCreators = async (
    dateToday,
    dateSevenDaysFromDateToday
  ) => {
    try {
      let contents = await Library.findAll({
        attributes: ["title", "link", "channel"],
        where: {
          channel: {
            [Op.ne]: null,
          },
          [Op.and]: [
            {
              createdAt: {
                [Op.lte]: dateToday,
              },
            },
            {
              createdAt: {
                [Op.gte]: dateSevenDaysFromDateToday,
              },
            },
          ],
        },
        raw: true,
      });

      let channels = contents.map((content) => {
        return Channel.findOne({
          attributes: ["id", "name"],
          where: {
            id: content.channel,
          },
          raw: true,
        });
      });

      channels = await Promise.all(channels);

      contents = contents.map((content, index) => {
        return {
          ...content,
          channel: channels[index].name,
          channelId: channels[index].id,
        };
      });

      return contents;
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  const getActiveJobPosts = async () => {
    try {
      const jobPosts = await JobPost.findAll({
        where: {
          status: "active",
        },
        raw: true,
      });

      return jobPosts;
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  const updateWeeklyDigestEmail = async () => {
    const dateToday = moment()
      .tz("America/Los_Angeles")
      .startOf("day")
      .utc()
      .format("YYYY-MM-DD");

    const dateSevenDaysFromDateToday = moment()
      .tz("America/Los_Angeles")
      .startOf("day")
      .utc()
      .subtract(6, "day")
      .format("YYYY-MM-DD");

    try {
      const podcasts = await getThisWeeksPodcastsByCreators(
        dateToday,
        dateSevenDaysFromDateToday
      );
      const contents = await getThisWeeksContentFromCreators(
        dateToday,
        dateSevenDaysFromDateToday
      );
      const jobPosts = await getActiveJobPosts();

      const podcastsEmailContent = podcasts.map((podcast) => {
        const link = `${process.env.DOMAIN_URL}library-item/podcast/${podcast.id}?channel=${podcast.channelId}`;

        return `
          <p>${podcast.channel}: "${podcast.title}", <a href="${link}" target="_blank" rel="noopener noreferrer">${link}</a></p>
        `;
      });

      const contentsEmailContent = contents.map((content) => {
        return `
          <p>${content.channel}: "${content.title}", <a href="${content.link}" target="_blank" rel="noopener noreferrer">${content.link}</a></p>
        `;
      });

      const resources = [...podcastsEmailContent, ...contentsEmailContent];

      const jobs = jobPosts.map((jobPost) => {
        const formattedLocation = jobPost.location
          .map((location) => {
            const data = JOB_BOARD.LOCATIONS.find(
              (loc) => loc.value === location
            );

            return data.text;
          })
          .join("/");

        const link = `${process.env.DOMAIN_URL}talent-marketplace/job-post/${jobPost.id}`;

        return `
          <p>${jobPost.jobTitle}, ${jobPost.salaryRange}, ${formattedLocation}, ${jobPost.level}, <a href="${link}" target="_blank" rel="noopener noreferrer">${link}</a></p>
        `;
      });

      await sendInBlueService().updateWeeklyDigestEmailTemplate(
        jobs,
        resources
      );
    } catch (error) {
      console.log(error);
    }
  };

  return {
    updateWeeklyDigestEmail,
  };
};

module.exports = WeeklyDigestController;
