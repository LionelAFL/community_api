const db = require("../models");
const HttpCodes = require("http-codes");
const { Op } = require("sequelize");
const s3Service = require("../services/s3.service");
const { isValidURL } = require("../utils/profile");
const { isEmpty, compact} = require("lodash");
const SortOptions = require("../enum/FilterSettings").SORT_OPTIONS;
const {formatFollowers} = require("../utils/formatFollowers.js")
const { LabEmails, USER_ROLE } = require("../enum");
const Sequelize = require("sequelize");
const path = require("path")
const fs = require("fs")
const smtpService = require("../services/smtp.service");
const NotificationController = require("../controllers/NotificationController");
const {
  convertJSONToExcelFollowersChannels
} = require("../utils/format");
const moment = require("moment");

const Channel = db.Channel;
const User = db.User;
const Library = db.Library;
const Event = db.Event;
const BlogPost = db.BlogPost;
const Podcast = db.Podcast;
const EmailDraftChannel = db.EmailDraftChannel

const ChannelController = () => {
  const create = async (req, res) => {
    const { body } = req;
    const { id: userId } = req.token;

    if (body.name) {
      try {
        let channelInfo = {
          ...body,
          owner: userId,
        };

        // check channel name
        const existed = await Channel.findOne({
          where: {
            name: channelInfo.name,
          },
        });

        if (existed) {
          return res
            .status(HttpCodes.BAD_REQUEST)
            .json({ msg: "Channel name is existed. Please use another one." });
        }

        if (channelInfo.image) {
          channelInfo.image = await s3Service().getChannelImageUrl(
            "",
            channelInfo.image
          );
        }

        const newChannel = await Channel.create(channelInfo);

        await User.update(
          {
            channel: newChannel.id,
          },
          {
            where: { id: userId },
          }
        );
        if (!newChannel) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }

        return res.status(HttpCodes.OK).json({ channel: newChannel });
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error", error: error });
      }
    }

    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: Channel Name is needed." });
  };

  const get = async (req, res) => {
    const { id } = req.params;

    if (id) {
      try {
        const channelConsult = await Channel.findOne({
          where: {
            id,
          },
        });

        const userOwner = await User.findOne({
          where: {
            channel: channelConsult?.dataValues?.id,
            role: 'channel_admin'
          },
        });

        const followers = await User.findAll({
          where: {
            id: channelConsult?.dataValues?.followedUsers,
          },
          attributes: [
            "id",
            "firstName",
            "lastName",
            "titleProfessions",
            "img",
            "abbrName",
            "countEmailsSend",
            "dateRenewInvitationEmail"
          ],
        });

        const podcast = await Podcast.count({
          where: {
            channel: channelConsult?.dataValues?.id
          },
          order: [["order", "DESC"]],
        });

        const blogsPostByChannel = await BlogPost.count({
          where: {
            ChannelId: channelConsult?.dataValues?.id,
          },
          order: [["createdAt", "DESC"]],
        });

        const channelEvents = await Event.count({ where: {channel: channelConsult?.dataValues?.id}, raw: true });
  
        const librariesResources = await Library.count({
          where: {
            channel: channelConsult?.dataValues?.id,
            contentType: 'article',
          },
        });

        const librariesVideos = await Library.count({
          where: {
            channel: channelConsult?.dataValues?.id,
            contentType: 'video',
          },
        });

        const channel = {
          podcast,
          blogsPostByChannel,
          channelEvents,
          librariesResources,
          librariesVideos,
          User: userOwner,
          ...channelConsult?.dataValues
        }

        if (!channel) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Bad Request: Channel not found" });
        }

        return res.status(HttpCodes.OK).json({ channel, followers });
      } catch (err) {
        console.log(err);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    }

    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: Channel id is wrong" });
  };

  const getForName = async (req, res) => {
    const { name } = req.params;

    let nameSelected = JSON.parse(name)

    if (nameSelected.name) {
      try {
        const channelConsult = await Channel.findOne({
          where: {
            name: nameSelected?.name,
          },
        });

        const userOwner = await User.findOne({
          where: {
            channel: channelConsult?.dataValues?.id,
            role: 'channel_admin'
          },
        });

        const followers = await User.findAll({
          where: {
            id: channelConsult?.dataValues?.followedUsers,
          },
          attributes: [
            "id",
            "firstName",
            "lastName",
            "titleProfessions",
            "img",
            "abbrName",
            "countEmailsSend",
            "dateRenewInvitationEmail"
          ],
        });

        const podcast = await Podcast.count({
          where: {
            channel: channelConsult?.dataValues?.id
          },
          order: [["order", "DESC"]],
        });

        const blogsPostByChannel = await BlogPost.count({
          where: {
            ChannelId: channelConsult?.dataValues?.id,
          },
          order: [["createdAt", "DESC"]],
        });

        const channelEvents = await Event.count({ where: {channel: channelConsult?.dataValues?.id}, raw: true });
  
        const librariesResources = await Library.count({
          where: {
            channel: channelConsult?.dataValues?.id,
            contentType: 'article',
          },
        });

        const librariesVideos = await Library.count({
          where: {
            channel: channelConsult?.dataValues?.id,
            contentType: 'video',
          },
        });

        const channel = {
          podcast,
          blogsPostByChannel,
          channelEvents,
          librariesResources,
          librariesVideos,
          User: userOwner,
          ...channelConsult?.dataValues
        }

        if (!channelConsult) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Bad Request: Channel not found" });
        }

        return res.status(HttpCodes.OK).json({ channel, followers });
      } catch (err) {
        console.log(err);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    }

    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: Channel id is wrong" });
  };

  const getAll = async (req, res) => {
    const params = req.query;

    try {
      let where = {};
      let order = [];

      const users = await User.findAll({
        where: {
          channelsSubscription: true,
        },
        attributes: ["id"],
      });

      const userOwner = await User.findAll({
        where: {
          channelsSubscription: true,
          role: 'channel_admin'
        },
      })

      where = {
        ...where,
        owner: { [Op.in]: users.map((u) => u.id) },
      };

      if (params.category && !isEmpty(JSON.parse(params.category))) {
        where = {
          ...where,
          categories: {
            [Op.overlap]: JSON.parse(params.category),
          },
        };
      }

      switch (params.order) {
        case SortOptions["Newest first"]:
          order.push(["createdAt", "DESC"]);
          break;
        case SortOptions["Newest last"]:
          order.push(["createdAt", "ASC"]);
          break;
        case SortOptions["Sort by name"]:
          order.push(["name", "ASC"]);
          break;
        case SortOptions["Sort by type"]:
          order.push(["contentType", "ASC"]);
          break;
        default:
      }

      const channelsFind = await Channel.findAndCountAll({
        where,
        order,
      });

      const followersConsult = await User.findAll({
        where: {
          followChannels: {[Op.ne]: []},
        },
        attributes: [
          "id",
          "firstName",
          "lastName",
          "titleProfessions",
          "img",
          "abbrName"
        ],
      });

      let podcast = await Podcast.findAndCountAll({
        where: {
          channel: {[Op.gte]: 1}
        },
        attributes: ['channel'],
        order: [["order", "DESC"]],
      });

      const blogsPostByChannel = await BlogPost.findAndCountAll({
        where: {
          ChannelId: {[Op.gte]: 1},
        },
        attributes: ['ChannelId'],
        order: [["createdAt", "DESC"]],
      });

      let channelEvents = await Event.findAndCountAll({ where: {channel: {[Op.gte]: 1}}, raw: true, attributes: ['channel'], });

      const librariesResources = await Library.findAndCountAll({
        where: {
          channel: {[Op.gte]: 1},
          contentType: 'article',
        },
        attributes: ['channel'],
      });

      const librariesVideos = await Library.findAndCountAll({
        where: {
          channel: {[Op.gte]: 1},
          contentType: 'video',
        },
        attributes: ['channel'],
      });

      const channelsCount = channelsFind.rows.map((channel) => {

        let podcastCount = podcast.rows.filter((data) => {
          return data.channel === channel?.dataValues?.id
        })

        let blogCount = blogsPostByChannel.rows.filter((data) => {
          return data.ChannelId === channel?.dataValues?.id
        })

        let eventCount = channelEvents.rows.filter((data) => {
          return data.channel === channel?.dataValues?.id
        })

        let resourcesCount = librariesResources.rows.filter((data) => {
          return data.channel === channel?.dataValues?.id
        })

        let videosCount = librariesVideos.rows.filter((data) => {
          return data.channel === channel?.dataValues?.id
        })

        let followers = followersConsult.filter((follower) => {
          return channel?.dataValues?.followedUsers.some((data) => data === follower?.dataValues?.id)
        })

        let users = userOwner.filter((user) => {
          return channel?.owner === user?.dataValues?.id
        })

        return {
          followers,
          User: users,
          podcast: podcastCount.length,
          blogsPostByChannel: blogCount.length,
          channelEvents: eventCount.length,
          librariesResources: resourcesCount.length,
          librariesVideos: videosCount.length,
          ...channel?.dataValues,
        }
      })

      const channels = {
        count: channelsFind.count,
        rows: channelsCount
      }

      return res.status(HttpCodes.OK).json({ channels });
    } catch (err) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const put = async (req, res) => {
    const { id } = req.params;
    const channel = req.body;

    try {
      let channelInfo = {
        ...channel,
      };

      const prevChannel = await Channel.findOne({
        where: {
          id,
        },
      });

      if (!prevChannel) {
        return res
          .status(HttpCodes.BAD_REQUEST)
          .json({ msg: "Bad Request: channel not found." });
      }

      if (channel.image && !isValidURL(channel.image)) {
        channelInfo.image = await s3Service().getChannelImageUrl(
          "",
          channel.image
        );

        if (prevChannel.image) {
          await s3Service().deleteUserPicture(prevChannel.image);
        }
      }

      // if (prevChannel.image && !channel.image && !channel.image2) {
      //   await s3Service().deleteUserPicture(prevChannel.image);
      // }

      if (channel.image2 && !isValidURL(channel.image2)) {
        channelInfo.image2 = await s3Service().getChannelImageUrl(
          "",
          channel.image2
        );

        if (prevChannel.image2) {
          await s3Service().deleteUserPicture(prevChannel.image2);
        }
      }

      // if (prevChannel.image2 && !channel.image2 && !channel.image) {
      //   await s3Service().deleteUserPicture(prevChannel.image2);
      // }

      const [numberOfAffectedRows, affectedRows] = await Channel.update(
        channelInfo,
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
  };

  const remove = async (req, res) => {
    const { id } = req.params;

    if (id) {
      try {
        await Channel.destroy({
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
      .json({ msg: "Bad Request: channel id is wrong" });
  };

  const setFollow = async (req, res) => {
    const user = req.user;
    const { id } = req.params;

    try {
      await Channel.update(
        {
          followedUsers: Sequelize.fn(
            "array_append",
            Sequelize.col("followedUsers"),
            user.id
          ),
        },
        {
          where: { id },
          returning: true,
          plain: true,
        }
      );
      const channelConsult = await Channel.findOne({
        where: {
          id,
        },
      });

      const userOwner = await User.findOne({
        where: {
          channel: channelConsult?.dataValues?.id,
          role: 'channel_admin'
        },
      });
      const [numberOfAffectedRows, affectedRows] = await User.update(
        {
          followChannels: Sequelize.fn(
            "array_append",
            Sequelize.col("followChannels"),
            id
          ),
        },
        {
          where: { id: user.id },
          returning: true,
          plain: true,
        }
      );

      const podcast = await Podcast.count({
        where: {
          channel: channelConsult?.dataValues?.id
        },
        order: [["order", "DESC"]],
      });

      const blogsPostByChannel = await BlogPost.count({
        where: {
          ChannelId: channelConsult?.dataValues?.id,
        },
        order: [["createdAt", "DESC"]],
      });

      const channelEvents = await Event.count({ where: {channel: channelConsult?.dataValues?.id}, raw: true });

      const librariesResources = await Library.count({
        where: {
          channel: channelConsult?.dataValues?.id,
          contentType: 'article',
        },
      });

      const librariesVideos = await Library.count({
        where: {
          channel: channelConsult?.dataValues?.id,
          contentType: 'video',
        },
      });

      const channel = {
        podcast,
        blogsPostByChannel,
        channelEvents,
        librariesResources,
        librariesVideos,
        User: userOwner,
        ...channelConsult?.dataValues
      }

      return res.status(HttpCodes.OK).json({ user: affectedRows, channel });
    } catch (err) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const unsetFollow = async (req, res) => {
    const user = req.user;
    const { id } = req.params;

    try {
      await Channel.update(
        {
          followedUsers: Sequelize.fn(
            "array_remove",
            Sequelize.col("followedUsers"),
            user.id
          ),
        },
        {
          where: { id },
          returning: true,
          plain: true,
        }
      );
      const channelConsult = await Channel.findOne({
        where: {
          id,
        },
      });

      const userOwner = await User.findOne({
        where: {
          channel: channelConsult?.dataValues?.id,
          role: 'channel_admin'
        },
      });

      const [numberOfAffectedRows, affectedRows] = await User.update(
        {
          followChannels: Sequelize.fn(
            "array_remove",
            Sequelize.col("followChannels"),
            id
          ),
        },
        {
          where: { id: user.id },
          returning: true,
          plain: true,
        }
      );

      const podcast = await Podcast.count({
        where: {
          channel: channelConsult?.dataValues?.id
        },
        order: [["order", "DESC"]],
      });

      const blogsPostByChannel = await BlogPost.count({
        where: {
          ChannelId: channelConsult?.dataValues?.id,
        },
        order: [["createdAt", "DESC"]],
      });

      const channelEvents = await Event.count({ where: {channel: channelConsult?.dataValues?.id}, raw: true });

      const librariesResources = await Library.count({
        where: {
          channel: channelConsult?.dataValues?.id,
          contentType: 'article',
        },
      });

      const librariesVideos = await Library.count({
        where: {
          channel: channelConsult?.dataValues?.id,
          contentType: 'video',
        },
      });

      const channel = {
        podcast,
        blogsPostByChannel,
        channelEvents,
        librariesResources,
        librariesVideos,
        User: userOwner,
        ...channelConsult?.dataValues
      }

      return res.status(HttpCodes.OK).json({ user: affectedRows, channel });
    } catch (err) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const emailNotification = async (req, res) => {
    const {channelName,channelAdmin,channelAdminEmail,contentType,name,link} = req.body

    await Promise.resolve(
        (() => {
            let mailOptions = {
                from: process.env.SEND_IN_BLUE_SMTP_SENDER,
                to: "enrique@hackinghr.io",
                subject: LabEmails.NOTIFICATION_NEW_CONTENT_CHANNEL.subject,
                html: LabEmails.NOTIFICATION_NEW_CONTENT_CHANNEL.body(channelName,channelAdmin,channelAdminEmail,contentType,name,link),
            };

            return smtpService().sendMailUsingSendInBlue(mailOptions);
        })()
    ); 
  };

  const exportFollowers = async (req, res) => {
    const {idChannel} = req.params

    try{

      const channel = await Channel.findOne({
          where: {id: idChannel},
      })

      const followers = await User.findAll({
        where: {
          id: channel.dataValues.followedUsers,
        },
        attributes: [
          "firstName",
          "lastName",
          "personalLinks",
          "location",
          "titleProfessions",
          "company",
          "sizeOfOrganization",
          "abbrName",
          "countEmailsSend",
          "dateRenewInvitationEmail"
        ],
      });

      const nombre = moment().format("MM-DD-HH-mm-s")

      await convertJSONToExcelFollowersChannels(
          nombre,
          formatFollowers,
          followers.map((follower) => follower.toJSON())
      );

      await res.status(HttpCodes.OK).download(`${path.join(__dirname, '../utils')}/${nombre}.xlsx`, function(){
          fs.unlinkSync(`${path.join(__dirname, '../utils')}/${nombre}.xlsx`)
      })

    }catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
    }
  };

  const newContentEditor = async (req, res) => {
    const {idUsers, channelId} = req.body;

    try {

      const [numberOfAffectedRows, affectedRows] = await User.update(
        {
          role: USER_ROLE.CHANNEL_CONTENT_EDITOR,
          channel: channelId
        },
        {
          where: { id: idUsers },
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

  const removeContentEditor = async (req, res) => {
    const {id} = req.params;

    try {

      const [numberOfAffectedRows, affectedRows] = await User.update(
        {
          role: USER_ROLE.USER,
          channel: 0
        },
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

  const getContentEditor = async (req, res) => {
    const {id} = req.params;

    try {

    const contentEditors = await User.findAll({
      where: {
        role: USER_ROLE.CHANNEL_CONTENT_EDITOR,
        channel: id
      },
      attributes: [
        "firstName",
        "lastName",
        "personalLinks",
        "location",
        "titleProfessions",
        "company",
        "id",
        "role",
        "img",
        "abbrName"
      ],
    });

      return res
        .status(HttpCodes.OK)
        .json({ contentEditors });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  }

  const emailAttendee = async (req, res) => {
    const {
      name,
      replyToEmail,
      to,
      subject,
      message,
      test,
      testEmail,
      nameChannel,
      idChannel,
      id,
      linkChannel,
      invitePeople,

    } = req.body

    const searchUserEmail = await User.findAll({
      where: {
        id: to,
      },
      attributes: [
        "email",
        "firstName",
        "dateRenewInvitationEmail",
        "countEmailsSend",
        "id"
      ],
    });

    const userEmail = searchUserEmail.map((data) => data.email)

    const userOwner = await User.findOne({
      where: {
        channel: idChannel,
        role: 'channel_admin'
      },
      attributes: [
        "email",
        "firstName",
        "lastName",
      ],
    })

    const channel = await Channel.findOne({
      where: {
        id: idChannel,
      },
      attributes: [
        'lastEmailSent',
        'invitationsSends',
        'dateLimitInvitations',
        'categories'
      ]
    });

    function buscar(dia) {
      const diaRequerido = dia;
      const hoy = moment().isoWeekday();
      
      if (hoy <= diaRequerido) {
        return moment().isoWeekday(diaRequerido);
      } else {
        /*Si no pertenece a la semana actual ir a proxima semana */
        return moment().add(1, 'weeks').isoWeekday(diaRequerido);
      }
    }

    let dateToday = moment().tz("America/Los_Angeles")

    if(test){
      await Promise.resolve(
        (() => {
            let mailOptions = {
                from: `"${name}" ${replyToEmail}`,
                to: testEmail,
                subject: LabEmails.ATTENDEE_CHANNEL.subject(subject),
                html: LabEmails.ATTENDEE_CHANNEL.body(message, nameChannel),
            };

            return smtpService().sendMailUsingSendInBlue(mailOptions);
        })()
      ); 

      return res
        .status(HttpCodes.OK)
        .json();
    }else{

      if(invitePeople){
        let newChangesChannel = {}
        if(channel.dataValues.invitationsSends < 50 || moment(dateToday,'YYYY-MM-DD hh:mm a').isBefore(moment(channel.dataValues.dateLimitInvitations,'YYYY-MM-DD hh:mm a'), 'minute') === false || channel.dataValues.dateLimitInvitations === ''){

          if(channel.dataValues.invitationsSends === 50 || channel.dataValues.invitationsSends === 0){
            newChangesChannel['invitationsSends'] = searchUserEmail.length
          }else{
            newChangesChannel['invitationsSends'] = Number(searchUserEmail.length) + channel.dataValues.invitationsSends
          }
          if(moment(dateToday,'YYYY-MM-DD hh:mm a').isBefore(moment(channel.dataValues.dateLimitInvitations,'YYYY-MM-DD hh:mm a'), 'minute') === false || channel.dataValues.dateLimitInvitations === ''){
            newChangesChannel['dateLimitInvitations'] = moment().tz("America/Los_Angeles").startOf("day").add(7, 'hours').add(1, 'month').format('YYYY-MM-DD hh:mm a')
          }

          await Channel.update(
            newChangesChannel,
            {
              where: {
                id: idChannel,
              },
            }
          );

          await Promise.all(
            searchUserEmail.map(async (data) => {
              let newChanges = {};

              if(data.dataValues.countEmailsSend < 2 || moment(dateToday,'YYYY-MM-DD hh:mm a').isBefore(moment(data.dataValues.dateRenewInvitationEmail,'YYYY-MM-DD hh:mm a'), 'minute') === false || data.dataValues.dateRenewInvitationEmail === ''){
                
                if(data.dataValues.countEmailsSend === 2){
                  newChanges['countEmailsSend'] = 1
                }
                if(data.dataValues.countEmailsSend === 0){
                  newChanges['countEmailsSend'] = 1
                }
                if(data.dataValues.countEmailsSend === 1){
                  newChanges['countEmailsSend'] = 2
                }
                if(moment(dateToday,'YYYY-MM-DD hh:mm a').isBefore(moment(data.dataValues.dateRenewInvitationEmail,'YYYY-MM-DD hh:mm a'), 'minute') === false || data.dataValues.dateRenewInvitationEmail === ''){
                  newChanges['dateRenewInvitationEmail'] = moment().tz("America/Los_Angeles").startOf("day").add(7, 'hours').add(1, 'month').format('YYYY-MM-DD hh:mm a')
                }
                const [numberOfAffectedRows, affectedRows] = await User.update(
                  newChanges,
                  {
                    where: { id: data.dataValues.id },
                  }
                );

                let newCategoriesData = ''

                channel.dataValues.categories.forEach((data,index) => {
                  newCategoriesData = `${newCategoriesData} ${(index !== channel.dataValues.categories.length - 1) ? data + ' |' : data}`
                })

                await NotificationController().createNotification({
                  message: `You have been invited to follow "${nameChannel}".`,
                  type: "channelInvit",
                  meta: {
                    linkChannel
                  },
                  onlyFor: [data.dataValues.id],
                });
                await Promise.resolve(
                  (() => {
                      let mailOptions = {
                          from: replyToEmail,
                          to: data.dataValues.email,
                          subject: LabEmails.SEND_EMAIL_INVITE.subject(
                            userOwner.dataValues.firstName, 
                            userOwner.dataValues.lastName, 
                            nameChannel
                          ),
                          html: LabEmails.SEND_EMAIL_INVITE.body(
                            data.dataValues.firstName, 
                            userOwner.dataValues.firstName, 
                            userOwner.dataValues.lastName, 
                            nameChannel, 
                            linkChannel,
                            newCategoriesData
                          ),
                      };
          
                      return smtpService().sendMailUsingSendInBlue(mailOptions);
                  })()
                ); 
              }
            })
          )

          return res
            .status(HttpCodes.OK)
            .json(newChangesChannel['invitationsSends']);
        }else{
          return res
            .status(HttpCodes.BAD_REQUEST)
            .json({message: "Sorry, you don't have more invitations for this month"});
        }

        
      }else{
        if(channel.dataValues.lastEmailSent === ''){
    
          const [numberOfAffectedRows, affectedRows] = await Channel.update(
            {lastEmailSent: buscar(1).tz("America/Los_Angeles").startOf("day").add(7, 'hours').format('YYYY-MM-DD hh:mm a')},
            {
              where: { id: idChannel },
            }
          );

          if(id === -1){

            await EmailDraftChannel.create({
              idChannel,
              name,
              to,
              subject,
              message,
              send: true,
              type: 'channel',
              date: moment
              .utc(moment().format("YYYY-MM-DD HH:mm"))
              .format()
            })

          }else{

            const [numberOfAffectedRows, affectedRows] = await EmailDraftChannel.update({ 
              name,
              to, 
              subject,
              message,
              draft: false,
              send: true,
              type: 'channel',
              date: moment
              .utc(moment().format("YYYY-MM-DD HH:mm"))
              .format()
            },{where: {id: id}})

          }

          await Promise.all(
            userEmail.map(async (data) => {
              await Promise.resolve(
                (() => {
                    let mailOptions = {
                        from: `"${name}" ${replyToEmail}`,
                        to: data,
                        subject: LabEmails.ATTENDEE_CHANNEL.subject(subject),
                        html: LabEmails.ATTENDEE_CHANNEL.body(message, nameChannel),
                    };
        
                    return smtpService().sendMailUsingSendInBlue(mailOptions);
                })()
            ); 
            })
          )
          return res
            .status(HttpCodes.OK)
            .json();
        }else{

          if(moment(dateToday,'YYYY-MM-DD hh:mm a').isBefore(moment(channel.dataValues.lastEmailSent,'YYYY-MM-DD hh:mm a'), 'minute') === true){
            
            return res
            .status(HttpCodes.BAD_REQUEST)
            .json({message: "Sorry, you don't have more emails for this week"});
            
          }else{

            let dateOtherMonday = buscar(1).tz("America/Los_Angeles").startOf("day").add(7, 'hours')

            if(moment(dateToday,'YYYY-MM-DD hh:mm a').isBefore(moment(dateOtherMonday,'YYYY-MM-DD hh:mm a'), 'day') === false){
              dateOtherMonday.add(1, 'weeks')
            }

            const [numberOfAffectedRows, affectedRows] = await Channel.update(
              {lastEmailSent: dateOtherMonday.format('YYYY-MM-DD hh:mm a')},
              {
                where: { id: idChannel },
              }
            );

            if(id === -1){

              await EmailDraftChannel.create({
                idChannel,
                name,
                to,
                subject,
                message,
                send: true,
                type: 'channel',
                date: moment
                .utc(moment().format("YYYY-MM-DD HH:mm"))
                .format()
              })
          
            }else{

              const [numberOfAffectedRows, affectedRows] = await EmailDraftChannel.update({ 
                name,
                to, 
                subject,
                message,
                draft: false,
                send: true,
                type: 'channel',
                date: moment
                .utc(moment().format("YYYY-MM-DD HH:mm"))
                .format()
              },{where: {id: id}})

            }
    
            await Promise.all(
              userEmail.map(async (data) => {
                await Promise.resolve(
                  (() => {
                      let mailOptions = {
                          from: `"${name}" ${replyToEmail}`,
                          to: data,
                          subject: LabEmails.ATTENDEE_CHANNEL.subject(subject),
                          html: LabEmails.ATTENDEE_CHANNEL.body(message, nameChannel),
                      };
          
                      return smtpService().sendMailUsingSendInBlue(mailOptions);
                  })()
              ); 
              })
            )
            return res
              .status(HttpCodes.OK)
              .json();
          }
        }
      }
  
    }
      

  };

  const copyEmailAttendee = async (req, res) => {
    const { draftEmail } = req.body;

    const { name, to, subject, message, idChannel } = draftEmail

    try {

      const draftEmailResponse = await EmailDraftChannel.create({
        idChannel,
        name,
        to,
        subject,
        message,
        draft: true,
        type: 'channel'
      })

      return res.status(HttpCodes.OK).json({draftEmailResponse})

    } catch (error) {
        console.log(error);
        return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
    }
  }

  const addDraftEmail = async (req, res) => {

      const { draftEmail } = req.body;

      const { idChannel, name, to, subject, message, id } = draftEmail

      try {

        let draftEmailResponse = undefined

        if(id === -1){

          draftEmailResponse = await EmailDraftChannel.create({
            idChannel,
            name,
            to,
            subject,
            message,
            draft: true,
            type: 'channel'
          })

        }else{

          const [numberOfAffectedRows, affectedRows] = await EmailDraftChannel.update({ 
            idChannel,
            name,
            to, 
            subject,
            message,
            draft: true,
            type: 'channel'
          },{where: {id: id}})

        }

          return res.status(HttpCodes.OK).json({draftEmailResponse})

      } catch (error) {
          console.log(error);
          return res
              .status(HttpCodes.INTERNAL_SERVER_ERROR)
              .json({ msg: "Internal server error" });
      }

  }

  const getAllDraftEmail = async (req, res) => {

    const { id } = req.params;

      try {

          const draftEmailResponse = await EmailDraftChannel.findAll({
              order: [["id", "DESC"]],
              where: {idChannel: id, draft: true, type: 'channel'}
          })

          return res.status(HttpCodes.OK).json({ draftEmailResponse });

      } catch (error) {
          console.log(error);
          return res
              .status(HttpCodes.INTERNAL_SERVER_ERROR)
              .json({ msg: "Internal server error" });
      }
  }

  const getAllSendEmail = async (req, res) => {

    const { id } = req.params;

      try {

          const draftEmailResponse = await EmailDraftChannel.findAll({
              order: [["id", "DESC"]],
              where: {idChannel: id, send: true, type: 'channel'}
          })

          return res.status(HttpCodes.OK).json({ draftEmailResponse });

      } catch (error) {
          console.log(error);
          return res
              .status(HttpCodes.INTERNAL_SERVER_ERROR)
              .json({ msg: "Internal server error" });
      }
  }

  const editDraftEmail = async (req, res) => {
      const { draftEmail } = req.body;

      const { name, to, subject, message, id } = draftEmail
      try {

          const [numberOfAffectedRows, affectedRows] = await EmailDraftChannel.update({ 
              name,
              to, 
              subject,
              message,
              type: 'channel'
          },{where: {id: id}})

          return res.status(HttpCodes.OK).json({ numberOfAffectedRows, affectedRows })

      } catch (error) {
          console.log(error);
          return res
              .status(HttpCodes.INTERNAL_SERVER_ERROR)
              .json({ msg: "Internal server error" });
      }
  }

  const deleteDraftEmail = async (req, res) => {
      const { draftEmailId } = req.params;

      try {

          await EmailDraftChannel.destroy({where: {id: draftEmailId}})

          return res.status(HttpCodes.OK).json({})

      } catch (error) {
          console.log(error);
          return res
              .status(HttpCodes.INTERNAL_SERVER_ERROR)
              .json({ msg: "Internal server error" });
      }
  }

  return {
    create,
    get,
    getForName,
    getAll,
    put,
    remove,
    setFollow,
    unsetFollow,
    emailNotification,
    emailAttendee,
    exportFollowers,
    newContentEditor,
    removeContentEditor,
    getContentEditor,
    addDraftEmail, 
    getAllDraftEmail, 
    editDraftEmail, 
    deleteDraftEmail, 
    copyEmailAttendee,
    getAllSendEmail
  };
};

module.exports = ChannelController;
