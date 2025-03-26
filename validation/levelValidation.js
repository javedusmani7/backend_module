import Joi from "joi";

export const createLevelSchema = Joi.object({
    levelId: Joi.number()
      .valid(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
      .required(),
    status: Joi.string().optional(), 
  });

  export const deleteLevelSchema = Joi.object({
      _id: Joi.string().hex().length(24).required(),
  })