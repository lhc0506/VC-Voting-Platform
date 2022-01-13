const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");

function expressLoader(expressApp) {
  expressApp.set("views");
  expressApp.set("view engine", "ejs");

  expressApp.use(session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: true,
  }));

  expressApp.use(express.json());
  expressApp.use(express.urlencoded({ extended: false }));
  expressApp.use(cookieParser());
  expressApp.use(flash());
}

module.exports = expressLoader;
