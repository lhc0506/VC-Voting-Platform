const express = require("express");
const path = require("path");
const app = require("../app")
expressLoader = async () => {
  // view engine setup
  app.set("views", path.join(__dirname, "views"));
  app.set("view engine", "ejs");

}

module.exports = expressLoader;
