import Joi from "joi";


export const updatePermissionsSchema =  Joi.object({
  userId: Joi.string().hex().length(24).required(),
  moduleId: Joi.string().hex().length(24).required(),
  permissions: Joi.object({
    create: Joi.boolean().required(),
    read: Joi.boolean().required(), // Allow viewing data
    update: Joi.boolean().required(), // Allow modifying data
    delete: Joi.boolean().required(), // Allow removing data
  }).required(),
  submodules: Joi.object().required(),
});
