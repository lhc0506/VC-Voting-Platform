const express = require("express");
const router = express.Router();
const User = require("../model/User");
const { auth } = require("../middleware/auth")
const { format } = require("date-fns");
const { ADD_TIME_DIFF } = require("../src/constants");

router.get("/", auth, async (req, res, next) => {
  try {
    const userEmail = req.app.locals.userEmail;
    const userId = req.app.locals.userId;

    const userDb = await User.findById(userId).populate("createdVotes").lean();
    const myVotes = userDb.createdVotes;

    res.render("myVote", {
      myVotes,
      format,
      ADD_TIME_DIFF,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
