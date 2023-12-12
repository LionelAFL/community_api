const db = require("../models");
const HttpCodes = require("http-codes");
const s3Service = require("../services/s3.service");
const fs = require('fs')
const path = require('path')
const { Op } = require("sequelize");
const { literal } = require("sequelize");
const smtpService = require("../services/smtp.service");
const moment = require("moment-timezone");
const {formatExcelUsers} = require("../utils/formatExportUsersExcel.js")
const { isValidURL } = require("../utils/profile");
const {formatExcelChallenge} = require("../utils/formatExportChallengeExcel")
const { LabEmails } = require("../enum");
const TimeZoneList = require("../enum/TimeZoneList");
const Bot = require('../services/slackbot.service')
const NotificationController = require("../controllers/NotificationController");
const {
    convertJSONToExcelChallenge
  } = require("../utils/format");

const User = db.User;
const Challengue = db.Challengue;
const ChallengueActivities = db.ChallengueActivities;
const ChallengueUsers = db.ChallengueUsers;
const ChallengeStatusActivities = db.ChallengeStatusActivities;
const ChallengeMessages = db.ChallengeMessages;

const ChallengeController = () => {
  const add = async (req,res) => {

    const {body} = req

    try {
    
        let challengeInfo = {...body}

      if (challengeInfo.image) {
        challengeInfo.image = await s3Service().getEventImageUrl(
          "",
          body.image
        );
      }

      if (challengeInfo.image2) {
        challengeInfo.image2 = await s3Service().getEventImageUrl(
          "",
          body.image2
        );
      }

      const challenge = await Challengue.create({...challengeInfo});

      const Activities = await body?.Activities?.map(async (activity) => {
        return await ChallengueActivities.create({...activity, idChallenge: challenge.dataValues.id});
      });

      return res.status(HttpCodes.OK).send({...challenge,Activities});
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  }

  const remove = async (req,res) => {
    const { id } = req.params;

    if (id) {
      try {

        await Challengue.destroy({
            where: {
                id,
            },
        });

        const activitiesDelete = await ChallengueActivities.findAll({where:{idChallenge: id}});

        await activitiesDelete.forEach((l) => {
          l.destroy()
        })

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
      .json({ msg: "Bad Request: id is wrong" });
  }

  const edit = async (req,res) => {
    const { body } = req;
    const { id } = body
    try {
        let challengueInfo = {...body}

        let prevChallengue = await Challengue.findOne({
            where: {
              id,
            },
        });

        prevChallengue = prevChallengue.toJSON();

        if (body.image && !isValidURL(body.image)) {
            challengueInfo.image = await s3Service().getEventImageUrl("", body.image);
    
            if (prevChallengue.image) {
              await s3Service().deleteUserPicture(prevChallengue.image);
            }
          }
          if (prevChallengue.image && !body.image) {
            await s3Service().deleteUserPicture(prevChallengue.image);
          }
    
          if (body.image2 && !isValidURL(body.image2)) {
            challengueInfo.image2 = await s3Service().getEventImageUrl("", body.image2);
    
            if (prevChallengue.image2) {
              await s3Service().deleteUserPicture(prevChallengue.image2);
            }
          }
          if (prevChallengue.image2 && !body.image2) {
            await s3Service().deleteUserPicture(prevChallengue.image2);
          }

          const [numberOfAffectedRows, affectedRows] = await Challengue.update(
            challengueInfo,
            {
              where: { id },
              returning: true,
              plain: true,
            }
          );

          const activitiesDelete = await ChallengueActivities.findAll({where:{idChallenge: id}});

          await activitiesDelete.forEach((l) => {
            l.destroy()
          })

          await body?.Activities?.map(async (activity) => {
            return await ChallengueActivities.create({...activity, idChallenge: id});
          });

        return res.status(HttpCodes.OK).send();
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
  }

  const get = async (req,res) => {

    let idD = -1
    if(req.user !== undefined){
      const { id } = req.user;  
      idD = id
    }

    try {

        const challenge = await Challengue.findAll();
        const challengeuser = await ChallengueUsers.findAll({where:{idUser: idD}});
        const activities = await ChallengueActivities.findAll();

        return res.status(HttpCodes.OK).json({
            challenge: challenge.map((data) => {
                return {
                    ...data.dataValues,
                    join: (challengeuser.some((e) => e.idChallengue === data.id)) ? true : false,
                    Activities: activities.filter((a) => a.idChallenge === data.id)
                }
            }) 
        });

    } catch (error) {
      console.log(error);
      return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
    }
  }

  const getOne = async (req,res) => {
    const { id } = req.params

    try {

        const challenge = await Challengue.findOne({where: {id}});

        if(challenge){
            const challengeuser = await ChallengueUsers.findAll({where:{idChallengue: challenge.dataValues.id}}); 

            const activities = await ChallengueActivities.findAll({where:{idChallenge: challenge.dataValues.id}});
            
            const idChallengeUser = challengeuser.map((data) => {
                return data.idUser
            })

            const users = await User.findAll({
                where:{
                    id: idChallengeUser
                },
                attributes: [
                    "id",
                    "firstName",
                    "lastName",
                    "titleProfessions",
                    "img",
                    "abbrName",
                    "personalLinks"
                ],
            })

            return res.status(HttpCodes.OK).json({
                ...challenge.dataValues,
                challengeuser: users,
                Activities: activities,
                join: (challengeuser.some((e) => Number(e.idChallengue) === Number(id) && Number(e.idUser) === Number(req.user.id))) ? true : false
            });
        }else{
            return res.status(HttpCodes.OK).json({})
        }
  
      } catch (error) {
        console.log(error);
        return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
      }
  }

  const download = async (req,res) => {
    try {

        let challenge = await Challengue.findAll();
        const challengeuser = await ChallengueUsers.findAll();

        challenge.map(async (data,index) => {
          const idChallengeUser = challengeuser.filter(e => e.idChallengue === data.id).map((a) => {
            return a.dataValues.idUser
          })

          const users = await User.findAll({
              where:{
                  id: idChallengeUser
              },
              attributes: [
                  "id",
                  "firstName",
                  "lastName",
                  "titleProfessions",
                  "img",
                  "abbrName",
                  "personalLinks",
                  "email",
                  "about",
                  "company",
                  "timezone",
                  "role",
                  "location",
                  "city"
              ],
          })

          challenge[index].dataValues = {
            ...challenge[index].dataValues, 
            Users: users,
          }

          if(index === challenge.length-1){
            const nombre = moment().format("MM-DD-HH-mm-s")

            await convertJSONToExcelChallenge(
                nombre,
                formatExcelChallenge,
                formatExcelUsers,
                challenge.map((panels) => {
                  return panels.toJSON()
                })
            );

            await res.status(HttpCodes.OK).download(`${path.join(__dirname, '../utils')}/${nombre}.xlsx`, function(){
                fs.unlinkSync(`${path.join(__dirname, '../utils')}/${nombre}.xlsx`)
            })
          }
        })
  
      
    } catch (error) {
      console.log(error);
      return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
    }
  }

  const joinOrLeave = async (req,res) => {
    const {challenge} = req.body;
    const { id,email,firstName } = req.user;
    let containerActivities = ''

    try {

        const challengeD = await Challengue.findOne({where:{
            id: Number(challenge)
        }});

        const challengeUsers = await ChallengueUsers.findOne({where:{
            idUser: Number(id),
            idChallengue: challenge
        }});

        const activities = await ChallengueActivities.findAll({where:{idChallenge: challengeD.dataValues.id}});


        const containerDates = {
          startDate: moment(challengeD.startDate,'YYYY-MM-DDTHH:mm:ssZ').format("MM/DD/YYYY"),
          endDate: moment(challengeD.endDate,'YYYY-MM-DDTHH:mm:ssZ').format("MM/DD/YYYY")
        }

        activities.forEach((data) => {
          containerActivities = containerActivities + `<p>${data.title} (${moment(data.date).format("MM/DD/YYYY")})</p>`
        })

        let dayAfterTheEndDate = moment(challengeD.endDate).add(24,'hours').format("MM/DD/YYYY")

        if(!challengeUsers){

            await ChallengueUsers.create({
                idUser: Number(id),
                idChallengue: challenge
            });

            await Promise.resolve(
                (() => {
                    let mailOptions = {
                    from: process.env.SEND_IN_BLUE_SMTP_SENDER,
                    to: email,
                    subject: LabEmails.THANKS_CHALLENGUE.subject(challengeD,firstName),
                    html: LabEmails.THANKS_CHALLENGUE.body(challengeD,firstName,containerDates,containerActivities,dayAfterTheEndDate),
                };
        
                return smtpService().sendMailUsingSendInBlue(mailOptions);
    
                })()
            );
        }else{
            challengeUsers.destroy()
        }

        return res.status(HttpCodes.OK).send({});
        
      } catch (error) {
        console.log(error);
        return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
      }
  }

  const sendD = async (req,res) => {
    const { emails,id } = req.body;
    const {firstName,lastName} = req.user

    try {

        const challenge = await Challengue.findOne({where:{
            id: Number(id)
        }});

        await Promise.resolve(
            (() => {
                let mailOptions = {
                from: process.env.SEND_IN_BLUE_SMTP_SENDER,
                to: emails,
                subject: LabEmails.INVITE_CHALLENGUE.subject(challenge,firstName,lastName),
                html: LabEmails.INVITE_CHALLENGUE.body(challenge,firstName,lastName),
            };
    
            return smtpService().sendMailUsingSendInBlue(mailOptions);

            })()
        );

        return res.status(HttpCodes.OK).send({});
        
      } catch (error) {
        console.log(error);
        return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
      }
  }

  const verificateTime = (date) => {

    const startDate = moment.utc(date)?.startOf("hour")?.format('YYYYMMDDHHmm')

    let dateNow = moment.utc().startOf("hour").format('YYYYMMDDHHmm')

    return Number(dateNow) === Number(startDate)
    
  }

  const verificateTime24hours = (date) => {

    const startDate = moment.utc(date)?.startOf("hour")?.format('YYYYMMDDHHmm')

    let dateNow = moment.utc().startOf("hour").add(24,'hours').format('YYYYMMDDHHmm')

    return Number(dateNow) === Number(startDate)

  }

  const verificateTime24hoursSubtract = (date) => {

    const startDate = moment.utc(date)?.startOf("hour")?.format('YYYYMMDDHHmm')

    let dateNow = moment.utc().startOf("hour").subtract(24,'hours').format('YYYYMMDDHHmm')

    return Number(dateNow) === Number(startDate)

  }

  const emailReminder = async () => {
    try{
      const activities = await ChallengueActivities.findAll();
      const challengeuser = await ChallengueUsers.findAll();
      const challenge = await Challengue.findAll();

      challenge.forEach(async (cha) => {
        const idChallengeUser = challengeuser.filter(e => e.idChallengue === cha.id).map((a) => {
          return a.dataValues.idUser
        })

        const users = await User.findAll({
          where:{
              id: idChallengeUser
          },
          attributes: [
              "id",
              "firstName",
              "lastName",
              "titleProfessions",
              "img",
              "abbrName",
              "personalLinks",
              "email",
              "about",
              "company",
              "timezone",
              "role",
              "location",
              "city"
          ],
        })

        let bulSendEmail = verificateTime24hours(cha.endDate)
        let bulSendEmail2 = verificateTime24hours(cha.startDate)
        let bulSendEmail3 = verificateTime(cha.endDate)
        let bulSendEmail4 = verificateTime24hoursSubtract(cha.endDate)

        if(bulSendEmail){
          await Promise.all(
            users.map(async (l) => {

              await Promise.resolve(
                (() => {
                    let mailOptions = {
                    from: process.env.SEND_IN_BLUE_SMTP_SENDER,
                    to: l.email,
                    subject: LabEmails.EMAIL_REMINDER_LAST_DAY_CHALENGE.subject(l.firstName,cha),
                    html: LabEmails.EMAIL_REMINDER_LAST_DAY_CHALENGE.body(l.firstName,cha),
                };
        
                return smtpService().sendMailUsingSendInBlue(mailOptions);
    
                })()
              );
                
            })
          );
        }

        if(bulSendEmail2){
          await Promise.all(
            users.map(async (l) => {

              await Promise.resolve(
                (() => {
                    let mailOptions = {
                    from: process.env.SEND_IN_BLUE_SMTP_SENDER,
                    to: l.email,
                    subject: LabEmails.EMAIL_REMINDER_DAY_BEFORE_FIRST_DAY_CHALENGE.subject(l.firstName,cha),
                    html: LabEmails.EMAIL_REMINDER_DAY_BEFORE_FIRST_DAY_CHALENGE.body(l.firstName,cha),
                };
        
                return smtpService().sendMailUsingSendInBlue(mailOptions);
    
                })()
              );
                
            })
          );
        }

        if(bulSendEmail3){
          await Promise.all(
            users.map(async (l) => {

              await Promise.resolve(
                (() => {
                    let mailOptions = {
                    from: process.env.SEND_IN_BLUE_SMTP_SENDER,
                    to: l.email,
                    subject: LabEmails.EMAIL_REMINDER_LAST_DAY_CHALLENGE.subject(l.firstName,cha),
                    html: LabEmails.EMAIL_REMINDER_LAST_DAY_CHALLENGE.body(l.firstName,cha),
                };
        
                return smtpService().sendMailUsingSendInBlue(mailOptions);
    
                })()
              );
                
            })
          );
        }

        if(bulSendEmail4){
          await Promise.all(
            users.map(async (l) => {

              await Promise.resolve(
                (() => {
                    let mailOptions = {
                    from: process.env.SEND_IN_BLUE_SMTP_SENDER,
                    to: l.email,
                    subject: LabEmails.EMAIL_REMINDER_AFTER_LAST_DAY_CHALLENGE.subject(l.firstName,cha),
                    html: LabEmails.EMAIL_REMINDER_AFTER_LAST_DAY_CHALLENGE.body(l.firstName,cha),
                };
        
                return smtpService().sendMailUsingSendInBlue(mailOptions);
    
                })()
              );
                
            })
          );
        }
      })

      activities.forEach(async (data) => {

        const idChallengeUser = challengeuser.filter(e => e.idChallengue === data.idChallenge).map((a) => {
          return a.dataValues.idUser
        })

        const challengeActivity = challenge.filter(a => a.id === data.idChallenge )

        const users = await User.findAll({
            where:{
                id: idChallengeUser
            },
            attributes: [
                "id",
                "firstName",
                "lastName",
                "titleProfessions",
                "img",
                "abbrName",
                "personalLinks",
                "email",
                "about",
                "company",
                "timezone",
                "role",
                "location",
                "city"
            ],
        })

        let bulSendEmail = verificateTime(data.date)

        if(bulSendEmail){
          await Promise.all(
            users.map(async (l) => {

              await Promise.resolve(
                (() => {
                    let mailOptions = {
                    from: process.env.SEND_IN_BLUE_SMTP_SENDER,
                    to: l.email,
                    subject: LabEmails.EMAIL_REMINDER_ACTIVITY.subject(l.firstName,challengeActivity[0]),
                    html: LabEmails.EMAIL_REMINDER_ACTIVITY.body(l.firstName,challengeActivity[0],data),
                };
        
                return smtpService().sendMailUsingSendInBlue(mailOptions);
    
                })()
              );
                
            })
          );
        }
        
      })
    } catch (error) {
      console.log(error);
      return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
    }
  }

  const setStatus = async (req, res) => {
    const data = req.body;
    const { id } = req.user;

    try {

        const challengeUsers = await ChallengeStatusActivities.findOne({where:{
            idUser: Number(id),
            idActivity: Number(data.idActivity)
        }});

        if(!challengeUsers){
            await ChallengeStatusActivities.create({
                idUser: Number(id),
                ...data
            });
        }else{

            await ChallengeStatusActivities.update({
                completed: data.completed,
            },{where:{
                idUser: Number(id),
                idActivity: Number(data.idActivity)
            }});
        }

        return res.status(HttpCodes.OK).send({});
        
      } catch (error) {
        console.log(error);
        return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
      }
  }

  const getStatus = async (req, res) => {
      const { id } = req.user;

      try {

          const ChallengeStatusActivitiess = await ChallengeStatusActivities.findAll({where:{
              idUser: Number(id),
          }});

          return res.status(HttpCodes.OK).send({ChallengeStatusActivitiess});
          
        } catch (error) {
          console.log(error);
          return res
              .status(HttpCodes.INTERNAL_SERVER_ERROR)
              .json({ msg: "Internal server error" });
        }
  }

  const batchWrite = async (req, res) => {
    const ChallengueActivitiesData = req.body;

    const searchTimeZone = (timezone) => {
      let currentTimezone = TimeZoneList.find((item) => item.value === timezone);

      if (currentTimezone) {
        currentTimezone = currentTimezone.utc[0];
      } else {
        currentTimezone = timezone;
      }

      return currentTimezone
    }

    const transformedChallengueActivities = ChallengueActivitiesData.resources

    const activitiesDelete = await ChallengueActivities.findAll({where:{idChallenge: ChallengueActivitiesData.id}});

    await activitiesDelete.forEach((l) => {
      l.destroy()
    })

    try {

      const allChallengueActivities = ChallengueActivities.bulkCreate(
        transformedChallengueActivities
      );

      return res.status(HttpCodes.OK).json({ allChallengueActivities  });
    } catch (error) {
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  /**
 * Method to add PostComment object
 * @param {*} req
 * @param {*} res
 */
  const addComment = async (req, res) => {
    try {
      let data = { ...req.body };
      // const { firstName, lastName } = req.user;
      data.UserId = req.user.id;
      console.log(data)
      ChallengeMessages.create(data);

      const notifications = [];

      // if (data.isAComment && data.postOwnerUserId !== data.UserId) {
      //   const notif = NotificationController().createNotification({
      //     message: `${firstName} ${lastName} commented on your post.`,
      //     type: "post",
      //     meta: {
      //       ...postComment,
      //     },
      //     onlyFor: [data.postOwnerUserId],
      //   });

      //   notifications.push(notif);
      // }

      // if (!data.isAComment) {
      //   if (data.postCommentUserId !== data.UserId) {
      //     const commentOwnerNotif = NotificationController().createNotification(
      //       {
      //         message: `${firstName} ${lastName} replied to your comment.`,
      //         type: "post",
      //         meta: {
      //           ...postComment,
      //         },
      //         onlyFor: [data.postCommentUserId],
      //       }
      //     );

      //     notifications.push(commentOwnerNotif);
      //   }

        // if (
        //   data.postOwnerUserId !== data.postCommentUserId &&
        //   data.postOwnerUserId !== data.UserId
        // ) {
        //   const postOwnerNotif = NotificationController().createNotification({
        //     message: `Someone replied to a comment on your post.`,
        //     type: "post",
        //     meta: {
        //       ...postComment,
        //     },
        //     onlyFor: [data.postOwnerUserId],
        //   });

        //   notifications.push(postOwnerNotif);
        // }
      // }

      await Promise.all(notifications);

      return res.status(HttpCodes.OK).send();
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  /**
   * Method to get comments bu post
   * @param {*} req
   * @param {*} res
   */
  const getAllComment = async (req, res) => {
    const filter = req.query;
    try {
      let where = { PostCommentId: null };

      if (filter.postId) {
        where = {
          ...where,
          PostId: filter.postId,
        };
      }

      if(filter.postId && where.PostId){

        let comments = await ChallengeMessages.findAndCountAll({
          where,
          limit: filter.num,
          order: [["createdAt", "DESC"]],
          attributes: {
            include: [
              [
                literal(`(
                      SELECT UserFN."img"
                      FROM "Users" as UserFN
                      WHERE
                        UserFN.id = "ChallengeMessages"."UserId"
                  )`),
                "userImg",
              ],
              [
                literal(`(
                      SELECT UserFN."firstName"
                      FROM "Users" as UserFN
                      WHERE
                        UserFN.id = "ChallengeMessages"."UserId"
                  )`),
                "userFirstName",
              ],
              [
                literal(`(
                      SELECT UserFN."lastName"
                      FROM "Users" as UserFN
                      WHERE
                        UserFN.id = "ChallengeMessages"."UserId"
                  )`),
                "userLastName",
              ],
            ],
          },
        });

        let requests = comments.rows.map((pc) => {
          return ChallengeMessages.findAll({
              where: { PostCommentId: pc.dataValues.id, PostId: filter.postId },
              order: [["createdAt", "DESC"]],
              attributes: {
                include: [
                  [
                    literal(`(
                        SELECT UserFN."img"
                        FROM "Users" as UserFN
                        WHERE
                          UserFN.id = "ChallengeMessages"."UserId"
                    )`),
                    "userImg",
                  ],
                  [
                    literal(`(
                        SELECT UserFN."firstName"
                        FROM "Users" as UserFN
                        WHERE
                          UserFN.id = "ChallengeMessages"."UserId"
                    )`),
                    "userFirstName",
                  ],
                  [
                    literal(`(
                        SELECT UserFN."lastName"
                        FROM "Users" as UserFN
                        WHERE
                          UserFN.id = "ChallengeMessages"."UserId"
                    )`),
                    "userLastName",
                  ],
                ],
              },
            })
          
        });
        let results = await Promise.all(requests);

        results.map((item, index) => {
          comments.rows[index].dataValues["ChallengeMessages"] = item;
        });
        
        if (!comments) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }

        return res.status(HttpCodes.OK).json({ comments });
      }else{
        return res.status(HttpCodes.OK).json({});
      }
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  /**
   * Method to delete PostComment object
   * @param {*} req
   * @param {*} res
   */
  const removeComment = async (req, res) => {
    let { id } = req.params;

    if (id) {
      try {
        await ChallengeMessages.destroy({
          where: { PostCommentId: id },
        });
        await ChallengeMessages.destroy({
          where: { id },
        });
        return res.status(HttpCodes.OK).send();
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
    add,
    remove,
    edit,
    get,
    getOne,
    download,
    batchWrite,
    joinOrLeave,
    sendD,
    emailReminder,
    setStatus,
    getStatus,
    addComment,
    getAllComment,
    removeComment
  };
};

module.exports = ChallengeController;
