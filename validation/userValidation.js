import Joi from 'joi';

export const userRegistrationSchema = Joi.object({
  name: Joi.string().trim().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

export const userLoginSchema = Joi.object({
  email: Joi.string().trim().min(3).max(30).required(),
  password: Joi.string().required(),
});

export const deleteUserSchema = Joi.object({
  _id: Joi.string().trim().required()
});

export const updateRoleSchema = Joi.object({
  userId: Joi.string().hex().length(24).required(),
  roleId: Joi.string().hex().length(24).required(),
});

