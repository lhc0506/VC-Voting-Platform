const jwt = require("jsonwebtoken");
const User = require("../model/User");
const Vote = require("../model/Vote");
const { format, add } = require("date-fns");
const { ADD_TIME_DIFF } = require("../src/constants");


exports.getNewVote = (req, res, next) => {
  res.render("newVote", {
    message: req.flash("message"),
  });
};

exports.createNewVote = async (req, res, next) => {
  try {
    const userEmail = req.app.locals.userEmail ;
    const user = await User.findOne({ email: userEmail }).exec();

    let { title, expiredDate } = req.body;
    expiredDate = add(new Date(expiredDate), { hours: ADD_TIME_DIFF });
    const options = req.body["option[]"];
    const optionsInSchema = options.map((option) => { return { "option": option } });

    const newVote = await Vote.create({
      createdBy: userEmail,
      title,
      expiredDate,
      options : optionsInSchema,
    });

    user.createdVotes.push(newVote["_id"]);
    user.save();

    res.redirect("/votings/success");
  } catch (error) {
    next(error);
  }
};

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
      const { option, checkedBy } = optionObject;
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
    const userId = req.app.locals.userId;
    const selectedVoteId = req.params.id;
    const selectedVote = await Vote.findById(selectedVoteId);

    selectedVote.options[Number(req.body["option[]"])].checkedBy.push(userEmail);
    await selectedVote.save();

    return res.redirect("/");
  } catch (error) {
    next(error);
  }
};
