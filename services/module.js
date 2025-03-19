import Module from "../models/Module.js";
import Permission from "../models/Permission.js";
import User from "../models/User.js";

/**
 * Get modules with permissions for a specific user
 * @param {string} userId - The user ID
 * @returns {Promise<object[]>} - List of modules with permissions
 */
export const getModulesWithPermissionsService = async (userId) => {
  // Fetch user and verify existence
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Fetch permissions assigned to the user
  const userPermissions = await Permission.find({ userId }).lean();

  // Fetch all modules
  const modules = await Module.find({}).lean();

  // Map permissions to modules and submodules
  return modules.map((module) => {
    const modulePermission = userPermissions.find(
      (perm) => perm.moduleId.toString() === module._id.toString()
    );

    return {
      _id: module._id,
      name: module.name,
      permissions: modulePermission
        ? modulePermission.permissions
        : { read: false, write: false, delete: false }, // Default: no permissions
      expanded: false,
      submodules: module.submodules.map((sub) => ({
        name: sub.name,
        permissions: modulePermission?.submodules?.[sub.name] || {
          read: false,
          write: false,
          delete: false,
        }, // Get submodule permissions if available
      })),
    };
  });
};

/**
 * Update user permissions for modules and submodules
 * @param {string} userId - The user ID
 * @param {Array} modules - List of modules with permissions
 * @returns {Promise<object[]>} - Updated permissions response
 */
export const updatePermissionsService = async (userId, modules) => {
  let updatedModules = []; // Store updated module details

  for (const module of modules) {
    const { moduleId, permissions, submodules } = module;

    let permission = await Permission.findOne({ userId, moduleId });

    if (!permission) {
      permission = new Permission({
        userId,
        moduleId,
        permissions: { read: false, write: false, delete: false }, // Default permissions
        submodules: {}, // Initialize submodules
      });
    }

    if (!permission.submodules) {
      permission.submodules = {};
    }

    // Update parent module permissions
    permission.permissions = permissions;

    // Update submodules' permissions
    if (submodules && Array.isArray(submodules)) {
      for (const sub of submodules) {
        permission.submodules[sub.name] = sub.permissions;
      }
    }

    await permission.save();
    updatedModules.push({
      moduleId,
      updatedPermissions: permission.permissions,
      updatedSubmodules: permission.submodules,
    });
  }

  return updatedModules;
};
