const User = require("../model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.showLogin = (req, res, next) => {
  const preUrl = req.flash("preUrl");

  res.render("login", {
    message: null,
    preUrl,
  });
};

exports.login = async (req, res, next) => {
  const { email, password, preUrl } = req.body;

  try {
    const user = await User.findOne({ email }).lean();
    const validPassword = user ? await bcrypt.compare(password, user.password) : null;

    if (!user) {
      return res.render("login", {
        message: "해당 이메일이 없습니다.",
        preUrl,
      });
    }

    if (!validPassword) {
      return res.render("login", {
        message: "비밀번호가 올바르지 않습니다.",
        preUrl,
      });
    }

    const newToken = jwt.sign({
      email
    }, process.env.JWT_SECRET_KEY);

    res.cookie("user", newToken);

    preUrl ? res.redirect(preUrl) : res.redirect("/");
  } catch (error) {
    next(error);
  }
};
