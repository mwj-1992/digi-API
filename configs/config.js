require('dotenv').config();
/**
 * Configuration file. app port, DB connection, etc.
 * @module configs/config
 */
module.exports = {
  port: process.env.PORT || 3000,
  corsWhitelist: process.env.CORS_WHITELIST || '',
  dbSettings: {
    db: process.env.DB_NAME,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOSTNAME || '127.0.0.1:27017',
  },
};
