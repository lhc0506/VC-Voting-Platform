const jwt = require("jsonwebtoken");
const Vote = require("../model/Vote");
const { format } = require("date-fns");
const { ADD_TIME_DIFF } = require("../src/constants");
const User = require("../model/User");

exports.getSelectedVote = async (req, res, next) => {
  try {
    const userEmail = req.cookies.user && jwt.verify(req.cookies.user, process.env.JWT_SECRET_KEY).email;
    const selectedVoteId = req.params.id;
    const selectedVote = await Vote.findById(selectedVoteId).lean();
    const { createdBy, options } = selectedVote;
    const isCreator = userEmail === createdBy;

    let currentTime = new Date();
    currentTime.setHours(currentTime.getHours()+ADD_TIME_DIFF);
    const isExpired = selectedVote.expiredDate < currentTime;

    let isChecked = false;
    let maxVotedOptionIndex = 0;
    let maxVotedOptionNumber = 0;

    options.forEach((optionObject, index) => {
      const { checkedBy } = optionObject;
      optionObject.checked = false;

      if (maxVotedOptionNumber < checkedBy.length) {
        maxVotedOptionNumber = checkedBy.length;
        maxVotedOptionIndex = index;
      }

      if (checkedBy.includes(userEmail)) {
        optionObject.checked = true;
        isChecked = true;
      }
    });

    res.render("selectedVote", {
      selectedVote,
      maxVotedOption: options[maxVotedOptionIndex].option,
      isExpired,
      isCreator,
      isChecked,
      format,
      ADD_TIME_DIFF,
    });
  } catch (error) {
    next(error);
  }
};

exports.voteOption = async (req, res, next) => {
  try {
    const userEmail = req.app.locals.userEmail;
    const selectedVoteId = req.params.id;
    const selectedVote = await Vote.findById(selectedVoteId);

    selectedVote.options[Number(req.body["option[]"])].checkedBy.push(userEmail);
    await selectedVote.save();

    return res.redirect("/");
  } catch (error) {
    next(error);
  }
};

exports.deleteVote = async (req, res, next) => {
  const userId = req.app.locals.userId;
  const selectedVoteId = req.params.id;
  await Vote.findByIdAndDelete(selectedVoteId).exec();

  const userDb = await User.findById(userId).exec();
  const voteIndex = userDb.createdVotes.indexOf(selectedVoteId);
  userDb.createdVotes.splice(voteIndex, 1);
  await userDb.save();

  res.json({
    "url": req.headers.origin,
  });
};
