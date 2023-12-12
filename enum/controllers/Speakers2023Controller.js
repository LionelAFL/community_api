const db = require("../models");
const Sequelize = require("sequelize");
const { Op } = Sequelize;
const HttpCodes = require("http-codes");
const smtpService = require("../services/smtp.service");
const { LabEmails } = require("../enum");
const path = require("path")
const fs = require("fs")
const moment = require("moment")
const {formatExcelUsers} = require("../utils/formatExportUsersExcel.js")
const {formatExcelPanels} = require("../utils/formatExportPanelsExcel.js")
const {
    convertJSONToExcelUsersSpeakers2023,
    convertJSONToExcelPanelsConference2023,
    convertJSONToExcelRegisterConference2023
  } = require("../utils/format");
  const { convertToLocalTime } = require("../utils/format");
  const sendInBlueService = require("../services/sendinblue.service");

const User = db.User;
const SpeakersPanel = db.SpeakerPanel;
const SpeakerMemberPanel = db.SpeakerMemberPanel
const SponsorsConference2023 = db.SponsorsConference2023
const ParrafConference2023 = db.ParrafConference2023
const EmailDraftChannel = db.EmailDraftChannel
const SpeakerPanelStatus = db.SpeakerPanelStatus

const SpeakersController = () => {

    const addNewPanelSpeaker = async (req, res) => {

        const { panels } = req.body;
        
        const { id, role } = req.user.dataValues;

        const { 
            description, 
            endDate, 
            startDate, 
            timeZone, 
            panelName, 
            type, 
            category, 
            objetives, 
            link, 
            recertificactionCredits, 
            metaData, 
            speakers, 
            speakersModerator,
            numberOfHRCredits,
            descriptionPanel,
            hrCreditsBoolean,
            typeHrCredits,
        } = panels

        try {
    
            if (role !== "admin") {
                return res
                    .status(HttpCodes.BAD_REQUEST)
                    .json({ msg: "You must to be admin" });
            }

            const panelsSpeakers = await SpeakersPanel.create({
                OwnerId: id, 
                metaData,
                recertificactionCredits,
                description, 
                endDate, 
                startDate, 
                timeZone, 
                panelName,
                link,
                objetives,
                category,
                type,
                numberOfHRCredits,
                descriptionPanel,
                hrCreditsBoolean,
                typeHrCredits,
            },{order: [["id", "DESC"]]})

            if(type === "Panels"){
                const allSpeakersAccepted = await User.findAll({where: {speakersAuthorization: {[Op.eq]: "accepted",[Op.not]: null, [Op.ne]: ""}}});

                let newArray = allSpeakersAccepted.filter(data => {
                    return data.speakersAuthorization === "accepted"
                })

                await Promise.all(
                    newArray.map(async (data) => {
    
                        await Promise.resolve(
                            (() => {
                                let mailOptions = {
                                    from: process.env.SEND_IN_BLUE_SMTP_SENDER,
                                    to: data.email,
                                    subject: LabEmails.NEW_PANEL_CONFERENCE_2023.subject(data.firstName),
                                    html: LabEmails.NEW_PANEL_CONFERENCE_2023.body(data.firstName, panelName),
                                };
                    
                                return smtpService().sendMailUsingSendInBlue(mailOptions);
                            })()
                        );
                        
                    })
                );
            }

            if(speakers?.length !== 0 && speakers !== undefined){
                await Promise.all(
                    speakers.map(async (data) => {
                        const user = JSON.parse(data)

                        const userReadyJoin = await SpeakerMemberPanel.findOne({
                            where: { UserId: Number(user.userId), SpeakersPanelId: panelsSpeakers.dataValues.id},
                        })

                        if(!userReadyJoin){

                            await Promise.resolve(
                                (() => {
                                    let mailOptions = {
                                    from: process.env.SEND_IN_BLUE_SMTP_SENDER,
                                    to: user.userEmail,
                                    subject: LabEmails.SPEAKERS_PANEL_JOIN.subject(user.userName, panelsSpeakers.dataValues.panelName),
                                    html: LabEmails.SPEAKERS_PANEL_JOIN.body(
                                        user.userName,
                                        panelsSpeakers.dataValues,
                                    ),
                                    };
                        
                                    return smtpService().sendMailUsingSendInBlue(mailOptions);
                                })()
                            );

                            await SpeakerMemberPanel.create({
                                UserId: Number(user.userId), 
                                SpeakersPanelId: panelsSpeakers.dataValues.id, 
                                isModerator: false, 
                            }) 
                        }else{
                            return res
                            .status(HttpCodes.INTERNAL_SERVER_ERROR)
                            .json({ msg: `Users has already been added.` });
                        }
                        
                    })
                );
            }

            if(speakersModerator?.length !== 0 && speakersModerator !== undefined){
                await Promise.all(
                    speakersModerator.map(async (data) => {
                        const user = JSON.parse(data)

                        const userReadyJoin = await SpeakerMemberPanel.findOne({
                            where: { UserId: Number(user.userId), SpeakersPanelId: panelsSpeakers.dataValues.id},
                        })

                        if(!userReadyJoin){

                            await Promise.resolve(
                                (() => {
                                    let mailOptions = {
                                    from: process.env.SEND_IN_BLUE_SMTP_SENDER,
                                    to: user.userEmail,
                                    subject: LabEmails.SPEAKERS_PANEL_JOIN_FOR_ADMIN_MODERATOR.subject(user.userName,panelsSpeakers.dataValues.panelName),
                                    html: LabEmails.SPEAKERS_PANEL_JOIN_FOR_ADMIN_MODERATOR.body(
                                        user.userName,
                                        panelsSpeakers.dataValues,
                                    ),
                                };
                        
                                return smtpService().sendMailUsingSendInBlue(mailOptions);

                                })()
                            );

                            await SpeakerMemberPanel.create({
                                UserId: Number(user.userId), 
                                SpeakersPanelId: panelsSpeakers.dataValues.id, 
                                isModerator: true, 
                            }) 
                        }else{
                            return res
                            .status(HttpCodes.INTERNAL_SERVER_ERROR)
                            .json({ msg: `Users has already been added.` });
                        }
                        
                    })
                );
            }

            return res.status(HttpCodes.OK).json({ panelsSpeakers });

        } catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }
    };

    const allPanelSpeakers = async (req, res) => {

        const type = req.params

        let panelsSpeakers

        try {

            if(type.type !== "All"){
                panelsSpeakers = await SpeakersPanel.findAll({
                    order: [["startDate", "DESC"]],
                    where: {type: type.type, visible: true, status: 'active'},
                    include: [
                        {
                            model: SpeakerMemberPanel,
                            include: [
                                {
                                    model: User,
                                    attributes: [
                                        "id",
                                        "firstName",
                                        "lastName",
                                        "titleProfessions",
                                        "img",
                                        "abbrName",
                                        "email"
                                    ],
                                }
                            ]
                        }
                    ],
                })
            }else{
                panelsSpeakers = await SpeakersPanel.findAll({
                    order: [["startDate", "DESC"]],
                    where: {visible: true},
                    include: [
                        {
                            model: SpeakerMemberPanel,
                            include: [
                                {
                                    model: User,
                                    attributes: [
                                        "id",
                                        "firstName",
                                        "lastName",
                                        "titleProfessions",
                                        "img",
                                        "abbrName",
                                        "email"
                                    ],
                                }
                            ]
                        }
                    ],
                })
            }

            return res.status(HttpCodes.OK).json({ panelsSpeakers });

        } catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }
    };

    const panelForId = async (req, res) => {
        const {id} = req.params
        try {
           
            const userSpeakers = await SpeakersPanel.findOne({
              where: {
                  id: id,
                  visible: true, 
              },
              include: [
                {
                    model: SpeakerMemberPanel,
                    include: [
                        {
                            model: User,
                            attributes: [
                                "id",
                                "firstName",
                                "lastName",
                                "titleProfessions",
                                "img",
                                "abbrName",
                                "email"
                            ],
                        }
                    ]
                }
            ],
            });
      
            return res.status(HttpCodes.OK).json({ userSpeakers });
          } catch (error) {
            console.log(error);
            return res
              .status(HttpCodes.INTERNAL_SERVER_ERROR)
              .json({ msg: "Internal server error" });
          }
    };

    const allMemberSpeakerToPanel = async (req, res) => {

        const { id } = req.user.dataValues;

        try {

            const member = await SpeakerMemberPanel.findAll({
                where: { UserId: id },
            })

            return res.status(HttpCodes.OK).json({ member });

        } catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }
    };

    const addUserSpeakerToPanel = async (req, res) => {
        const { data } = req.body;
        const {usersNames, bul, panel, type} = data

        const { id, role } = req.user.dataValues;

        let panelsSpeakers

        const moderators = await SpeakerMemberPanel.findAll({
            where: {SpeakersPanelId: panel.id, isModerator: true},
            include: [
                {
                    model: User,
                    attributes: [
                        "id",
                        "email"
                    ],
                }
            ],
        })

        try {

            if(role === "admin" && type === "addUserAdmin"){
                await Promise.all(
                    usersNames.map(async (data) => {
                        const user = JSON.parse(data)
                        const userReadyJoin = await SpeakerMemberPanel.findOne({
                            where: { UserId: user.userId, SpeakersPanelId: panel.id},
                        })
    
                        if(!userReadyJoin){
    
                            if(bul){

                                await Promise.resolve(
                                    (() => {
                                        let mailOptions = {
                                        from: process.env.SEND_IN_BLUE_SMTP_SENDER,
                                        to: user.userEmail,
                                        subject: LabEmails.SPEAKERS_PANEL_JOIN_FOR_ADMIN_MODERATOR.subject(user.userName,panel.panelName),
                                        html: LabEmails.SPEAKERS_PANEL_JOIN_FOR_ADMIN_MODERATOR.body(
                                            user.userName,
                                            panel,
                                        ),
                                    };
                            
                                    return smtpService().sendMailUsingSendInBlue(mailOptions);

                                    })()
                                );

                            }else{

                                await Promise.resolve(
                                    (() => {
                                        let mailOptions = {
                                        from: process.env.SEND_IN_BLUE_SMTP_SENDER,
                                        to: user.userEmail,
                                        subject: LabEmails.SPEAKERS_PANEL_JOIN_FOR_ADMIN.subject(user.userName,panel.panelName),
                                        html: LabEmails.SPEAKERS_PANEL_JOIN_FOR_ADMIN.body(
                                            user.userName,
                                            panel,
                                        ),
                                    };
                            
                                    return smtpService().sendMailUsingSendInBlue(mailOptions);

                                    })()
                                );  

                            }
                            
                            await SpeakerMemberPanel.create({
                                UserId: user.userId, 
                                SpeakersPanelId: panel.id, 
                                isModerator: bul, 
                            }) 
                        }else{
                            return res
                            .status(HttpCodes.INTERNAL_SERVER_ERROR)
                            .json({ msg: `Users has already been added.` });
                        }
                        
                    })
                );
    
                panelsSpeakers = await SpeakersPanel.findAll({
                    order: [["id", "DESC"]],
                    where: {visible: true, status: 'active'},
                    include: [
                        {
                            model: SpeakerMemberPanel,
                            include: [
                                {
                                    model: User,
                                    attributes: [
                                        "id",
                                        "firstName",
                                        "lastName",
                                        "titleProfessions",
                                        "img",
                                        "abbrName",
                                        "email"
                                    ],
                                }
                            ]
                        }
                    ],
                })
            }
            if(type === "joinUser"){

                const userReadyJoin = await SpeakerMemberPanel.findOne({
                    where: { UserId: id, SpeakersPanelId: panel.id},
                })

                if(userReadyJoin){
                    return res
                        .status(HttpCodes.BAD_REQUEST)
                        .json({ msg: "You are ready join to this panel." });
                }
     
                const userLimitPanel =  await SpeakerMemberPanel.findAll({
                    where: { SpeakersPanelId: panel.id, isModerator: false},
                })
                

                if(userLimitPanel.length > 4){
                    return res
                        .status(HttpCodes.BAD_REQUEST)
                        .json({ msg: "This panel is full."});
                }

                if(role !== "admin"){
                    const userLimit = await SpeakerMemberPanel.findAll({
                        where: { UserId: id },
                    })
                    
                    if(userLimit.length > 1){
                        return res
                            .status(HttpCodes.BAD_REQUEST)
                            .json({ msg: "You can't join more than two panels." });
                    }
                }

                await Promise.resolve(
                    (() => {
                        let mailOptions = {
                            from: process.env.SEND_IN_BLUE_SMTP_SENDER,
                            to: usersNames.userEmail,
                            subject: LabEmails.SPEAKERS_PANEL_JOIN.subject(usersNames.userName,panel.panelName),
                            html: LabEmails.SPEAKERS_PANEL_JOIN.body(
                                usersNames.userName,
                                panel,
                            ),
                        };
            
                        return smtpService().sendMailUsingSendInBlue(mailOptions);
                    })()
                );

                await SpeakerMemberPanel.create({
                    UserId: usersNames.userId, 
                    SpeakersPanelId: panel.id, 
                    isModerator: bul, 
                })
    
                panelsSpeakers = await SpeakersPanel.findAll({
                    order: [["id", "DESC"]],
                    where: {visible: true, status: 'active'},
                    include: [
                        {
                            model: SpeakerMemberPanel,
                            include: [
                                {
                                    model: User,
                                    attributes: [
                                        "id",
                                        "firstName",
                                        "lastName",
                                        "titleProfessions",
                                        "img",
                                        "abbrName",
                                        "email"
                                    ],
                                }
                            ]
                        }
                    ],
                })
            }

            return res.status(HttpCodes.OK).json({ panelsSpeakers });

        } catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }
    };

    const removeUserSpeakerToPanel = async (req, res) => {
        const { data } = req.body;

        const { firstName, lastName } = req.user.dataValues;

        try {

            await SpeakerMemberPanel.destroy({
                where:{ id: data?.id},
                raw: true,
            })

            await Promise.resolve(
                (() => {
                    let mailOptions = {
                        from: process.env.SEND_IN_BLUE_SMTP_SENDER,
                        to: "enrique@hackinghr.io",
                        subject: LabEmails.USER_IS_WITHDRAW.subject,
                        html: LabEmails.USER_IS_WITHDRAW.body(firstName, lastName, data?.panelName),
                    };
        
                    return smtpService().sendMailUsingSendInBlue(mailOptions);
                })()
            );

            const panelsSpeakers = await SpeakersPanel.findAll({
                order: [["id", "DESC"]],
                where: {visible: true, status: 'active'},
                include: [
                    {
                        model: SpeakerMemberPanel,
                        include: [
                            {
                                model: User,
                                attributes: [
                                    "id",
                                    "firstName",
                                    "lastName",
                                    "titleProfessions",
                                    "img",
                                    "abbrName"
                                ],
                            }
                        ]
                    }
                ],
            })

            return res.status(HttpCodes.OK).json({ panelsSpeakers });

        } catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }
    };

    const registerUserIfNotAreRegisterConference2023 = async (req, res) => {

        const { email, firstName, id, registerConference2023 } = req.user.dataValues;

        try{
        
            if(!registerConference2023){
                await Promise.resolve(
                    (() => {
                        let mailOptions = {
                        from: process.env.SEND_IN_BLUE_SMTP_SENDER,
                        to: email,
                        subject: LabEmails.REGISTER_CONFERENCE_2023.subject(firstName),
                        html: LabEmails.REGISTER_CONFERENCE_2023.body(firstName),
                        };
            
                        return smtpService().sendMailUsingSendInBlue(mailOptions);
                    })()
                );

                const [numberOfAffectedRows, affectedRows] = await User.update({
                    registerConference2023: true
                },
                {
                    where: {
                        id: id
                    },
                })
                return res.status(HttpCodes.OK).json({ numberOfAffectedRows, affectedRows }); 

            }else{
                return res.status(HttpCodes.OK); 
            }  
        }catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }
    };

    const getAllUserSpeaker = async (req, res) => {

        const {type} = req.params
        let userSpeakers

        try {
           
            if(type === "tableSpeakers"){
                userSpeakers = await User.findAll({
                    where: {
                        [Op.or]: [
                            {speakersAuthorization: {[Op.eq]: "accepted",[Op.not]: null, [Op.ne]: ""}},
                            {speakersAuthorization: {[Op.eq]: "pending"}},
                            {speakersAuthorization: {[Op.eq]: "reject"}}
                        ]
                    },
                    attributes: [
                        "firstName",
                        "lastName",
                        "email",
                        "id",
                        "abbrName",
                        "img",
                        "titleProfessions",
                        "personalLinks",
                        "speakersAuthorization",
                        "role",
                        "about",
                        "city",
                        "location",
                        "timezone",
                        "company"
                    ],
                    order: [["firstName", "ASC"]],
                });
            }else{
                userSpeakers = await User.findAll({
                    where: {
                        speakersAuthorization: {[Op.eq]: "accepted",[Op.not]: null, [Op.ne]: ""},
                        percentOfCompletion: 100
                    },
                    attributes: [
                        "firstName",
                        "lastName",
                        "email",
                        "id",
                        "abbrName",
                        "img",
                        "titleProfessions",
                        "personalLinks",
                        "speakersAuthorization",
                        "role",
                        "about",
                        "city",
                        "location",
                        "timezone",
                        "company",
                        "percentOfCompletion"
                    ],
                    order: [["firstName", "ASC"]],
                    include: [
                        {
                            model: SpeakerMemberPanel,
                        }
                    ]
                });

                if(type === "conference"){
                    userSpeakers = userSpeakers.filter(data => {
                        return data.SpeakerMemberPanels.length > 0
                    })
                }
            }
    
            return res.status(HttpCodes.OK).json({ userSpeakers });
        } catch (error) {
          console.log(error);
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }
    };

    const excelAllUserRegisterConference2023 = async (req, res) => {

        try{

            const allUserConference = await User.findAll({where: {registerConference2023: true}})

            const nombre = moment().format("MM-DD-HH-mm-s")

            await convertJSONToExcelUsersSpeakers2023(
                nombre,
                formatExcelUsers,
                allUserConference.map((user) => user.toJSON())
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
    }

    const excelAllPanelsRegisterConference2023 = async (req, res) => {
        try{

            const panelsSpeakers = await SpeakersPanel.findAll({
                order: [["startDate", "ASC"]],
                where: {visible: true},
                include: [
                    {
                        model: SpeakerMemberPanel,
                        include: [
                            {
                                model: User,
                                attributes: [
                                    "firstName",
                                    "lastName",
                                    "email",
                                    "role",
                                    "company",
                                    "titleProfessions",
                                    "about",
                                    "about",
                                    "timezone",
                                    "location",
                                    "city",
                                ],
                            }
                        ]
                    }
                ],
            })

            const nombre = moment().format("MM-DD-HH-mm-s")

            await convertJSONToExcelPanelsConference2023(
                nombre,
                formatExcelPanels,
                formatExcelUsers,
                panelsSpeakers.map((panels) => {
                    return panels.toJSON()
                })
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
    }

    const excelAllsersSpeakersAndPanels = async (req, res) => {
        try{

            const userAddedInConferece = await SpeakersPanel.findAll({
                where:{usersAddedToThisAgenda: { [Op.ne] : []}, visible: true},
            });

            const userConference = await User.findAll({
                where:{registerConference2023: true}, attributes: ["id","firstName","lastName","email"],
            });

            let dataExcel = []

            for(let i = 0; i < userConference.length; i++){

                let arraySessionUsers = []

                for(let y = 0; y < userAddedInConferece.length ;y++){
    
                    for(let x = 0; x < userAddedInConferece[y].dataValues.usersAddedToThisAgenda.length ; x++){
                        if(userAddedInConferece[y].dataValues.usersAddedToThisAgenda[x] === userConference[i].dataValues.id){
                            arraySessionUsers.push(userAddedInConferece[y])
                        }
                    }
                }

                if(arraySessionUsers.length !== 0){
                    dataExcel.push({
                        firstName: userConference[i].dataValues.firstName,
                        lastName: userConference[i].dataValues.lastName,
                        email: userConference[i].dataValues.email,
                        panel: arraySessionUsers
                    })  
                }else{
                    dataExcel.push({
                        firstName: userConference[i].dataValues.firstName,
                        lastName: userConference[i].dataValues.lastName,
                        email: userConference[i].dataValues.email,
                        panel: undefined
                    }) 
                }
            }

            const nombre = moment().format("MM-DD-HH-mm-s")

            await convertJSONToExcelRegisterConference2023(
                nombre,
                formatExcelPanels,
                dataExcel
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
    }

    const getAllPanelsOfOneUser = async (req, res) => {

        const {id, type} = req.query

        let userSpeakers

        try {

            if(type === "mySessions"){

                userSpeakers = await SpeakersPanel.findAll({
                    order: [["startDate", "DESC"]],
                    where: {
                        usersAddedToThisAgenda: {[Op.overlap]: [`${id}`]},
                        visible: true, status: 'active'
                    },
                    include: [
                        {
                            model: SpeakerMemberPanel,
                            include: [
                                {
                                    model: User,
                                    attributes: [
                                        "id",
                                        "firstName",
                                        "lastName",
                                        "titleProfessions",
                                        "img",
                                        "abbrName",
                                        "email"
                                    ],
                                }
                            ]
                        }
                    ],
                })
            }
            if(type === "speakers"){
                userSpeakers = await SpeakerMemberPanel.findAll({
                    where: {
                        UserId: id
                    },
                    include: [
                        {
                            model: SpeakersPanel,
                            include: [
                                {
                                    model: SpeakerMemberPanel,
                                    include: [
                                        {
                                            model: User,
                                            attributes: [
                                                "id",
                                                "firstName",
                                                "lastName",
                                                "titleProfessions",
                                                "img",
                                                "abbrName",
                                                "email"
                                            ],
                                        }
                                    ]
                                }
                            ]
                        }
                    ],
                });
            }
      
            return res.status(HttpCodes.OK).json({ userSpeakers });
          } catch (error) {
            console.log(error);
            return res
              .status(HttpCodes.INTERNAL_SERVER_ERROR)
              .json({ msg: "Internal server error" });
          }
    }

    const getAllMyPanels = async (req, res) => {

        const { id } = req.user.dataValues;

        try {

            const userSpeakers = await SpeakerMemberPanel.findAll({
                where: {
                    UserId: id
                },
                include: [
                    {
                        model: SpeakersPanel,
                        where: {
                            type: "Panels"
                        },
                        include: [
                            {
                                model: SpeakerMemberPanel,
                                include: [
                                    {
                                        model: User,
                                        attributes: [
                                            "id",
                                            "firstName",
                                            "lastName",
                                            "titleProfessions",
                                            "img",
                                            "abbrName",
                                            "email"
                                        ],
                                    }
                                ]
                            }
                        ]
                    }
                ],
            });
      
            return res.status(HttpCodes.OK).json({ userSpeakers });
          } catch (error) {
            console.log(error);
            return res
              .status(HttpCodes.INTERNAL_SERVER_ERROR)
              .json({ msg: "Internal server error" });
          }
    }

    const editPanelsSpeaker2023 = async (req, res) => {

        const { panels } = req.body;

        const { role } = req.user.dataValues;

        const { 
            description, 
            endDate, 
            startDate, 
            timeZone, 
            panelName, 
            type, 
            category, 
            objetives, 
            link, 
            recertificactionCredits, 
            metaData, 
            PanelId,
            speakers, 
            speakersModerator,
            numberOfHRCredits,
            descriptionPanel,
            hrCreditsBoolean,
            typeHrCredits
        } = panels

        try {
    
            if (role !== "admin") {
                return res
                    .status(HttpCodes.BAD_REQUEST)
                    .json({ msg: "You must to be admin" });
            }

            const [numberOfAffectedRows, affectedRows] = await SpeakersPanel.update({ 
                metaData,
                recertificactionCredits,
                description, 
                endDate, 
                startDate, 
                timeZone, 
                panelName,
                link,
                objetives,
                category,
                type,
                numberOfHRCredits,
                descriptionPanel,
                hrCreditsBoolean,
                typeHrCredits,
            },{where: {id: PanelId},returning: true,})

            const usersReadyJoin = await SpeakerMemberPanel.findAll({
                where: {SpeakersPanelId: affectedRows[0].dataValues.id},
            })

            usersReadyJoin.forEach(element => {
                element.destroy()
            });

            const speakerRepeat = []

            for(let i = 0; i < speakersModerator.length ;i++){
                const id1 = JSON.parse(speakersModerator[i])

                for(let y = 0; y < speakers.length ; y++){
                    const id2 = JSON.parse(speakers[y])

                    if(id1.userId === id2.userId){
                        speakerRepeat.push(id1)
                    }
                }
            }

            if(speakerRepeat.length !== 0){
                res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: `Users can't repeat on input speakers and moderators.` });
            }

            if(speakers?.length !== 0 && speakers !== undefined){
                await Promise.all(
                    speakers.map(async (data) => {
                        const user = JSON.parse(data)

                        const userReadyJoin = usersReadyJoin.filter((data) => {
                            return data.dataValues.UserId === Number(user.userId) && data.dataValues.SpeakersPanelId === affectedRows[0].dataValues.id
                        })

                        await User.update({ 
                            speakersAuthorization: "accepted"
                        },{where: {id: Number(user.userId)}})
                           

                        await SpeakerMemberPanel.create({
                            UserId: Number(user.userId), 
                            SpeakersPanelId: affectedRows[0].dataValues.id, 
                            isModerator: false, 
                        })

                        if(userReadyJoin.length === 0){

                            await Promise.resolve(
                                (() => {
                                    let mailOptions = {
                                    from: process.env.SEND_IN_BLUE_SMTP_SENDER,
                                    to: user.userEmail,
                                    subject: LabEmails.SPEAKERS_PANEL_JOIN.subject(user.userName, affectedRows[0].dataValues.panelName),
                                    html: LabEmails.SPEAKERS_PANEL_JOIN.body(
                                        user.userName,
                                        affectedRows[0].dataValues,
                                    ),
                                    };
                        
                                    return smtpService().sendMailUsingSendInBlue(mailOptions);
                                })()
                            );
 
                        }
                        
                    })
                );
            }

            if(speakersModerator?.length !== 0 && speakersModerator !== undefined){
                await Promise.all(
                    speakersModerator.map(async (data) => {
                        const user = JSON.parse(data)

                        const userReadyJoin = usersReadyJoin.filter((data) => {
                            return data.dataValues.UserId === Number(user.userId) && data.dataValues.SpeakersPanelId === affectedRows[0].dataValues.id
                        })

                        await User.update({ 
                            speakersAuthorization: "accepted"
                        },{where: {id: Number(user.userId)}})

                        await SpeakerMemberPanel.create({
                            UserId: Number(user.userId), 
                            SpeakersPanelId: affectedRows[0].dataValues.id, 
                            isModerator: true, 
                        })

                        if(userReadyJoin.length === 0){

                            await Promise.resolve(
                                (() => {
                                    let mailOptions = {
                                    from: process.env.SEND_IN_BLUE_SMTP_SENDER,
                                    to: user.userEmail,
                                    subject: LabEmails.SPEAKERS_PANEL_JOIN_FOR_ADMIN_MODERATOR.subject(user.userName,affectedRows[0].dataValues.panelName),
                                    html: LabEmails.SPEAKERS_PANEL_JOIN_FOR_ADMIN_MODERATOR.body(
                                        user.userName,
                                        affectedRows[0].dataValues,
                                    ),
                                };
                        
                                return smtpService().sendMailUsingSendInBlue(mailOptions);

                                })()
                            );
 
                        }
                        
                    })
                );
            }

            return res.status(HttpCodes.OK).json({ numberOfAffectedRows, affectedRows })

        } catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }
    }

    const deletePanelsSpeaker2023 = async (req, res) => {

        const { PanelId } = req.params;

        const { role } = req.user.dataValues;

        try {

            if (role !== "admin") {
                return res
                    .status(HttpCodes.BAD_REQUEST)
                    .json({ msg: "You must to be admin" });
            }

            await SpeakersPanel.update({visible: false},{where: {id: PanelId}})

            return res.status(HttpCodes.OK).json({});

        } catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }
    }

    const addSponsor = async (req, res) => {

        const { sponsor } = req.body;
        
        const { role } = req.user.dataValues;

        const { logo, link, description, title } = sponsor

        try {
    
            if (role !== "admin") {
                return res
                    .status(HttpCodes.BAD_REQUEST)
                    .json({ msg: "You must to be admin" });
            }

            const sponsorCreate = await SponsorsConference2023.create({
                logo,
                link,
                description,
                title,
            })

            return res.status(HttpCodes.OK).json({sponsorCreate})

        } catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }

    }

    const getAllSponsor = async (req, res) => {
        try {

            const sponsor = await SponsorsConference2023.findAll({
                order: [["id", "DESC"]]
            })

            return res.status(HttpCodes.OK).json({ sponsor });

        } catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }
    }

    const getOneSponsor = async (req, res) => {
        const {SponsorId} = req.params
        try {
           
            const sponsor = await SponsorsConference2023.findOne({
              where: {
                  id: SponsorId
              }
            });
      
            return res.status(HttpCodes.OK).json({ sponsor });
          } catch (error) {
            console.log(error);
            return res
              .status(HttpCodes.INTERNAL_SERVER_ERROR)
              .json({ msg: "Internal server error" });
          }
    }

    const editSponsor = async (req, res) => {
        const { sponsor } = req.body;

        const { role } = req.user.dataValues;

        const { logo, link, description, title, id } = sponsor
        try {
    
            if (role !== "admin") {
                return res
                    .status(HttpCodes.BAD_REQUEST)
                    .json({ msg: "You must to be admin" });
            }

            const [numberOfAffectedRows, affectedRows] = await SponsorsConference2023.update({ 
                logo,
                link,
                description,
                title,
            },{where: {id: id}})

            return res.status(HttpCodes.OK).json({ numberOfAffectedRows, affectedRows });

        } catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }
    }

    const deleteSponsor = async (req, res) => {
        const { SponsorId } = req.params;

        const { role } = req.user.dataValues;

        try {
    
            if (role !== "admin") {
                return res
                    .status(HttpCodes.BAD_REQUEST)
                    .json({ msg: "You must to be admin" });
            }

            await SponsorsConference2023.destroy({where: {id: SponsorId}})

            return res.status(HttpCodes.OK).json({});

        } catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }
    }

    const addParraf = async (req, res) => {

        const { parraf } = req.body;
        
        const { role } = req.user.dataValues;

        const { visual, type, text } = parraf

        try {
    
            if (role !== "admin") {
                return res
                    .status(HttpCodes.BAD_REQUEST)
                    .json({ msg: "You must to be admin" });
            }

            const parrafCreate = await ParrafConference2023.create({
                visual, 
                type, 
                text,
            })

            return res.status(HttpCodes.OK).json({parrafCreate})

        } catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }

    }

    const getAllParraf = async (req, res) => {

        const {type} = req.params

        try {

            let parraf

            if(type === undefined){
                parraf = await ParrafConference2023.findAll({
                    order: [["id", "DESC"]]
                })
            }else{
                parraf = await ParrafConference2023.findAll({
                    order: [["id", "DESC"]],
                    where: {type: type}
                })
            }

            return res.status(HttpCodes.OK).json({ parraf });

        } catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }
    }

    const getOneParraf = async (req, res) => {
        const {ParrafId} = req.params
        try {
           
            const parraf = await ParrafConference2023.findOne({
              where: {
                  id: ParrafId
              }
            });
      
            return res.status(HttpCodes.OK).json({ parraf });
          } catch (error) {
            console.log(error);
            return res
              .status(HttpCodes.INTERNAL_SERVER_ERROR)
              .json({ msg: "Internal server error" });
          }
    }

    const editParraf = async (req, res) => {
        const { parraf } = req.body;

        const { role } = req.user.dataValues;

        const { visual, type, text, id } = parraf
        try {
    
            if (role !== "admin") {
                return res
                    .status(HttpCodes.BAD_REQUEST)
                    .json({ msg: "You must to be admin" });
            }

            const [numberOfAffectedRows, affectedRows] = await ParrafConference2023.update({ 
                visual,
                type, 
                text,
            },{where: {id: id}})

            return res.status(HttpCodes.OK).json({ numberOfAffectedRows, affectedRows })

        } catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }
    }

    const deleteParraf = async (req, res) => {
        const { ParrafId } = req.params;

        const { role } = req.user.dataValues;

        try {
    
            if (role !== "admin") {
                return res
                    .status(HttpCodes.BAD_REQUEST)
                    .json({ msg: "You must to be admin" });
            }

            await ParrafConference2023.destroy({where: {id: ParrafId}})

            return res.status(HttpCodes.OK).json({})

        } catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }
    }

    const addToMyPersonalAgenda = async (req, res) => {
        const { data } = req.body;

        const { id } = req.user.dataValues

        let { PanelId, type, startTime, endTime, panelType } = data

        let newArray = [];

        try {

            const lastArrayOfThisColumn = await SpeakersPanel.findOne({where: {id: PanelId, visible: true, status: 'active'}, attributes:["usersAddedToThisAgenda"]})

            if(startTime !== undefined && panelType !== 'Panels'){

                const sessionCompareTime = await SpeakersPanel.findAll({where: 
                    {
                        [Op.or]: [
                            {
                                startDate: {
                                    [Op.lte]: startTime
                                },
                                endDate: {
                                    [Op.gte]: startTime,
                                }, 
                            }, 
                            {
                                startDate: {
                                    [Op.lte]: endTime
                                },
                                endDate: {
                                    [Op.gte]: endTime,
                                }, 
                            },
                            
                        ],
                        usersAddedToThisAgenda: {[Op.overlap]: [`${id}`]},
                        type: {[Op.ne] : 'Panels'},
                        visible: true, status: 'active'
                    }
                })

                if(sessionCompareTime.length !== 0){
                    return res
                        .status(HttpCodes.BAD_REQUEST)
                        .json({ msg: "You already registered for a session on this same date and same time, You can't register for two sessions on the same date and same time."});
                }
            }

            if(type === "Remove"){
                
                newArray = await lastArrayOfThisColumn.dataValues.usersAddedToThisAgenda

                await Promise.all(
                    lastArrayOfThisColumn.dataValues.usersAddedToThisAgenda.map((idArray,index) => {
                        if(Number(idArray) === Number(id)){
                            newArray.splice(index,1)
                            return
                        }
                    })  
                );

                const [numberOfAffectedRows, affectedRows] = await SpeakersPanel.update({ 
                    usersAddedToThisAgenda: newArray
                },{where: {id: PanelId, visible: true, status: 'active'}})

                return res.status(HttpCodes.OK).json({ numberOfAffectedRows, affectedRows })
            }

            if(type === "Added"){

                await lastArrayOfThisColumn.dataValues.usersAddedToThisAgenda.push(id)
                newArray = lastArrayOfThisColumn.dataValues.usersAddedToThisAgenda

                const [numberOfAffectedRows, affectedRows] = await SpeakersPanel.update({ 
                    usersAddedToThisAgenda: newArray
                },{where: {id: PanelId, visible: true, status: 'active'}})

                return res.status(HttpCodes.OK).json({ numberOfAffectedRows, affectedRows })
            }

        } catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }
    }

    const addNewSpeakersAdmin = async (req, res) => {
        const {userIds} = req.body

        try {

            await Promise.all(
                userIds.map(async (id) => {
                    await User.update(
                        {
                            speakersAuthorization: "accepted",
                        },
                        {
                            where: { id: id },
                        }
                    );
                })
            )

            return res.status(HttpCodes.OK).json()

        } catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }
    }

    const editAuthorizationSpeakers = async (req, res) => {
        const {data} = req.body

        try {

            const [numberOfAffectedRows, affectedRows] = await User.update(
                {
                    speakersAuthorization: data.type,
                },
                {
                    where: { id: data.userData.id },
                }
            );

            if(data.type === "accepted"){
                await Promise.resolve(
                    (() => {
                      let mailOptions = {
                        from: process.env.SEND_IN_BLUE_SMTP_SENDER,
                        to: data.userData.email,
                        //to: "enrique@hackinghr.io",
                        subject: LabEmails.USER_ACCEPTED_SPEAKER.subject(data.userData.firstName),
                        html: LabEmails.USER_ACCEPTED_SPEAKER.body(
                            data.userData,
                          `${process.env.DOMAIN_URL}speakers2023`
                        ),
                      };
          
                      return smtpService().sendMailUsingSendInBlue(mailOptions);
                    })()
                );
            }

            return res.status(HttpCodes.OK).json({ numberOfAffectedRows, affectedRows })

        } catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }
    }

    const downloadICS = async (req, res) => {
        const { id } = req.params;
        const { userTimezone } = req.query;
    
        try {
          const panel = await SpeakersPanel.findOne({
            where: { id: id, visible: true, status: 'active' },
          });
    
          if (!panel) {
            console.log(error);
            return res
              .status(HttpCodes.INTERNAL_SERVER_ERROR)
              .json({ msg: "Internal server error" });
          }
    
          let startTime = convertToLocalTime(
            panel.dataValues.startDate,
            panel.dataValues.timeZone,
            userTimezone
          );
          let endTime = convertToLocalTime(
            panel.dataValues.endDate,
            panel.dataValues.timeZone,
            userTimezone
          );
    
          const calendarInvite = smtpService().generateCalendarInvite(
            startTime,
            endTime,
            panel.panelName,
            panel.description,
            "https://www.hackinghrlab.io/global-conference",
            // event.location,
            `${process.env.DOMAIN_URL}${panel.id}`,
            "hacking Lab HR",
            process.env.FEEDBACK_EMAIL_CONFIG_SENDER,
            userTimezone
          );
    
          let icsContent = calendarInvite.toString();
          icsContent = icsContent.replace(
            "BEGIN:VEVENT",
            `METHOD:REQUEST\r\nBEGIN:VEVENT`
          );
    
          res.setHeader("Content-Type", "application/ics; charset=UTF-8;");
          res.setHeader(
            "Content-Disposition",
            `attachment; filename=${encodeURIComponent(panel.panelName)}.ics`
          );
          res.setHeader("Content-Length", icsContent.length);
          return res.end(icsContent);
        } catch (error) {
          console.log(error);
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }
    };

    const changueStatus = async (req, res) => {

        const { status,PanelId } = req.body;

        const { role } = req.user.dataValues;

        try {
    
            if (role !== "admin") {
                return res
                    .status(HttpCodes.BAD_REQUEST)
                    .json({ msg: "You must to be admin" });
            }

            const [numberOfAffectedRows, affectedRows] = await SpeakersPanel.update({ 
                status
            },{where: {id: PanelId},returning: true,})

            return res.status(HttpCodes.OK).json({ numberOfAffectedRows, affectedRows })

        } catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }
    }

    const addDraftEmail = async (req, res) => {

        const { draftEmail } = req.body;
    
        const { 
            // idChannel, 
            name, to, subject, message, id } = draftEmail
    
        try {
    
          let draftEmailResponse = undefined
    
          if(id === -1){
    
            draftEmailResponse = await EmailDraftChannel.create({
              idChannel: 1,
              name,
              to,
              subject,
              message,
              draft: true,
              type: 'conference',
            })
    
          }else{
    
            const [numberOfAffectedRows, affectedRows] = await EmailDraftChannel.update({ 
              idChannel: 1,
              name,
              to, 
              subject,
              message,
              draft: true,
              type: 'conference',
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

    // const { id } = req.params;

        try {

            const draftEmailResponse = await EmailDraftChannel.findAll({
                order: [["id", "DESC"]],
                where: {idChannel: 1, draft: true, type: 'conference',}
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
    try {

        const sendEmailResponse = await EmailDraftChannel.findAll({
            order: [["id", "DESC"]],
            where: {send: true, type: 'conference'}
        })

        return res.status(HttpCodes.OK).json({ sendEmailResponse });

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
                type: 'conference',
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

    const emailAttendee = async (req, res) => {
    const {
        name,
        to,
        subject,
        message,
        test,
        testEmail,
        idChannel,
        id,
    } = req.body

    const userEmail = await User.findAll({
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

    if(test){

        await Promise.resolve(
        (() => {
            return sendInBlueService().sendNewsLetter(
                LabEmails.ATTENDEE_EVENT.body(message),
                LabEmails.ATTENDEE_EVENT.subject(subject),
                name,
                testEmail,
                true,
                'conference'
            );
        })()
        ); 

        return res
        .status(HttpCodes.OK)
        .json();
    }else{

        if(id === -1){

        await EmailDraftChannel.create({
            idChannel,
            name,
            to,
            subject,
            message,
            draft: false,
            send: true,
            type: 'conference',
            date: moment
            .utc(moment().format("YYYY-MM-DD HH:mm"))
            .format()
        })
    
        }else{

        await EmailDraftChannel.update({ 
            name,
            to, 
            subject,
            message,
            draft: false,
            send: true,
            type: 'conference',
            date: moment
            .utc(moment().format("YYYY-MM-DD HH:mm"))
            .format()
        },{where: {id: id}})

        }

        await Promise.resolve(
        (() => {
            return sendInBlueService().sendNewsLetter(
                LabEmails.ATTENDEE_EVENT.body(message),
                LabEmails.ATTENDEE_EVENT.subject(subject),
                name,
                userEmail,
                false,
                'conference'
            );
        })()
        );

        return res
        .status(HttpCodes.OK)
        .json();
    
    }
        

    };

    const searchUserConference = async (req, res) => {
        // const { id } = req.params;
    
        try {
    
          const allUserConference = await User.findAll({where: {registerConference2023: true}})
    
          return res.status(HttpCodes.OK).json({ allUserConference });
    
        } catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }
      }

      const setStatusUserConference = async (req, res) => {
        const data = req.body;
        const { id } = req.user;
    
        try {
    
            const challengeUsers = await SpeakerPanelStatus.findOne({where:{
                idUser: Number(id),
                idSession: Number(data.idSession)
            }});

            if(!challengeUsers){
                await SpeakerPanelStatus.create({
                    idUser: Number(id),
                    ...data
                });
            }else{

                await SpeakerPanelStatus.update({
                    viewed: data.viewed,
                    saveForLater: data.saveForLater
                },{where:{
                    idUser: Number(id),
                    idSession: Number(data.idSession)
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

    const getStatusUserConference = async (req, res) => {
        const { id } = req.user;
    
        try {
    
            const SpeakerPanelStatuss = await SpeakerPanelStatus.findAll({where:{
                idUser: Number(id),
            }});
    
            return res.status(HttpCodes.OK).send({SpeakerPanelStatuss});
            
          } catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
          }
    }

    return {
        setStatusUserConference,
        getStatusUserConference,
        addNewPanelSpeaker,
        addNewSpeakersAdmin,
        addToMyPersonalAgenda,
        allPanelSpeakers,
        editAuthorizationSpeakers,
        addUserSpeakerToPanel,
        removeUserSpeakerToPanel,
        registerUserIfNotAreRegisterConference2023,
        excelAllUserRegisterConference2023,
        excelAllPanelsRegisterConference2023,
        getAllUserSpeaker,
        getAllPanelsOfOneUser,
        panelForId,
        editPanelsSpeaker2023,
        deletePanelsSpeaker2023,
        addSponsor,
        getAllSponsor,
        getOneSponsor,
        editSponsor,
        deleteSponsor,
        addParraf,
        getAllParraf,
        getOneParraf,
        editParraf,
        deleteParraf,
        downloadICS,
        excelAllsersSpeakersAndPanels,
        allMemberSpeakerToPanel,
        getAllMyPanels,
        changueStatus,
        addDraftEmail,
        getAllDraftEmail,
        getAllSendEmail,
        editDraftEmail,
        deleteDraftEmail,
        emailAttendee,
        searchUserConference
    }
}

module.exports = SpeakersController;
