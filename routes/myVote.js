const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth")
const User = require("../model/User");
router.get("/", auth, async (req, res, next) => {
  res.render("myVote");
});

module.exports = router;
