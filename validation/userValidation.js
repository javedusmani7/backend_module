const Joi = require('joi');

const userRegistrationSchema = Joi.object({
  username: Joi.string().alphanumeric().min(3).max(30).required(),
  password: Joi.string().min(8).required(),
  email: Joi.string().email().required(),
});

const userLoginSchema = Joi.object({
  username: Joi.string().alphanumeric().min(3).max(30).required(),
  password: Joi.string().min(8).required(),
});

module.exports = { userRegistrationSchema, userLoginSchema };
