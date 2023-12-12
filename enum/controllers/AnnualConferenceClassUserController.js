const db = require("../models");
const HttpCodes = require("http-codes");
const Sequelize = require("sequelize");
const { Op } = require("sequelize");

const AnnualConferenceClassUser = db.AnnualConferenceClassUser;
const AnnualConferenceClass = db.AnnualConferenceClass;
const SpeakerPanelsClass = db.SpeakerPanelsClass;
const SpeakerPanelClassUser = db.SpeakerPanelClassUser;

const AnnualConferenceClassUserController = () => {
  /**
   * Method to get Course object
   * @param {*} req
   * @param {*} res
   */
  const getProgressAnnualConferenceByUser = async (req, res) => {
    const { conference } = req.params;
    const { type } = req.query

    if (conference) {
      try {
        let annualConferenceClassUser = [];
        if(type === '2022' || type === undefined || type === null){
          annualConferenceClassUser = await AnnualConferenceClassUser.findAll({
            include: [
              {
                model: AnnualConferenceClass,
                where: {
                  AnnualConferenceId: conference,
                },

                required: true,
              },
            ],
            where: {
              UserId: req.user.id,
              type: '2022'
            },
          });
        }else{

          let annualConferenceClass = await SpeakerPanelsClass.findOne({
            where: {
              AnnualConferenceId: conference,
            },
          });

          annualConferenceClassUser = await SpeakerPanelClassUser.findAll({
            where: {
              UserId: req.user.id,
              type: type
            },
          })

          annualConferenceClassUser = annualConferenceClassUser.map((data) => {
            return {...data.dataValues,AnnualConferenceClass:annualConferenceClass.dataValues}
          })

        }

        return res.status(HttpCodes.OK).json({ annualConferenceClassUser });
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

  /**
   * Method to add CourseClassUser object
   * @param {*} req
   * @param {*} res
   */
  const setProgress = async (req, res) => {
    try {
      let annualConferenceClassUser = []
      if(req.body.type === '2022' || req.body.type === undefined || req.body.type === null){
        annualConferenceClassUser = await AnnualConferenceClassUser.findOne({
          where: {
            AnnualConferenceClassId: req.body.SessionClassId,
            UserId: req.user.id,
            type: req.body.type
          },
        });
      }else{
        annualConferenceClassUser = await SpeakerPanelClassUser.findOne({
          where: {
            AnnualConferenceClassId: req.body.SessionClassId,
            UserId: req.user.id,
            type: req.body.type
          },
        });
      }

      if (!annualConferenceClassUser) {
        add({ ...req.body, UserId: req.user.id });
      } else {
        if (req.body.progressVideo > annualConferenceClassUser.progressVideo) {
          update({ ...req.body, UserId: req.user.id });
        } else if (req.body.viewed) {
          update({ ...req.body, UserId: req.user.id });
        }
      }

      return res.status(HttpCodes.OK).send();
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  /**
   * Method to add CourseClassUser object
   */
  const add = async (params) => {
    const { progressVideo, UserId, SessionClassId, type } = params;

    try {
      const newData = {
        progressVideo,
        UserId,
        AnnualConferenceClassId: SessionClassId,
        type,
        viewed:false
      };
      if(type === '2022' || type === undefined || type === null){
        await AnnualConferenceClassUser.create(newData);
      }else{
        await SpeakerPanelClassUser.create(newData)
      }
      
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Method to update Course Class User object
   */
  const update = async (params) => {
    const { progressVideo, UserId, SessionClassId, viewed, type } = params;

    try {
      let newData = {
        progressVideo,
        UserId,
        AnnualConferenceClassId: SessionClassId,
        type,
        viewed: false
      };

      if (viewed) {
        newData = {
          ...newData,
          viewed,
        };
      }

      if(type === '2022' || type === undefined || type === null){
        await AnnualConferenceClassUser.update(newData, {
          where: {
            AnnualConferenceClassId: newData.AnnualConferenceClassId,
            UserId: newData.UserId,
          },
        });
      }else{
        await SpeakerPanelClassUser.update(newData, {
          where: {
            AnnualConferenceClassId: newData.AnnualConferenceClassId,
            UserId: newData.UserId,
          },
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  return {
    getProgressAnnualConferenceByUser,
    add,
    update,
    setProgress,
  };
};

module.exports = AnnualConferenceClassUserController;
