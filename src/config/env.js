const path = require("path");
require("dotenv").config();

const env = {
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || "change-me-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "8h",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
};

module.exports = env;
