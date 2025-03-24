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
const roles = await Role.find({})
    .populate("permissions.moduleId")
    .populate("permissions.permission");

  return new ApiResponse(statusCode.OK, roles, "Roles fetched successfully");
};

export const updateRoleService = async (req) => {
  const {_id, roleId, roleName, permissions } = req;

  const existingRole = await Role.findById(_id);
  if (!existingRole) {
    throw new ApiResponse(statusCode.NOT_FOUND, null, "Role not found");
  }
  const formattedPermissions = await Promise.all(
    permissions.map(async (element) => {
      let permissionData;
      if (element.permission._id) {
        permissionData = await Permission.findByIdAndUpdate(
          element.permission._id,
          element.permission,
          { new: true }
        );
      } else {
        permissionData = await new Permission(element.permission).save();
      }

      return {
        moduleId: element.moduleId,
        permission: permissionData._id,
      };
    })
  );
  existingRole.roleId = roleId;
  existingRole.roleName = roleName;
  existingRole.permissions = formattedPermissions;

  const updatedRole = await existingRole.save();

  return new ApiResponse(statusCode.OK, updatedRole, "Role updated successfully");
};

export const deleteRoleService = async (roleId) => {
  const role = await Role.findById( roleId );
  if (!role) {
    throw new ApiResponse(statusCode.NOT_FOUND, null, "Role not found");
  }

  const deletedPermissions = await Promise.all(
    role.permissions.map(async (perm) => {
      const deletedPermission = await Permission.findByIdAndDelete(perm.permission);
      return deletedPermission ? { permissionId: deletedPermission._id } : null;
    })
  );
 
  await Role.findByIdAndDelete(roleId );
  
  return new ApiResponse(
    statusCode.OK, 
    { 
      roleId: role.roleId, 
      roleName: role.roleName, 
      deletedPermissions: deletedPermissions.filter(Boolean) // Remove null values
    }, 
    `Role '${role.roleName}' (ID: ${role.roleId}) and associated permissions deleted successfully`
  );
};

export const nupdatePermissionService = async (req) => {
  const { _id, permission} = req;  
  const existingRole = await Role.findById(_id);
  if (!existingRole) {
    throw new ApiResponse(statusCode.NOT_FOUND, null, "Role not found");
  }  
  const formattedPermissions = await Promise.all(
    permission.map(async (element) => {      
      let permissionData;
      if (element.permission._id) {        
        permissionData = await Permission.findByIdAndUpdate(
          element.permission._id,
          element.permission,
          { new: true }
        );
      } else {
        permissionData = await new Permission(element.permission).save();
      }
      return {
        moduleId: element.moduleId,
        permission: permissionData._id,
      };
    })
  );
  existingRole.permissions = formattedPermissions;
  const updatedRole = await existingRole.save();
  return new ApiResponse(statusCode.OK, updatedRole, "Role permission updated successfully");
};