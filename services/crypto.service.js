const crypto = require("crypto-js");

const cryptoKey = process.env.CRYPTO_KEY || "HackingHR";

const cryptoService = () => {
  const encrypt = (message) => {
    return crypto.AES.encrypt(message, cryptoKey).toString();
  };

  const decrypt = (message) => {
    return crypto.AES.decrypt(message, cryptoKey).toString(crypto.enc.Utf8);
  };

  return {
    encrypt,
    decrypt,
  };
};

module.exports = cryptoService;
