const expressLoader = require("./express");
const mongooseLoader = require("./mongoose");

const loader = async (app) => {
  // const mongoConnection = await mongooseLoader();
  console.log('MongoDB Initialized');
  await expressLoader(app);
  console.log('Express Initialized');
};

module.exports = loader;
