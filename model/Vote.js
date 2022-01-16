const mongoose = require("mongoose");
const { Schema } = mongoose;
const { isEmail } = require("validator");

const ContentsSchema = mongoose.Schema({
  option: {
    type: String,
    required: true,
  },
  checkedBy: [{
    type: Schema.Types.ObjectId,
    ref: "User",
  }],
});

const VoteSchema = mongoose.Schema({
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
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
