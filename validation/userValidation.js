import Joi from 'joi';
export const userRegistrationSchema = Joi.object({
  name: Joi.string().trim().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  role: Joi.number().valid(1, 2, 3).required()
});

export const userLoginSchema = Joi.object({
  username: Joi.string().trim().min(3).max(30).required(),
  password: Joi.string().min(8).required(),
});

