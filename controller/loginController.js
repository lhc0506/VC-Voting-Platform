const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.showLogin = (req, res, next) => {
  const preUrl = req.flash("preUrl");

  res.render("login", {
    message: null,
    preUrl,
  });
};

exports.doLogin = async (req, res, next) => {
  const { email, password, preUrl } = req.body;

  try {
    const user = await User.findOne({ email: email }).lean();
    const validPassword = user ? await bcrypt.compare(password, user.password) : null;

    if (!user || !validPassword) {
      return res.render("login", {
        message: "이메일이나 비밀번호가 올바르지 않습니다.",
        preUrl,
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
};
