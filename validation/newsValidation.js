import Joi from "joi";

export const newsSchema = Joi.object({
  title: Joi.string().min(3).max(255).required(),
  content: Joi.string().min(10).required(),
});

export const updateNewsSchema = Joi.object({
  _id: Joi.string().hex().length(24).required(), // MongoDB ObjectId validation
  title: Joi.string().min(3).max(255).optional(),
  content: Joi.string().min(10).optional(),
});

export const deleteNewsSchema = Joi.object({
  _id: Joi.string().hex().length(24).required(), // MongoDB ObjectId validation
});
