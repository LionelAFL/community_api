const db = require("../models");
const HttpCodes = require("http-codes");
const s3Service = require("../services/s3.service");
const fs = require('fs')
const path = require('path')
const smtpService = require("../services/smtp.service");
const moment = require("moment-timezone");
const sendInBlueService = require("../services/sendinblue.service");
const { EmailContent } = require("../enum");

// const User = db.User;
const Event = db.Event;
const EventWorkshopVerify = db.EventWorkshopVerify;
const ControlCertificate = db.ControlCertificate

const EventWorkshopVerifyController = () => {
  const add = async (req,res) => {

    const {idEvent, status, code, certificate, url} = req.body
    const { id,email } = req.user;
    let newUrl

    try {

        if (certificate) {
            newUrl = await s3Service().getEventEmailUrl(
              "",
              certificate
            );
          }

        const workShop = await EventWorkshopVerify.findOne({where: {idEvent, idUser: id}})

        const certificateUserExist = await ControlCertificate.findOne({
          where: {idUser: id, idTypeCertificate: idEvent}
        })

        const EventData = await Event.findOne({where: {id: idEvent}})
        
        if(EventData.dataValues.codeVerifyEvent !== code){
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: `The verification code does not match.` });
        }

        await sendInBlueService().suscriptionSendingBlue(email)

        if(!workShop){

          await EventWorkshopVerify.create({
              idEvent,
              idUser: id,
              status
          })

        }

        const mailOptions = {
            from: process.env.SEND_IN_BLUE_SMTP_SENDER,
            to: email,
            subject: `Your Digital Certificate of Attendance for the event ${EventData.dataValues.title}`,
            html: EmailContent.EVENT_ATTENDED_EMAIL_CONFIRMATION(req.user, EventData.dataValues, certificateUserExist.dataValues.code),
            contentType: "text/calendar",
        };
    
        mailOptions["attachments"] = [
            {
                filename: "Hacking HR's Certificate.png",
                path: newUrl,
            },
        ]

        await smtpService().sendMailUsingSendInBlue(mailOptions);  
        

      return res.status(HttpCodes.OK).send({});
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  }

//   const remove = async (req,res) => {
    
//   }

//   const edit = async (req,res) => {
    
    
//   }

  const get = async (req,res) => {

    const { id } = req.user;

    try {

      const EventWorkshopVerifyData = await EventWorkshopVerify.findAll({where:{
        idUser: id
      }});

      return res.status(HttpCodes.OK).json( {EventWorkshopVerifyData} );

    } catch (error) {
      console.log(error);
      return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
    }
  }


  return {
    add,
    // remove,
    // edit,
    get,
  };
};

module.exports = EventWorkshopVerifyController;
