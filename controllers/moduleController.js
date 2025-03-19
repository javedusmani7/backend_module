import {  updatePermissionsSchema } from "../validation/moduleValidation.js";
import { getModulesWithPermissionsService, updatePermissionsService } from "../services/module.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { statusCode } from "../config/config.js";

/**
 * Controller to fetch modules with permissions
 */
export const getModulesWithPermissions = asyncHandler(async (req, res) => {
  const userId = req.user._id; // Get user ID from authentication middleware

  if (!userId) {
    throw new ApiError(statusCode.USER_ERROR, "User ID is required");
  }
 

  const result = await getModulesWithPermissionsService(userId);
  res.status(result.statusCode).json(result);
});

/**
 * Controller to update permissions
 */
export const updatePermissions = asyncHandler(async (req, res) => {
  const { error } = updatePermissionsSchema.validate(req.body);
  if (error) {
    throw new ApiError(statusCode.USER_ERROR, error.details[0].message, error.details);
  }

  const { userId, modules } = req.body;
  const updatedModules = await updatePermissionsService(userId, modules);

  res.json({
    message: "Permissions updated successfully",
    updatedModules,
  });
});

