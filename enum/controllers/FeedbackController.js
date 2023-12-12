const db = require("../models");
const HttpCodes = require("http-codes");
const smtpService = require("../services/smtp.service");

const User = db.User;

const FeedbackController = () => {
  const sendMail = async (req, res) => {
    const { message } = req.body;
    const { id: userId } = req.token;
    const { email, firstName } = req.user.dataValues;

    if (message && userId) {
      try {
        let user = await User.findOne({
          where: {
            id: userId,
          },
        });
        usre = user.toJSON();
        const mailOptions = {
          from: process.env.SEND_IN_BLUE_SMTP_SENDER,
          to: process.env.FEEDBACK_EMAIL_CONFIG_RECEIVER,
          subject: process.env.FEEDBACK_EMAIL_CONFIG_SUBJECT,
          html: `
            <strong>User</strong>: ${user.firstName} ${user.lastName}<br>
            <strong>e-Mail</strong>: ${user.email}<br>
            <strong>Feedback message</strong>:<br>
            ${message}
          `,
        };

        const mailOptions2 = {
          from: process.env.SEND_IN_BLUE_SMTP_SENDER,
          to: email,
          subject: 'Thank you for your inquiry in the Hacking HR LAB',
          html: `
            <p>Hi ${firstName},</p>
            <p>We have received your inquiry and will get back to you within the next 24 business hours.</p>
            <p>Thank you!</p>
            <p>Hacking HR Team</p>
          `,
        };
        const sentResult = await smtpService().sendMailUsingSendInBlue(
          mailOptions
        );

        await smtpService().sendMailUsingSendInBlue(
          mailOptions2
        );

        if (sentResult) {
          return res
            .status(HttpCodes.OK)
            .json({ msg: "The mail has been sent successfully." })
            .send();
        } else {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }
      } catch (err) {
        console.log(err);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    }

    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: message or userId are empty" });
  };

  return {
    sendMail,
  };
};

module.exports = FeedbackController;
