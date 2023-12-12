const db = require("../models");
const HttpCodes = require("http-codes");
const s3Service = require("../services/s3.service");
const Sequelize = require("sequelize");

const AnnualConferenceClass = db.AnnualConferenceClass;
const SpeakerPanelsClass = db.SpeakerPanelsClass;

const AnnualConferenceClassController = () => {
  /**
   * Method to get all AnnualConferenceClass objects
   * @param {*} req
   * @param {*} res
   */
  
  const getAll = async (req, res) => {
    try {
      let annualConferenceClass = await AnnualConferenceClass.findAll({
        order: [["AnnualConferenceId", "DESC"]],
      });
      if (!annualConferenceClass) {
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }

      return res.status(HttpCodes.OK).json({ annualConferenceClass });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };
  /**
   * Method to get AnnualConferenceClass by Conference object
   * @param {*} req
   * @param {*} res
   */
  const getByAnnualConference = async (req, res) => {
    const { conference } = req.params;
    const { type } = req.query

    if (conference) {
      try {
        let annualConferenceClasses
        if(type === '2022' || type === undefined || type === null){
          annualConferenceClasses = await AnnualConferenceClass.findAll({
            where: {
              AnnualConferenceId: conference,
            },
            order: [["createdAt", "ASC"]],
          });
        }else{
          annualConferenceClasses = await SpeakerPanelsClass.findAll({
            where: {
              AnnualConferenceId: conference,
            },
          })
        }
        

        if (!annualConferenceClasses) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }

        return res.status(HttpCodes.OK).json({ annualConferenceClasses });
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
   * Method to get CourseClass object
   * @param {*} req
   * @param {*} res
   */
  const get = async (req, res) => {
    const { id, type } = req.params;

    if (id) {
      try {
        let annualConferenceClass
        if(type === '2022' || type === undefined || type === null){
          annualConferenceClass = await AnnualConferenceClass.findOne({
            where: {
              id,
            },
          });
        }else{
          annualConferenceClass = await SpeakerPanelsClass.findOne({
            where: {
              id,
            },
          });
        }

        if (!annualConferenceClass) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }

        return res.status(HttpCodes.OK).json({ annualConferenceClass });
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
   * Method to add AnnualConferenceClass object
   * @param {*} req
   * @param {*} res
   */
  const add = async (req, res) => {

    const { type } = req.body

    try {
      if(type === '2022' || type === undefined || type === null){
        await AnnualConferenceClass.create({ ...req.body });
      }else{
        await SpeakerPanelsClass.create({ ...req.body });
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
   * Method to update AnnualConferenceClass object
   * @param {*} req
   * @param {*} res
   */
  const update = async (req, res) => {
    const { id } = req.params;
    const { body } = req;
    const { type } = body;

    if (id) {
      try {
        const audioFileType = body?.audioFileUrl?.match(
          /[^:]\w+\/[\w-+\d.]+(?=;|,)/
        );

        const documentFileType = body?.documentFileUrl?.match(
          /[^:]\w+\/[\w-+\d.]+(?=;|,)/
        );

        let data = {
          ...body,
        };

        if (audioFileType) {
          const { Location: audioFileUrl, key: audioFileName } =
            await s3Service().uploadFile(
              body.audioFileUrl,
              audioFileType[0],
              body.title
            );

          data = {
            ...data,
            audioFileUrl,
            audioFileName,
          };
        }

        if (documentFileType) {
          const { Location: documentFileUrl, key: documentFileName } =
            await s3Service().uploadFile(
              body.documentFileUrl,
              documentFileType[0],
              body.title
            );

          data = {
            ...data,
            documentFileUrl,
            documentFileName,
          };
        }

        if(type === '2022' || type === undefined || type === null){
          await AnnualConferenceClass.update(data, {
            where: { id },
          });
        }else{
          await SpeakerPanelsClass.update(data, {
            where: { id },
          });
        }
        

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
  /**
   * Method to delete AnnualConferenceClass object
   * @param {*} req
   * @param {*} res
   */
  const remove = async (req, res) => {
    const { id } = req.params;
    const { type } = req.query

    if (id) {
      try {

        if(type === '2022' || type === undefined || type === null){
          await AnnualConferenceClass.destroy({
            where: {
              id,
            },
          });
        }else{
          await SpeakerPanelsClass.destroy({
            where: {
              id,
            },
          });
        }

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
  };

  return {
    getAll,
    getByAnnualConference,
    get,
    add,
    update,
    remove,
  };
};

module.exports = AnnualConferenceClassController;
