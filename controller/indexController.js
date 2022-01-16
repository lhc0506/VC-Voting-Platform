const jwt = require("jsonwebtoken");
const Vote = require("../model/Vote");
const { format } = require("date-fns");
const { ADD_TIME_DIFF } = require("../src/constants");

exports.getAll = async (req, res, next) => {
  try {
    const isLoggedIn = req.cookies.user && Boolean(jwt.verify(req.cookies.user, process.env.JWT_SECRET_KEY).email);
    const votes = await Vote.find({}).populate("createdBy").lean();

    res.render("index", {
      isLoggedIn,
      votes,
      format,
      ADD_TIME_DIFF,
    });
  } catch (error) {
    next(error);
  }
};
