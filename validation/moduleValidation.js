import Joi from "joi";


export const updatePermissionsSchema = Joi.object({
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

export const createModuleSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string(),
  group: Joi.string().valid("Dashboard", "Payment", "User", "Settings").required(),
});

export const deleteModuleSchema = Joi.object({
  moduleId: Joi.string().hex().length(24).required(),
});

export const updateModuleSchema = Joi.object({
  moduleId: Joi.string().hex().length(24).required(),
  moduleData: Joi.object({
    name: Joi.string(),
    description: Joi.string(),
    group: Joi.string().valid("Dashboard", "Payment", "User", "Settings"),
  }).required(),
});

export const createRoleSchema = Joi.object({
  roleId: Joi.number().required(),
  roleName: Joi.string().required(),
  permissions: Joi.array()
    .items(
      Joi.object({
        moduleId: Joi.string().required(),
        permission: Joi.object({
          read: Joi.boolean().required(),
          write: Joi.boolean().required(),
          delete: Joi.boolean().required(),
          update: Joi.boolean().required(),
        }).required(),
      })
    )
    .min(1)
    .required(),
});