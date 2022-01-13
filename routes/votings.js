const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../model/User");
const Vote = require("../model/Vote");
const { auth } = require("../middleware/auth");
const { format, add } = require("date-fns");
const { ADD_TIME_DIFF } = require("../src/constants");

router.get("/new", auth, (req, res, next) => {
  res.render("newVote", {
    message: req.flash("message"),
  });
});

router.post("/new",
  body("title").trim().not().isEmpty(),
  body("expiredDate").not().isEmpty().isAfter(),

  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      let errorMessage = null;

      if (!errors.isEmpty()) {
        switch (errors.errors[0].param) {
          case "title":
            errorMessage = "제목을 넣어주세요"
            break;
          case "expiredDate":
            errorMessage = "만료시간은 현재 보다 뒤로 설정해 주세요."
            break;
        }

        req.flash("message", errorMessage);

        return res.redirect("/votings/new");
      }

      const options = req.body["option[]"];

      if (options.length < 2) {
        errorMessage = "선택 사항은 2개 이상이어야 합니다."
        req.flash("message", errorMessage);

        return res.redirect("/votings/new");
      }

      for (let i = 0; i < options.length; i++) {
        if (options[i] === "") {
          errorMessage = "선택 사항을 채워주세요.";
          req.flash("message", errorMessage);

          return res.redirect("/votings/new");
        }
      }

      const optionsInSchema = options.map((option) => { return { "option": option } });
      const userEmail = jwt.verify(req.cookies.user, process.env.JWT_SECRET_KEY).email;
      const user = await User.findOne({ email: userEmail }).exec();
      let { title, expiredDate } = req.body;
      expiredDate = add(new Date(expiredDate), { hours: ADD_TIME_DIFF });
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
  }
);

router.get("/success", auth, (req, res, next) => {
  res.render("voteCreateSuccess");
});

router.get("/:id", async (req, res, next) => {
  try {
    const userEmail = req.cookies.user && jwt.verify(req.cookies.user, process.env.JWT_SECRET_KEY).email;
    const selectedVote = await Vote.findById(req.params.id).lean();
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
    });
  } catch (error) {
    next(error);
  }
});

router.post("/:id", auth, async (req, res, next) => {
  const userEmail = req.app.locals.userEmail;
  const userId = req.app.locals.userId;
  const selectedVoteId = req.params.id;
  console.log(req.body)
  if (req.body.action === "save") {
    // if (!req.body["option[]"]) {
    // }
    const selectedVote = await Vote.findById(selectedVoteId);

    selectedVote.options[Number(req.body["option[]"])].checkedBy.push(userEmail);
    await selectedVote.save();

    return res.redirect("/");
  }

  if (req.body.action === "delete") {
    await Vote.findByIdAndDelete(selectedVoteId).exec();
    const userDb = await User.findById(userId).exec();
    const voteIndex = userDb.createdVotes.indexOf(selectedVoteId);

    userDb.createdVotes.splice(voteIndex, 1);
    userDb.save();
    res.redirect("/");
  }
});

router.delete("/:id", async (req, res, next) => {
  console.log(123123);
});

module.exports = router;
