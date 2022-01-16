const User = require("../model/User");
const Vote = require("../model/Vote");
const { add } = require("date-fns");
const { ADD_TIME_DIFF } = require("../src/constants");

exports.getNewVote = (req, res, next) => {
  res.render("newVote", {
    message: req.flash("message"),
  });
};

exports.createNewVote = async (req, res, next) => {
  try {
    const userEmail = req.app.locals.userEmail;
    const userId = req.app.locals.userId;
    const user = await User.findById(userId).exec();

    const { title } = req.body;
    let { expiredDate } = req.body;
    expiredDate = add(new Date(expiredDate), { hours: ADD_TIME_DIFF });
    const options = req.body["option[]"];
    const optionsInSchema = options.map((option) => { return { option } });

    const newVote = await Vote.create({
      createdBy: userId,
      title,
      expiredDate,
      options: optionsInSchema,
    });

    user.createdVotes.push(newVote["_id"]);
    user.save();

    res.redirect("/votings/success");
  } catch (error) {
    next(error);
  }
};
