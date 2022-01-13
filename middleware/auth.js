const jwt = require("jsonwebtoken");
const User = require("../model/User");

exports.auth = async function (req, res, next) {
  const verifiedToken = req.cookies.user && jwt.verify(req.cookies.user, process.env.JWT_SECRET_KEY);

  if (verifiedToken) {
    const user = await User.findOne({ email: verifiedToken.email }).lean();
    req.app.locals.userEmail = user.email;
    req.app.locals.userId = user._id;
    next();
  }
  else {
    req.flash("preUrl", req.originalUrl);
    res.redirect("/login");
  }
};
