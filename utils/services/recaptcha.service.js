const request = require("request");

const reCaptchaService = () => {
  const verify = async (recaptcha) => {
    const config = {
      url: process.env.RECAPTCHA_VERIFY_URL,
      secret: process.env.RECAPTCHA_SECRET_KEY,
    };

    const url = `${config.url}?secret=${config.secret}&response=${recaptcha}`;

    try {
      const res = await new Promise((resolve, reject) => {
        request({ url, json: true }, (error, response, body) => {
          resolve(response && response.statusCode === 200);
        });
      });

      return res;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  return {
    verify,
  };
};

module.exports = reCaptchaService;
