const nodemailer = require("nodemailer");
const ical = require("ical-generator");
const { EmailContent } = require("../enum");

const smtpService = () => {
  const sendMailUsingSendInBlue = async (mailOptions) => {
    return await new Promise((resolve, reject) => {
      const transporter = nodemailer.createTransport({
        port: process.env.SEND_IN_BLUE_SMTP_PORT,
        host: process.env.SEND_IN_BLUE_SMTP_HOST,
        secure: process.env.SMTP_SECURE,
        auth: {
          user: process.env.SEND_IN_BLUE_SMTP_USER,
          pass: process.env.SEND_IN_BLUE_SMTP_PASSWORD,
        },
        debug: false,
      });

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log(`********* smtpService Error: ${err}`);
          resolve(false);
        } else {
          console.log(`********** smtpService Response: ${info.response}`);
          resolve(true);
        }
      });
    });
  };

  const sendMail = async (mailOptions) => {
    return await new Promise((resolve, reject) => {
      /**
       * SMTP Transport template
       * {
       *   host: "smtp.example.com",
       *   port: 587,
       *   secure: false, // upgrade later with STARTTLS
       *   auth: {
       *     user: "username",
       *     pass: "password"
       *   }
       * }
       * https://nodemailer.com/smtp/
       */
      const transporter = nodemailer.createTransport({
        port: process.env.SMTP_PORT,
        host: process.env.SMTP_HOST,
        secure: process.env.SMTP_SECURE,
        auth: {
          type: "OAuth2",
          clientId: process.env.FEEDBACK_EMAIL_CONFIG_CLIENTID,
          clientSecret: process.env.FEEDBACK_EMAIL_CONFIG_CLIENT_SECRET,
          user: process.env.FEEDBACK_EMAIL_CONFIG_USER,
          // pass: process.env.FEEDBACK_EMAIL_CONFIG_PASSWORD,
          refreshToken: process.env.FEEDBACK_EMAIL_CONFIG_REFRESH_TOKEN,
          accessToken: process.env.FEEDBACK_EMAIL_CONFIG_ACCESS_TOKEN,
        },
        debug: false,
      });

      /**
       * Message configuration (mailOptions)
       * {
       *   from: "sender@server.com",
       *   to: "receiver@sender.com",
       *   subject: "Message title",
       *   text: "Plaintext version of the message",
       *   html: "<p>HTML version of the message</p>"
       * };
       * https://nodemailer.com/message/
       */

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log(`********* smtpService Error: ${err}`);
          resolve(false);
        } else {
          console.log(`********** smtpService Response: ${info.response}`);
          resolve(true);
        }
      });
    });
  };

  const generateCalendarInvite = (
    startTime,
    endTime,
    summary,
    description,
    location,
    url,
    name,
    email,
    timezone
  ) => {
    const cal = ical({ domain: process.env.DOMAIN_URL, name: "invite" });

    cal.domain(process.env.DOMAIN_URL);

    const eventObject = {
      start: startTime,
      end: endTime,
      summary: summary,
      description: description,
      location: location,
      url: url,
      organizer: {
        name,
        email,
      },
      timezone,
    };

    console.log("**** eventObject ", eventObject);

    cal.createEvent(eventObject);

    return cal;
  };

  const sendMatchEvent = async (source, target, isMentor) => {
    const mailOptions = {
      from: process.env.FEEDBACK_EMAIL_CONFIG_SENDER,
      to: `${source.email}, ${target.email}`,
      subject: `Mentor and Mentee!`,
      html: isMentor
        ? EmailContent.MENTOR_EMAIL(source, target)
        : EmailContent.MENTEE_EMAIL(source, target),
    };

    console.log("**** mailOptions ", mailOptions);

    const sentResult = await smtpService().sendMail(mailOptions);

    return sentResult;
  };

  return {
    sendMail,
    generateCalendarInvite,
    sendMatchEvent,
    sendMailUsingSendInBlue,
  };
};

module.exports = smtpService;
