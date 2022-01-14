const Joi = require("joi");
const mongoose = require("mongoose");

const userJoiSchema = Joi.object({
  email: Joi.string(),
      // .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } }),
  password: Joi.string()
      // .min(8)
      .max(16),
  verifyingPassword: Joi.ref("password"),
  access_token: [
      Joi.string(),
      Joi.number()
  ],
});

const voteJoiSchema = Joi.object({
  title: Joi.string().trim().required(),
  expiredDate: Joi.date().min("now"),
  options: Joi.array().items(Joi.string().trim().required()).min(2),
});

exports.validateSignup = async (req, res, next) => {
  try {
    const { email, password, verifyingPassword } = req.body;
    await userJoiSchema.validateAsync({ email, password, verifyingPassword });
    next();
  } catch (error) {
    error.status = 400;
    next(error);
  }
};

exports.validateLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    await userJoiSchema.validateAsync({ email, password });
    next();
  } catch (error) {;
    error.status = 400;
    next(error);
  }
};

exports.validateNewVote = async (req, res, next) => {
  try {
    const { title, expiredDate } = req.body;
    const options = req.body["option[]"];
    await voteJoiSchema.validateAsync({ title, expiredDate, options });
    console.log(options)
    next();
  } catch (error) {
    error.status = 400;
    next(error);
  }
};

exports.validateParamsIsObjectId = (req, res, next) => {
  try {
    const paramsId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(paramsId)) {
      const error = new Error("유효하지 않은 voteId입니다.");
      error.status = 400;
      throw error;
    };

    next();
  } catch (error) {
    next(error)
  }
};
