const db = require("../models");
const moment = require("moment-timezone");

const SibApiV3Sdk = require("sib-api-v3-sdk");
const { formatEmailBlogsPostWeekly } = require("../utils/formatEmails");
let defaultClient = SibApiV3Sdk.ApiClient.instance;

const LastEmailsNewsletterSend = db.LastEmailsNewsletterSend;
const User = db.User;

const sendInBlueService = () => {
  let apiKey = defaultClient.authentications["api-key"];
  apiKey["apiKey"] = process.env.SEND_IN_BLUE_API_KEY;

  const updateWeeklyDigestEmailTemplate = async (jobs, resources) => {
    let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    let smtpTemplate = new SibApiV3Sdk.UpdateSmtpTemplate();

    smtpTemplate.htmlContent = `
      <html>
        <body>
          <h3>Jobs in the Talent Marketplace</h3>
          ${jobs}

          <h3>Creator's Content</h3>
          ${resources}
        </body>
      </html>
    `;

    const templateId = process.env.NODE_ENV === "production" ? 214 : 237;

    try {
      const data = await apiInstance.updateSmtpTemplate(
        templateId,
        smtpTemplate
      );
      console.log(
        "API called successfully. Returned data: " + JSON.stringify(data)
      );
    } catch (error) {
      console.log(error);
    }
  };

  const updateWeeklyBlogPostEmailTemplate = async (blogs, resources) => {
    let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    let apiInstance2 = new SibApiV3Sdk.EmailCampaignsApi();
    let emailCampaigns = new SibApiV3Sdk.CreateEmailCampaign();
    let smtpTemplate = new SibApiV3Sdk.UpdateSmtpTemplate();

    smtpTemplate.htmlContent = formatEmailBlogsPostWeekly(blogs, resources);

    const templateId = process.env.NODE_ENV === "production" ? 313 : 315;

    emailCampaigns = {
      sender: {
        id: 5,
      },
      name: "Hacking HR's CREATORS content: check out the latest blog posts by our community",
      templateId,
      scheduledAt: moment().add(2, "minutes").format(),
      subject:
        "Hacking HR's CREATORS content: check out the latest blog posts by our community",
      // recipients: { listIds: [11] },
      recipients: { listIds: [41] },
    };

    try {
      const data = await apiInstance.updateSmtpTemplate(
        templateId,
        smtpTemplate
      );
      console.log(
        "API called successfully. Returned data: " + JSON.stringify(data)
      );

      const data2 = await apiInstance2.createEmailCampaign(emailCampaigns);

      console.log(
        "API called successfully. Returned data: " + JSON.stringify(data2)
      );
    } catch (error) {
      console.log(error);
    }
  };

  const sendNewsLetter = async (html, subject, name, email, bulTest, type) => {
    let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    let apiInstance2 = new SibApiV3Sdk.EmailCampaignsApi();
    let apiInstance3 = new SibApiV3Sdk.ContactsApi();
    let createList = new SibApiV3Sdk.CreateList();
    let emailCampaigns = new SibApiV3Sdk.UpdateEmailCampaign();
    let smtpTemplate2 = new SibApiV3Sdk.CreateSmtpTemplate();
    let emailTo = new SibApiV3Sdk.SendTestEmail(); 
    let contactEmails = new SibApiV3Sdk.AddContactToList(); 
    let requestContactImport = new SibApiV3Sdk.RequestContactImport();
    let listCreated

    smtpTemplate2.htmlContent = html;
    smtpTemplate2.subject = subject;
    if(bulTest === true){
      // smtpTemplate2.toField = [...email];
    }
    smtpTemplate2.isActive = true;
    smtpTemplate2.sender = {"name":name,"email":'info@hackinghrlab.io'};

    try{

      const existed = await LastEmailsNewsletterSend.findOne({
        where: {
          idReference: 1,
        },
      });

      createList.name = moment().format("MM-DD-HH-mm-s");
      createList.folderId = 87;

      let newList = await apiInstance3.createList(createList)

      listCreated = newList.id

      if (!existed) {
        await LastEmailsNewsletterSend.create({
          idUserlist: listCreated,
          idReference: 1
        })
      }else{

        if(Number(existed.dataValues.idUserlist) !== -1){

          await apiInstance3.deleteList(existed.dataValues.idUserlist)

          await LastEmailsNewsletterSend.update({
            idUserlist: listCreated,
          },{
            where: { idReference: 1 },
          })

        }else{
          await LastEmailsNewsletterSend.update({
            idUserlist: listCreated,
          },{
            where: { idReference: 1 },
          })
        }
      }
  
    }catch (error) {
      console.log(error);
    }

    // let numContact = (type === 'council') ? 73 : (type === 'conference' ? 84 : 81)

    // let numContact2 = (type === 'council') ? 74 : (type === 'conference' ? 85 : 58)

    const templateId = 447;
    const listId = Number(listCreated)
    let arrayEmails = []
    let numAdd = 0
    let arrayDistributionAdd = [[]]
    let informationContacts = 'FIRSTNAME;EMAIL';
    
    try {
      

      await apiInstance.updateSmtpTemplate(templateId, smtpTemplate2)
      // const change1 = await apiInstance.createSmtpTemplate(smtpTemplate2)

      if(bulTest === true){

        emailTo = {
          "emailTo": [...email]
        };
  
        emailCampaigns = {
          templateId: templateId,
          sender: {name: name, email: 'info@hackinghrlab.io'}, name: name,
          subject: subject,
          scheduledAt: moment().add(2, "minutes").format(),
          to: email,
          recipients: { listIds: [listId] },
        };
  
        const data2 = await apiInstance2.createEmailCampaign(emailCampaigns);
  
        console.log(
          "API called successfully. Returned data: " + JSON.stringify(data2)
        );
  
        apiInstance2.sendTestEmail(data2.id, emailTo).then(function() {
          console.log('API called successfully.');
        }, function(error) {
          console.error(error);
        });
      }else{

        const existed = await LastEmailsNewsletterSend.findOne({
          where: {
            idReference: 1,
          },
        });

        await Promise.all(
          email.map(async (data,index) => {

            if(numAdd !== Math.floor(index/130)){
              arrayDistributionAdd[Math.floor(index/130)] = []
              numAdd++
            }

            arrayDistributionAdd[Math.floor(index/130)].push(data.email)

            arrayEmails = [...arrayEmails, data.email]

            informationContacts = `${informationContacts}\n${data.firstName};${data.email}`;
            
          })
        )

        requestContactImport.fileBody = informationContacts;
        requestContactImport.listIds = [listId];

        try {
          await apiInstance3.importContacts(requestContactImport)
        } catch(err) {
          console.log(err.response.body.message)
        }

        if (!existed) {
          await LastEmailsNewsletterSend.create({
            emails: JSON.stringify(arrayEmails),
            idReference: 1
          })
        }else{
          await LastEmailsNewsletterSend.update({
            emails: JSON.stringify(arrayEmails),
          },{
            where: { idReference: 1 },
          })
        }

        arrayDistributionAdd.forEach(async (array) => {
          contactEmails.emails = array
          try {
            await apiInstance3.addContactToList(listId, contactEmails)
          } catch(err) {
            console.log(err.response.body.message)
          }
        })
  
        emailCampaigns = {
          templateId: templateId,
          sender: {name: name, email: 'info@hackinghrlab.io'}, name: name,
          subject: subject,
          scheduledAt: moment().add(2, "minutes").format(),
          recipients: { listIds: [listId] },
        };
  
        const data2 = await apiInstance2.createEmailCampaign(emailCampaigns);
  
        console.log(
          "API called successfully. Returned data: " + JSON.stringify(data2)
        );

      }

    } catch (error) {
      console.log(error);
    }
  }

  const confirmSuscribeUser = async (email) => {
    let apiInstance = new SibApiV3Sdk.ContactsApi();

    let data = await apiInstance.getContactInfo(email)

    return data.emailBlacklisted
  }

  const suscriptionSendingBlue = async (email) => {
    let apiInstance = new SibApiV3Sdk.ContactsApi();

    let updateContact = new SibApiV3Sdk.UpdateContact(); 

    updateContact.emailBlacklisted = false;

    let data = await apiInstance.updateContact(email, updateContact)

    return data
  }

  return {
    updateWeeklyDigestEmailTemplate,
    updateWeeklyBlogPostEmailTemplate,
    sendNewsLetter,
    confirmSuscribeUser,
    suscriptionSendingBlue
  };
};

module.exports = sendInBlueService;
