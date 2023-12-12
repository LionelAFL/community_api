const db = require("../models");
const HttpCodes = require("http-codes");
const s3Service = require("../services/s3.service");
const fs = require('fs')
const path = require('path')
const smtpService = require("../services/smtp.service");
const moment = require("moment-timezone");

const User = db.User;
const FilesPost = db.FilesPost;

const FilesPostController = () => {
  const add = async (req,res) => {

    const {body} = req
    const { email } = req.user;

    try {

      const startDate = moment().tz("America/Los_Angeles").format('YYYY-MM-DD hh:mm a');

      const { Location: documentFileUrl, key: documentFileName } = await s3Service().uploadFile(
          body.file,
          'application/pdf',
          body.title
      );

      const documentFileImageUrl = await s3Service().getFilePostImageUrl(
        "",
        body.imageFile
      )

      const filePost = await FilesPost.create({ ...req.body ,documentFileUrl,documentFileName: body.title,documentFileImageUrl,startDate, owner: email});

      return res.status(HttpCodes.OK).send({filePost});
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

        await FilesPost.destroy({
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
      .json({ msg: "Bad Request: id is wrong" });
  }

  const edit = async (req,res) => {
    const { body } = req;
    try {
      let data = {}

      if(body.title !== undefined){

          const { Location: documentFileUrl, key: documentFileName } = await s3Service().uploadFile(
              body.file,
              'application/pdf',
              body.title
          );

          data = {documentFileUrl,documentFileName: body.title}
      }

      if(body.imageFile !== undefined && body.imageFile.substring(0,5) !== 'https'){
        const documentFileImageUrl = await s3Service().getFilePostImageUrl(
          "",
          body.imageFile,
        )

        data={...data, documentFileImageUrl}
      }

        await FilesPost.update({
          name:body.name,
          description: body.description,
          ...data
        }, {
            where: { id: body.id },
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

    try {

      const filesPost = await FilesPost.findAll();

      return res.status(HttpCodes.OK).json( filesPost );

    } catch (error) {
      console.log(error);
      return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
    }
  }

  const download = async (req,res) => {
    const { id } = req.params;
    try {

      const filesPost = await FilesPost.findOne({where: { id: id }});

      let request = require('request').defaults({ encoding: null });

      return request.get(filesPost.documentFileUrl,async function (error, response, body) {
          if (!error && response.statusCode == 200) {
              data = "data:" + response.headers["content-type"] + ";base64," + Buffer.from(body).toString('base64');
              return res.status(HttpCodes.OK).send(data)
          }
      });
      
    } catch (error) {
      console.log(error);
      return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
    }
  }

  return {
    add,
    remove,
    edit,
    get,
    download
  };
};

module.exports = FilesPostController;
