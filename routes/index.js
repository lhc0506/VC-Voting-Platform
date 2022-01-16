const express = require("express");
const router = express.Router();

const { getAll } = require("../controller/indexController");
const { showSignup, createUser } = require("../controller/signupController");
const{ showLogin, login } = require("../controller/loginController");
const{ validateSignup, validateLogin } = require("../middleware/validate");

router.get("/", getAll);

router.get("/signup", showSignup);
router.post("/signup", validateSignup, createUser);

router.get("/login", showLogin);
router.post("/login", validateLogin, login);

router.get("/logout", (req, res, next) => {
  res.clearCookie("user");
  res.redirect("/");
});

module.exports = router;
