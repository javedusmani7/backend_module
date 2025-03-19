import Joi from "joi";


export const updatePermissionsSchema = Joi.object({
  userId: Joi.string().hex().length(50).required(),
  modules: Joi.array()
    .items(
      Joi.object({
        moduleId: Joi.string().hex().length(24).required(),
        permissions: Joi.object({
          read: Joi.boolean().required(),
          write: Joi.boolean().required(),
          delete: Joi.boolean().required(),
        }).required(),
        submodules: Joi.array().items(
          Joi.object({
            name: Joi.string().required(),
            permissions: Joi.object({
              read: Joi.boolean().required(),
              write: Joi.boolean().required(),
              delete: Joi.boolean().required(),
            }).required(),
          })
        ),
      })
    )
    .min(1)
    .required(),
});
