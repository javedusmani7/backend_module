import {  updatePermissionsSchema } from "../validation/moduleValidation.js";
import { getModulesWithPermissionsService, updatePermissionsService } from "../services/module.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { statusCode } from "../config/config.js";
import { canModifyRole } from "../utils/roleUtils.js";
import User from "../models/User.js";

/**
 * Controller to fetch modules with permissions
 */
export const getModulesWithPermissions = asyncHandler(async (req, res) => {
  const userId = req.user._id; // Get user ID from authentication middleware

  if (!userId) {
    throw new apiError(statusCode.USER_ERROR, "User ID is required");
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
    throw new apiError(statusCode.USER_ERROR, error.details[0].message, error.details);
  }

  const { userId, modules } = req.body;

  // Fetch the logged-in user's role
  const requestingUser = await User.findById(req.user.id).select("roleId");
  if (!requestingUser) {
    throw new apiError(statusCode.UNAUTHORIZED, "Unauthorized user");
  }

  // Fetch the target user's role
  const targetUser = await User.findById(userId).select("roleId");
  if (!targetUser) {
    throw new apiError(statusCode.USER_ERROR, "Target user not found");
  }

  // Role-based authorization check
  if (!canModifyRole(requestingUser.roleId, targetUser.roleId)) {
    throw new apiError(statusCode.UNAUTHORIZED, "You do not have permission to modify this user's roles");
  }

  // Proceed with updating permissions
  const updatedModules = await updatePermissionsService(userId, modules);

  res.json({
    message: "Permissions updated successfully",
    updatedModules,
  });
});


