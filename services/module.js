import Module from "../models/Module.js";
import { statusCode } from "../config/config.js";
import { ApiResponse } from "../utils/apiResponse.js";
import Permission from "../models/Permission.js";
import Role from "../models/Role.js";


export const createModuleService = async (req) => {
  const moduleData = req;
  const module = await new Module(moduleData).save();
  return new ApiResponse(statusCode.CREATED, module, "Module created successfully");
}

export const deleteModuleService = async (req) => {
  let { moduleId } = req;
  const module = await Module.findByIdAndDelete(moduleId);
  return new ApiResponse(statusCode.OK, module, "Module deleted successfully");
};

export const updateModuleService = async (req) => {
  const { moduleId, moduleData } = req;
  const module = await Module.findByIdAndUpdate(moduleId, moduleData, { new: true });
  return new ApiResponse(statusCode.OK, module, "Module updated successfully");
};

export const getModulesService = async () => {
  const modules = await Module.find({});
  return new ApiResponse(statusCode.OK, modules, "Modules fetched successfully");
};

export const createRoleService = async (req) => {
  const { roleId, roleName, permissions } = req;
 
  const formattedPermissions = await Promise.all(
    permissions.map(async (element) => {
      const permissionData = await new Permission(element.permission).save();
      return {
        moduleId: element.moduleId,
        permission: permissionData._id,
      };
    })
  );

  const newRole = new Role({
    roleId,
    roleName,
    permissions: formattedPermissions,
  });

  const savedRole = await newRole.save();
  return new ApiResponse(statusCode.CREATED, savedRole, "Role created successfully");
};

export const getRolesService = async () => {
  const roles = await Role.find({}).populate("permission.moduleId").populate("permission.permissions");
  return new ApiResponse(statusCode.OK, roles, "Roles fetched successfully");
};

