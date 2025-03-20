import Module from "../models/Module.js";
import Permission from "../models/Permission.js";
import User from "../models/User.js";
import { apiError } from "../utils/apiError.js";
import { statusCode } from "../config/config.js";
import { ApiResponse } from "../utils/apiResponse.js";

/**
 * Fetch modules with permissions assigned to the user
 */
export const getModulesWithPermissionsService = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    console.log(statusCode.NOT_FOUND);
    
    throw new apiError(statusCode.NOT_FOUND, null, "User not found");
  }

  const userPermissions = await Permission.find({ userId }).lean();
  const modules = await Module.find({}).lean();

  const result = modules.map((module) => {
    const modulePermission = userPermissions.find(
      (perm) => perm.moduleId.toString() === module._id.toString()
    );

    return {
      _id: module._id,
      name: module.name,
      permissions: modulePermission
        ? modulePermission.permissions
        : { read: false, write: false, delete: false }, // Default permissions
      expanded: false,
      submodules: module.submodules.map((sub) => ({
        name: sub.name,
        permissions: modulePermission?.submodules?.[sub.name] || {
          read: false,
          write: false,
          delete: false,
        }, // Default submodule permissions
      })),
    };
  });
  return new ApiResponse(statusCode.OK, result, "Modules with permissions fetched successfully");
};

/**
 * Update permissions for a user
 */
// export const updatePermissionsService = async (userId, modules) => {
//   if (!modules || !Array.isArray(modules) || modules.length === 0) {
//     throw new apiError(statusCode.USER_ERROR, "Modules array is required");
//   }

//   let updatedModules = [];

//   for (const module of modules) {
//     const { moduleId, permissions, submodules } = module;

//     let permission = await Permission.findOne({ userId, moduleId });

//     if (!permission) {
//       permission = new Permission({
//         userId,
//         moduleId,
//         permissions: { create: false, read: false, update: false, delete: false },
//         submodules: {},
//       });
//     }

//     permission.permissions = permissions;

//     if (submodules && Array.isArray(submodules)) {
//       for (const sub of submodules) {
//         permission.submodules[sub.name] = sub.permissions;
//       }
//     }

//     await permission.save();
//     updatedModules.push({
//       moduleId,
//       updatedPermissions: permission.permissions,
//       updatedSubmodules: permission.submodules,
//     });
//   }

//   return updatedModules;
// };

export const updatePermissionsService = async (req) => {
  const data = req.body;

  const updatedPermission = await Permission.findOneAndUpdate(
    { userId: data.userId }, // Query to find the record
    {
      $set: {
        userId: data.userId,
        permissions: data.permissions,
        submodules: data.submodules,
      },
    },
    {
      new: true, 
      upsert: true,
    }
  );

  return new ApiResponse(statusCode.OK, updatedPermission, "Permissions updated successfully");
}