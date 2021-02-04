/**
 * MongoDB connection
 * @module bootstrap/mongodb
 */
const mongoose = require("mongoose");
const config = require("./config");

/**
 * Generate mongo connection string from DB settings object
 * @function
 * @param {Object} serviceDB - Object with DB settings
 * @returns {String} - Generated connection string
 */

const generateConnectionURI = (serviceDB) => {
  if (serviceDB.user != "" || serviceDB.password != "") {
    return   `mongodb://${serviceDB.user}:${serviceDB.password}@${serviceDB.server}/${serviceDB.db}`;
  }
    return    `mongodb://${serviceDB.server}/${serviceDB.db}`;
  
};
/**
 * DB connection options
 * @constant
 */
const dbConnectionOptions = {
  useFindAndModify: false,
  useNewUrlParser: true,
  useCreateIndex: true,
  auto_reconnect: true,
  reconnectTries: 100,
  reconnectInterval: 1000,
  keepAlive: true,
  connectTimeoutMS: 30000,
  useUnifiedTopology: true,
};

/**
 * Connect to DB with provided URI
 * @function
 * @param {Object} dbSettings - DD Settings
 */
const dbConnect = (dbSettings) => {
  const connection = mongoose.connect(
    generateConnectionURI(dbSettings),
    dbConnectionOptions
  );
  const closeConnection = () => {
    mongoose.connection.close(() => {
      console.log(
        `MongoDB ${dbSettings.server} connection is disconnected due to application termination`
      );
      process.exit(0);
    });
  };
  mongoose.connection.on("error", (err) => {
    console.log(`An error occurs on a connection ${dbSettings.server}`, err);
    // reconnect here
  });
  mongoose.connection.on("reconnected", () => {
    console.log(`MongoDB ${dbSettings.server} is reconnected`);
  });
  mongoose.connection.on("close", () => {
    console.log(`MongoDB ${dbSettings.server} connection closed`);
  });
  mongoose.connection.on("connecting", () => {
    console.log(`Connecting to MongoDB ${dbSettings.server}`);
  });
  mongoose.connection.on("connected", () => {
    console.log(`Connected to MongoDB ${dbSettings.server}`);
  });
  mongoose.connection.on("disconnected", () => {
    console.log(`MongoDB ${dbSettings.server} connection is disconnected`);
  });
  mongoose.connection.on("disconnecting", () => {
    console.log(`MongoDB ${dbSettings.server} connection is disconnecting`);
  });
  // mongoose.set('debug', true);

  // If the Node process ends, close the Mongoose connection
  process.on("SIGINT", closeConnection).on("SIGTERM", closeConnection);
  process.on("uncaughtException", (err) => {
    console.log("Caught exception: ", err);
  });
  return connection;
};

module.exports = () => {
  dbConnect(config.dbSettings);
};
