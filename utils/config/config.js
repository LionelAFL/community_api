const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  development: {
    username: process.env.USER_DB,
    password: process.env.PASSWORD_DB,
    database: process.env.NAME_DB,
    host: process.env.HOST_DB,
    port: 5432,
    dialect: "postgres",
    operatorsAliases: false,
  },
  test: {
    username: process.env.USER_DB,
    password: process.env.PASSWORD_DB,
    database: process.env.NAME_DB,
    host: process.env.HOST_DB,
    port: 5432,
    dialect: "postgres",
    operatorsAliases: false,
  },
  production: {
    username: process.env.USER_DB,
    password: process.env.PASSWORD_DB,
    database: process.env.NAME_DB,
    host: process.env.HOST_DB,
    port: 5432,
    dialect: "postgres",
    operatorsAliases: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
      keepAlive: true,
    },
    ssl: true,
    extra: {
      ssl: true,
    },
  },
};