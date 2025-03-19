
import Module from "../models/Module";

import Permission from "../models/Permission";

import User from "../models/User";
// const { io } = require("../server");

exports.getModulesWithPermissions = async (req, res) => {
  try {
    const userId = "67da67deada923bfd99387ed"; // Get user ID from authentication middleware

    // Fetch user role
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // console.log("User Role:", user.role);
    // Fetch permissions based on role with the latest data
    const rolePermissions = await Permission.find({ role: "admin" }).lean();

    // Fetch all modules
    const modules = await Module.find({}).lean();

    // Map permissions to modules and submodules
    const result = modules.map((module) => {
      const modulePermission = rolePermissions.find(
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
    console.log("Fetched Permissions:", rolePermissions);
    res.json(result);
  } catch (error) {
    console.error("Error fetching modules:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.updatePermissions = async (req, res) => {
  try {
    const { role, modules } = req.body;

    if (!modules || !Array.isArray(modules) || modules.length === 0) {
      return res.status(400).json({ message: "Modules array is required" });
    }

    let updatedModules = []; // ⬅ Collect updated module details

    for (const module of modules) {
      const { moduleId, permissions, submodules } = module;

      let permission = await Permission.findOne({ role, moduleId });

      if (!permission) {
        permission = new Permission({
          role,
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

    // if (io) {
    //   io.emit("refreshPermissions", { role });
    // } else {
    //   console.error("Socket.io instance is undefined");
    // }

    res.json({
      message: "Permissions updated successfully",
      updatedModules, // ⬅ Send updated permissions in response
    });
  } catch (error) {
    console.error("Error updating permissions:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message, // ⬅ Include error details for debugging
    });
  }
};
