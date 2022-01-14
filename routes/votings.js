const express = require("express");
const router = express.Router();

const User = require("../model/User");
const Vote = require("../model/Vote");
const { auth } = require("../middleware/auth");
const { format, add } = require("date-fns");
const { ADD_TIME_DIFF } = require("../src/constants");
const { getNewVote, createNewVote, getSelectedVote, voteOption } = require("../controller/newVoteController");
const { validateNewVote, validateParamsIsObjectId } = require("../middleware/validate");

router.get("/new", auth, getNewVote);
router.post("/new", auth, validateNewVote, createNewVote);

router.get("/success", auth, (req, res, next) => {
  res.render("voteCreateSuccess");
});

router.get("/:id", validateParamsIsObjectId, getSelectedVote);
router.post("/:id", auth, validateParamsIsObjectId, voteOption);
router.delete(":id", )
// const userId = req.app.locals.userId;
  // if (req.body.action === "delete") {
  //   await Vote.findByIdAndDelete(selectedVoteId).exec();
  //   const userDb = await User.findById(userId).exec();
  //   const voteIndex = userDb.createdVotes.indexOf(selectedVoteId);

  //   userDb.createdVotes.splice(voteIndex, 1);
  //   userDb.save();
  //   res.redirect("/");
  // }
// }


module.exports = router;
