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

export const newuserRegistrationSchema = Joi.object({
  name: Joi.string().trim().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),

  // New Optional Fields
  role: Joi.string().length(24).optional(),
  userId: Joi.string().optional(),
  emailVerified: Joi.boolean().optional(),
  ipv4: Joi.string().ip({ version: ['ipv4'], cidr: 'optional' }).optional(),
  ipv4Verified: Joi.boolean().optional(),
  ipv6: Joi.string().ip({ version: ['ipv6'] }).optional(),
  ipv6Verified: Joi.boolean().optional(),
  deviceId: Joi.string().optional(),
  deviceIdVerified: Joi.boolean().optional(),
  mobileNumber: Joi.string().pattern(/^\d{10,15}$/).optional(),
  mobileVerified: Joi.boolean().optional(),
  multiLogin: Joi.boolean().optional(),
});