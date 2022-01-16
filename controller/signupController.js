const User = require("../model/User");

exports.showSignup = (req, res, next) => {
  res.render("signup", {
    message: null,
  });
};

exports.createUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    await User.create({
      email,
      password,
    });

    res.redirect("/login");
  } catch (error) {
    next(error);
  }
};
