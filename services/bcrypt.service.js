const bcrypt = require("bcrypt");

const bcryptService = () => {
  const password = (pw) => {
    const salt = bcrypt.genSaltSync();
    const hash = bcrypt.hashSync(pw, salt);

    return hash;
  };

  const comparePassword = (pw, hash) => bcrypt.compareSync(pw, hash);

  return {
    password,
    comparePassword,
  };
};

module.exports = bcryptService;
