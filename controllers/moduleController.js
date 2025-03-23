
import { createModuleSchema, createRoleSchema, deleteModuleSchema, updateModuleSchema, updateRoleSchema } from "../validation/moduleValidation.js";
import { createModuleService, createRoleService, deleteModuleService, deleteRoleService, getModulesService, getRolesService, updateModuleService, updateRoleService } from "../services/module.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { statusCode } from "../config/config.js";


export const createModule = asyncHandler(async (req, res) => {
  const { error } = createModuleSchema.validate(req.body);
  if (error) {
    throw new apiError(statusCode.USER_ERROR, error.details[0].message, error.details);
  }
  const result = await createModuleService(req.body);
  res.status(result.statusCode).json(result);
});

export const deleteModule = asyncHandler(async (req, res) => {
  const { error } = deleteModuleSchema.validate(req.body);
  if (error) {
    throw new apiError(statusCode.USER_ERROR, error.details[0].message, error.details);
  }
  const result = await deleteModuleService(req.body);
  res.status(result.statusCode).json(result);
});

export const updateModule = asyncHandler(async (req, res) => {
  const { error } = updateModuleSchema.validate(req.body);
  if (error) {
    throw new apiError(statusCode.USER_ERROR, error.details[0].message, error.details);
  }
  const result = await updateModuleService(req.body);
  res.status(result.statusCode).json(result);
});

export const getModules = asyncHandler(async (req, res) => {
  const result = await getModulesService();
  res.status(result.statusCode).json(result);
});

export const createRole = asyncHandler(async (req, res) => {
  const { error } = createRoleSchema.validate(req.body);
  if (error) {
    throw new apiError(statusCode.USER_ERROR, error.details[0].message, error.details);
  }
  const result = await createRoleService(req.body);
  res.status(result.statusCode).json(result);
});

export const deleteRole = asyncHandler(async (req, res) => {
  const { _id } = req.body; // Extract _id from the request body

  const result = await deleteRoleService(_id);
  res.status(result.statusCode).json(result);
});


export const getRoles = asyncHandler(async (req, res) => {
  const result = await getRolesService();
  res.status(result.statusCode).json(result);
});

export const updateRole = asyncHandler(async (req, res) => {
  const { error } = updateRoleSchema.validate(req.body);
  if (error) {
    throw new apiError(statusCode.USER_ERROR, error.details[0].message, error.details);
  }
  const result = await updateRoleService(req.body);
  res.status(result.statusCode).json(result);
})