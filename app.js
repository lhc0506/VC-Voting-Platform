require("dotenv").config();
require("./loaders/mongoose");
const express = require("express");
const path = require("path");
const expressLoader = require("./loaders/express");

const indexRouter = require("./routes/index");
const votingsRouter = require("./routes/votings");
const myVoteRouter = require("./routes/myVote");

const app = express();

expressLoader(app);

app.use(express.static(path.join(__dirname, "public")));
app.use("/", indexRouter);
app.use("/votings", votingsRouter);
app.use("/my-votings", myVoteRouter);

app.use(function(req, res, next) {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
