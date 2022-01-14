const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const { getNewVote, createNewVote } = require("../controller/newVoteController");
const { getSelectedVote, voteOption, deleteVote } = require("../controller/selectedVoteController");
const { validateNewVote, validateParamsIsObjectId } = require("../middleware/validate");

router.get("/new", auth, getNewVote);
router.post("/new", auth, validateNewVote, createNewVote);

router.get("/success", auth, (req, res, next) => {
  res.render("voteCreateSuccess");
});

router.get("/:id", validateParamsIsObjectId, getSelectedVote);
router.post("/:id", auth, validateParamsIsObjectId, voteOption);
router.delete("/:id", auth, validateParamsIsObjectId, deleteVote);

module.exports = router;
