const mongoose = require("mongoose");
const { isEmail } = require("validator");

const ContentsSchema = mongoose.Schema({
  option: {
    type: String,
    required: true,
  },
  checkedBy: [{
    type: String,
    ref: "User",
  }],
});

const VoteSchema = mongoose.Schema({
  createdBy: {
    type: String,
    required: true,
    validate: {
      validator: isEmail,
      message: "invalid Email",
    }
  },
  title: {
    type: String,
    required: true,
  },
  expiredDate: {
    type: Date,
    required: true,
  },
  options: [ContentsSchema],

});

module.exports = mongoose.model("Vote", VoteSchema);
