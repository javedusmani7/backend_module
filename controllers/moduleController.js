import Module from "../models/Module.js";
import Permission from "../models/Permission.js";
import User from "../models/User.js";
import { getModulesWithPermissionsSchema } from "../validation/moduleValidation.js";

export const getModulesWithPermissions = async (req, res) => {
  try {

    // const { error } = getModulesWithPermissionsSchema.validate(req.params);
    // if (error) {
    //   return res.status(400).json({ message: error.details[0].message });
    // }
    // const userId = req.user.id; // Get user ID from authentication middleware
    const userId = "67da67deada923bfd99387ed"; // For testing

    // Fetch user and verify existence
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch permissions assigned to the user
    const userPermissions = await Permission.find({ userId }).lean();

    // Fetch all modules
    const modules = await Module.find({}).lean();

    // Map permissions to modules and submodules
    const result = modules.map((module) => {
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

    res.json(result);
  } catch (error) {
    console.error("Error fetching modules:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const updatePermissions = async (req, res) => {
  try {
    const { error } = updatePermissionsSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const { userId, modules } = req.body;

    if (!modules || !Array.isArray(modules) || modules.length === 0) {
      return res.status(400).json({ message: "Modules array is required" });
    }

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

    res.json({
      message: "Permissions updated successfully",
      updatedModules,
    });
  } catch (error) {
    console.error("Error updating permissions:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};
