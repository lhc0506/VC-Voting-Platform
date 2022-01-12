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
    message: null,
  });
});

router.post("/new",
  body("title").not().isEmpty().trim(),
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
        return res.render("newVote", {
          message: errorMessage,
        });
      }

      const options = req.body["option[]"];

      if (options.length < 2) {
        errorMessage = "선택 사항은 2개 이상이어야 합니다."

        return res.render("newVote", {
          message: errorMessage,
        });
      }

      for (let i = 0; i < options.length; i++) {
        if (options[i] === "") {
          errorMessage = "선택 사항을 채워주세요.";

          return res.render("newVote", {
            message: errorMessage,
          });
        }
      }
      const optionsInSchema = options.map((option) => { return { "option": option } });
      const userEmail = jwt.verify(req.cookies.user, process.env.SECRET_KEY).email;
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

router.get("/:id", auth, async (req, res, next) => {
  try {
    const userEmail = req.app.locals.userEmail;
    const selectedVote = await Vote.findById(req.params.id).lean();
    const { createdBy, options } = selectedVote;
    const isCreator = userEmail === createdBy;
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
    console.log(222222,options)
    res.render("selectedVote", {
      selectedVote,
      options: options,
      maxVotedOption: options[maxVotedOptionIndex].option,
      isCreator,
      isChecked,
      format,
      ADD_TIME_DIFF,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/:id", auth, async (req, res, next) => {
  const userEmail = req.app.locals.userEmail;
  const userId = req.app.locals.userId;
  const selectedVoteId = req.params.id;

  if (req.body.action === "save") {
    // if (!req.body["option[]"]) {
    // }
    const selectedVote = await Vote.findById(selectedVoteId);

    selectedVote.options[Number(req.body["option[]"])].checkedBy.push(userEmail);
    await selectedVote.save();

    return res.redirect("/");
  }

  if (req.body.action === "delete") {
    Vote.findByIdAndDelete(selectedVoteId);

  }
});

module.exports = router;
