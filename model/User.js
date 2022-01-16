const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcryptjs");
const saltRounds = 10;
const { isEmail } = require("validator");

const UserSchema = mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    validate: {
      validator: isEmail,
      message: "invalid Email",
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 1,
  },
  createdVotes: [{
    type: Schema.Types.ObjectId,
    ref: "Vote",
  }],
});

UserSchema.pre("save", function (next) {
  const user = this;

  if (user.isModified("password")) {
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return next(err);
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

module.exports = mongoose.model("User", UserSchema);
