const db = require("../models");
const HttpCodes = require("http-codes");
const smtpService = require("../services/smtp.service");
const { Op } = require("sequelize");
const { LabEmails } = require("../enum");

const ControlCertificate = db.ControlCertificate
const Event = db.Event;
const User = db.User;

const CertificateController = () => {
    const addCertificateControl = async (req, res) => {

        const { type, idTypeCertificate, title, bul } = req.body
        const { id, email, firstName } = req.user.dataValues;

        try {

            const certificateUserExist = await ControlCertificate.findOne({
                where: {idUser: id, idTypeCertificate: idTypeCertificate}
            })

            if(certificateUserExist === null || certificateUserExist === undefined){

                let caracteres = "abcdefghijkmnpqrtuvwxyzABCDEFGHJKMNPQRTUVWXYZ2346789";
                let code = "";
                let bulDat = false

                while(!bulDat){

                    for (i=0; i<30; i++) code +=caracteres.charAt(Math.floor(Math.random()*caracteres.length)); 

                    let certificateExist = await ControlCertificate.findOne({
                        where: {code: code}
                    })

                    if(certificateExist === null || certificateExist === undefined){
                        bulDat = true
                    }

                }

                draftEmailResponse = await ControlCertificate.create({
                    idUser: id,
                    idTypeCertificate: idTypeCertificate,
                    type: type,
                    code: code,
                })

                if(bul !== false){
                    await Promise.resolve(
                        (() => {
                            let mailOptions = {
                                from: process.env.SEND_IN_BLUE_SMTP_SENDER,
                                to: email,
                                subject: LabEmails.SEND_CETIFICATE_CODE.subject(title),
                                html: LabEmails.SEND_CETIFICATE_CODE.body(firstName, code, title),
                            };
                
                            return smtpService().sendMailUsingSendInBlue(mailOptions);
                        })()
                    );
                }

                return res.status(HttpCodes.OK).json({codeCertificate: code})

            }else{

                if(bul !== false){
                    await Promise.resolve(
                        (() => {
                            let mailOptions = {
                                from: process.env.SEND_IN_BLUE_SMTP_SENDER,
                                to: email,
                                subject: LabEmails.SEND_CETIFICATE_CODE.subject(title),
                                html: LabEmails.SEND_CETIFICATE_CODE.body(firstName, certificateUserExist.dataValues.code, title),
                            };
                
                            return smtpService().sendMailUsingSendInBlue(mailOptions);
                        })()
                    );
                }

                return res.status(HttpCodes.OK).json({codeCertificate: certificateUserExist.dataValues.code})

            }

        } catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }
    }

    const getCodeCertificate = async (req, res) => {
        const { idTypeCertificate } = req.body
        const { id } = req.user.dataValues;

        try {

            const certificateUserExist = await ControlCertificate.findOne({
                where: {idUser: id, idTypeCertificate: idTypeCertificate}
            })

            return res.status(HttpCodes.OK).json({codeCertificate: certificateUserExist.dataValues.code})

        } catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }
    }

    const getCertificateControl = async (req, res) => {
        const {code} = req.params

        try{

            const certificate = await ControlCertificate.findOne({
                where: {code}
            })

            if(certificate !== null && certificate !== undefined){

                let userData = await User.findOne({
                    attributes: ["firstName", "lastName", "img", "abbrName", "id"],
                    where: {
                      id: certificate.dataValues.idUser,
                    },
                });

                return res.status(HttpCodes.OK).json({userCertificate: userData, certificate: certificate})

            }else{
                return res
                    .status(HttpCodes.INTERNAL_SERVER_ERROR)
                    .json({ msg: "Internal server error" });
            }
        }catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }
    }

    const getAllTypeCertificateControl = async (req, res) => {
        const {type} = req.params
        const { id } = req.user.dataValues;

        try{

            let certificate
            
            if(type !== 'all'){

                certificate = await ControlCertificate.findAll({
                    where: {type:type, idUser: id}
                })

            }else{

                certificate = await ControlCertificate.findAll({
                    where: { idUser: id}
                })

            }

            return res.status(HttpCodes.OK).json({certificate: certificate, dUser: id})
        }catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }
    }

    return{
        addCertificateControl,
        getCertificateControl,
        getAllTypeCertificateControl,
        getCodeCertificate
    }
}

module.exports = CertificateController;