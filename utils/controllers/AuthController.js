const db = require("../models");
const HttpCodes = require("http-codes");
const UserRoles = require("../enum").USER_ROLE;
const bcryptService = require("../services/bcrypt.service");
const authService = require("../services/auth.service");
const reCaptchaService = require("../services/recaptcha.service");
const smtpService = require("../services/smtp.service");
const profileUtils = require("../utils/profile");
const { LabEmails } = require("../enum");

const User = db.User;

const AuthController = () => {
  const sendEmailAfterRegister = async (user) => {
    const mailOptions = {
      from: process.env.SEND_IN_BLUE_SMTP_SENDER,
      to: user.email,
      subject: LabEmails.NEW_USER_SIGNUP.subject(),
      html: LabEmails.NEW_USER_SIGNUP.body(user),
    };

    await smtpService().sendMailUsingSendInBlue(mailOptions);
  };

  const login = async (req, res) => {
    const { email, password } = req.body;

    if (email && password) {
      try {
        const user = await User.findOne({
          where: {
            email: email.toLowerCase(),
          },
        });

        if (!user) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "You are not registered." });
        }

        if (bcryptService().comparePassword(password, user.password)) {
          const token = authService().issue({
            id: user.id,
            exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
          });

          return res.status(HttpCodes.OK).json({ token, user });
        }

        return res
          .status(HttpCodes.UNAUTHORIZED)
          .json({ msg: "Password is wrong." });
      } catch (err) {
        console.log(err);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    }

    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: Email or password is wrong" });
  };

  const register = async (req, res) => {
    const { body } = req;

    if (body.password === body.password2) {
      try {
        const recaptChaVerify = await reCaptchaService().verify(body.recaptcha);
        if (!recaptChaVerify) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "ReCAPTCHA verification failed. Please try again." });
        }

        let userInfo = {
          email: body.email.toLowerCase(),
          password: bcryptService().password(body.password),
          firstName: body.firstName,
          lastName: body.lastName,
          location: body.location,
          recentJobLevel: body.recentJobLevel,
          recentWorkArea: body.recentWorkArea,
          sizeOfOrganization: body.sizeOfOrganization,
          role: UserRoles.USER,
          titleProfessions: body.titleProfessions,
          company: body.company,
          languages: body.languages,
          city: body.city,
        };

        userInfo.percentOfCompletion =
          profileUtils.getProfileCompletion(userInfo);
        userInfo.completed = userInfo.percentOfCompletion === 100;
        userInfo.abbrName = `${(userInfo.firstName || "")
          .slice(0, 1)
          .toUpperCase()}${(userInfo.lastName || "")
          .slice(0, 1)
          .toUpperCase()}`;

        // check if the email is already used.
        const existedUser = await User.findOne({
          where: {
            email: userInfo.email.toLowerCase(),
          },
        });

        if (existedUser) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "This email was used by someone" });
        } else {
          const user = await User.create(userInfo);

          if (!user) {
            return res
              .status(HttpCodes.INTERNAL_SERVER_ERROR)
              .json({ msg: "Internal server error" });
          }

          sendEmailAfterRegister(user);

          const token = authService().issue({
            id: user.id,
            exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
          });

          return res.status(HttpCodes.OK).json({ token, user });
        }
      } catch (err) {
        console.log(err);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error", error: err });
      }
    }
    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: Passwords don't match" });
  };
  /**
   * Send link to password recovery via email
   * @param {*} req
   * @param {*} res
   */
  const sendMailPasswordRecovery = async (req, res) => {
    const { email } = req.body;
    const minutes = process.env.PASSWORD_RECOVERY_TOKEN_EXP_TIME_MINUTES;
    try {
      if (email) {
        let user = await User.findOne({
          where: {
            email: email.toLowerCase(),
          },
        });
        if (!user) {
          return res
            .status(HttpCodes.BAD_REQUEST)
            .json({ msg: "Email doesn't match with any user." })
            .send();
        }
        const token = authService().issue({
          exp: Math.floor(Date.now() / 1000) + minutes * 60,
          email: email.toLowerCase(),
        });

        const mailOptions = {
          from: process.env.FEEDBACK_EMAIL_CONFIG_SENDER,
          to: email,
          subject: "Forgotten password reset",
          html: `
                  Somebody (hopefully you) requested a new password account for ${email}. 
                  No changes have been made to your account yet.
                  <br/>
                  You can reset your password by clicking the link bellow:
                  <br/>
                  <a href="${process.env.RECOVERY_PASSWORD_PREFIX_URL}${token}" target="_blank">Reset password</a>
                  <br/>
                  If you did not request a new password, please let us know immediately.
                  <br/>
                  Yours,
                  <br/>
                  Hacking HR Team.
                  `,
        };

        const sentResult = await smtpService().sendMailUsingSendInBlue(
          mailOptions
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
      } else {
        return res
          .status(HttpCodes.BAD_REQUEST)
          .json({ msg: "Bad Request: Email is empty!" })
          .send();
      }
    } catch (err) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error", error: err })
        .send();
    }
  };
  /**
   * Verify token to allow reset password
   * @param {*} req
   * @param {*} res
   */
  const verifyResetPasswordToken = async (req, res) => {
    const { token } = req.body;
    try {
      if (!token) {
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error", error: err })
          .send();
      }
      const response = authService().verify(token);
      return res.status(HttpCodes.OK).json({ response }).send();
    } catch (err) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error", error: err })
        .send();
    }
  };
  /**
   * Set new password after verify token
   * @param {*} req
   * @param {*} res
   */
  const resetPassword = async (req, res) => {
    const { token, password } = req.body;
    try {
      if (!password || !token) {
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error", error: err })
          .send();
      }
      const infoToken = authService().verify(token);
      await User.update(
        {
          password: bcryptService().password(password),
        },
        {
          where: {
            email: infoToken.email.toLowerCase(),
          },
        }
      );
      return res.status(HttpCodes.OK).send();
    } catch (err) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error", error: err })
        .send();
    }
  };

  return {
    login,
    register,
    sendMailPasswordRecovery,
    verifyResetPasswordToken,
    resetPassword,
  };
};

module.exports = AuthController;
