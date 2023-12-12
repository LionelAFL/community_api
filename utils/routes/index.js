const privateRoutes = require("./privateRoutes");
const publicRoutes = require("./publicRoutes");
const adminRoutes = require("./adminRoutes");

const config = {
  privateRoutes,
  publicRoutes,
  adminRoutes,
};

module.exports = config;
