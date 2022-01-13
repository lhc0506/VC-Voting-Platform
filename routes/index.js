const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const User = require("../model/User");
const Vote = require("../model/Vote");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const { auth } = require("../middleware/auth");
const { format } = require("date-fns");
const { ADD_TIME_DIFF } = require("../src/constants");

/* GET home page. */
router.get("/", async (req, res, next) => {
  const isLoggedIn = req.cookies.user && Boolean(jwt.verify(req.cookies.user, process.env.JWT_SECRET_KEY).email);
  const votes = await Vote.find({}).lean();

  res.render("index", {
    isLoggedIn,
    votes,
    format,
    ADD_TIME_DIFF,
  });
});

router.get("/signup", (req, res, next) => {
  res.render("signup", {
    message: null,
  });
});

router.post("/signup",
  // body("email").isEmail(),
  // body("password").isLength({ min: 8 }),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      let errorMessage = null;

      if (!errors.isEmpty()) {
        switch (errors.errors[0].param) {
          case "email":
            errorMessage = "이메일 형식을 확인해주세요."
            break;
          case "password":
            errorMessage = "비밀번호는 8자리 이상이어야 합니다."
            break;
        }
        return res.render("signup", {
          message: errorMessage,
        });
      }

      const { email, password, verifyingPassword } = req.body;

      if (password !== verifyingPassword) {
        return res.render("signup", {
          message: "패스워드가 일치하지 않습니다."
        });
      }

      await User.create({
        email,
        password,
      });

      res.redirect("/login");

    } catch (error) {
      next(error);
    }
  }
);

router.get("/login", (req, res, next) => {
  const preUrl = req.flash("preUrl");
  res.render("login", {
    message: null,
    preUrl
  });
});

router.post("/login", async (req, res, next) => {
  const { email, password, preUrl } = req.body;
  try {
    const user = await User.findOne({ email: email }).lean();
    const validPassword = user ? await bcrypt.compare(password, user.password) : null;

    if (!user || !validPassword) {
      return res.render("login", {
        message: "이메일이나 비밀번호가 올바르지 않습니다.",
        preUrl
      });
    }

    const newToken = jwt.sign({
      email
    }, process.env.JWT_SECRET_KEY, {
      // expiresIn: '1h'
    });

    res.cookie("user", newToken);

    preUrl ? res.redirect(preUrl) : res.redirect("/");

  } catch (error) {
    next(error);
  }
});

router.get("/logout", (req, res, next) => {
  res.clearCookie("user");
  res.redirect("/");
});

module.exports = router;
