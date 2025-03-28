import Module from "../models/Module.js";
import { statusCode } from "../config/config.js";
import { ApiResponse } from "../utils/apiResponse.js";
import Permission from "../models/Permission.js";
import Role from "../models/Role.js";
import logger from "../logger.js";
import fs from "fs";
import path from "path";
import Level from "../models/Level.js";
import { apiError } from "../utils/apiError.js";


// Module Services
export const createModuleService = async (req) => {
  logger.info(`Creating module with data: ${JSON.stringify(req)}`);
  const module = await new Module(req).save();
  logger.info(`Module created successfully: ${module._id}`);
  return new ApiResponse(statusCode.CREATED, module, "Module created successfully");
};

export const deleteModuleService = async ({ moduleId }) => {
  logger.info(`Deleting module with ID: ${moduleId}`);
  const module = await Module.findByIdAndDelete(moduleId);
  logger.info(`Module deleted: ${moduleId}`);
  return new ApiResponse(statusCode.OK, module, "Module deleted successfully");
};

export const updateModuleService = async ({ moduleId, moduleData }) => {
  logger.info(`Updating module ID: ${moduleId}`);
  const module = await Module.findByIdAndUpdate(moduleId, moduleData, { new: true });
  logger.info(`Module updated: ${moduleId}`);
  return new ApiResponse(statusCode.OK, module, "Module updated successfully");
};

export const getModulesService = async () => {
  logger.info("Fetching all modules");
  const modules = await Module.find({});
  logger.info(`Fetched ${modules.length} modules`);
  return new ApiResponse(statusCode.OK, modules, "Modules fetched successfully");
};

// Role Services

export const createRoleService = async (req) => {
  const { roleName, permissions, levelId } = req.body;
  const roleID = req.user.role;
  const userRoleData = await Role.findById(roleID);
  const parentLevel = [...userRoleData.parentLevel, userRoleData.levelId];
  const createdBy = req.user._id;  
  const searchRoleName = roleName.toUpperCase().trim();
  logger.info(`Creating role: ${searchRoleName}`);

  const existingRole = await Role.findOne({ roleName: searchRoleName });
  if (existingRole) {
    logger.warn(`Role already exists: ${searchRoleName}`);
    throw new apiError(statusCode.ALREADY_EXISTS, "Role already exists", existingRole);
  }

  const formattedPermissions = await Promise.all(
    permissions.map(async ({ moduleId, permission }) => {
      const permissionData = await new Permission(permission).save();
      return { moduleId, permission: permissionData._id };
    })
  );

  const newRole = new Role({
    roleName:searchRoleName,
    permissions: formattedPermissions,
    levelId,
    parentLevel,
    createdBy
  });

  const savedRole = await newRole.save();
  logger.info(`Role created successfully: ${searchRoleName}`);

  return new ApiResponse(statusCode.CREATED, savedRole, "Role created successfully");
};

//Test
export const createRoleServiceTest = async (req) => {
  const { roleName, permissions, levelId } = req.body; 
  const searchRoleName = roleName.toUpperCase().trim();
  logger.info(`Creating role: ${searchRoleName}`);

  const existingRole = await Role.findOne({ roleName: searchRoleName });
  if (existingRole) {
    logger.warn(`Role already exists: ${searchRoleName}`);
    throw new apiError(statusCode.ALREADY_EXISTS, "Role already exists", existingRole);
  }

  const formattedPermissions = await Promise.all(
    permissions.map(async ({ moduleId, permission }) => {
      const permissionData = await new Permission(permission).save();
      return { moduleId, permission: permissionData._id };
    })
  );

  const newRole = new Role({
    roleName:searchRoleName,
    permissions: formattedPermissions,
    levelId,
  });

  const savedRole = await newRole.save();
  logger.info(`Role created successfully: ${searchRoleName}`);

  return new ApiResponse(statusCode.CREATED, savedRole, "Role created successfully");
};

export const getRolesService = async (req) => {
  const { role } = req.user;
  const userRoleData = await Role.findById(role).populate("levelId");
  console.log("Role data", userRoleData.levelId.levelId);
  const levelData = await Level.find({ levelId: { $gt: userRoleData.levelId.levelId } }).select("_id");
  const levelIds = levelData.map((level) => level._id);  
  logger.info("Fetching all roles");
  const roles = await Role.find({ levelId: { $in: levelIds } })
  .populate("permissions.moduleId")
  .populate("permissions.permission")
  .populate("levelId");  
  logger.info(`Fetched ${roles.length} roles`);
  return new ApiResponse(statusCode.OK, roles, "Roles fetched successfully");
};


export const updateRoleService = async (req) => {
  const {_id, roleId, roleName, permissions, levelId } = req;

  const existingRole = await Role.findById(_id);
  if (!existingRole) {
    logger.warn(`Role not found: ${_id}`);
    throw new apiError(statusCode.NOT_FOUND, "Role not found");
  }

  const formattedPermissions = await Promise.all(
    permissions.map(async ({ moduleId, permission }) => {
      let permissionData = permission._id
        ? await Permission.findByIdAndUpdate(permission._id, permission, { new: true })
        : await new Permission(permission).save();
      return { moduleId, permission: permissionData._id };
    })
  );

  existingRole.roleId = roleId;
  existingRole.roleName = roleName;
  existingRole.permissions = formattedPermissions;
  existingRole.levelId = levelId;

  const updatedRole = await existingRole.save();
  
  logger.info(`Role updated successfully: ${_id}`);
  return new ApiResponse(statusCode.OK, updatedRole, "Role updated successfully");
};

export const deleteRoleService = async (roleId) => {
  logger.info(`Deleting role ID: ${roleId}`);
  const role = await Role.findById(roleId);
  if (!role) {
    logger.warn(`Role not found: ${roleId}`);
    throw new apiError(statusCode.NOT_FOUND, "Role not found");
  }

  if (role.defaultRole) {
    logger.warn(`Attempt to delete a default role: ${roleId}`);
    throw new apiError(statusCode.LACK_PERMISSION, "Cannot delete default roles");
  }

  const deletedPermissions = await Promise.all(
    role.permissions.map(async (perm) => {
      return await Permission.findByIdAndDelete(perm.permission);
    })
  );

  await Role.findByIdAndDelete(roleId);
  logger.info(`Role deleted: ${roleId}`);

  return new ApiResponse(
    statusCode.OK,
    { roleId: role.roleId, roleName: role.roleName, deletedPermissions },
    `Role '${role.roleName}' (ID: ${role.roleId}) and associated permissions deleted successfully`
  );
};

export const updatePermissionService = async ({ _id, permission }) => {
  logger.info(`Updating permissions for role ID: ${_id}`);

  const existingRole = await Role.findById(_id);
  if (!existingRole) {
    logger.warn(`Role not found: ${_id}`);
    throw new ApiResponse(statusCode.NOT_FOUND, null, "Role not found");
  }

  const formattedPermissions = await Promise.all(
    permission.map(async ({ moduleId, permission }) => {
      let permissionData = permission._id
        ? await Permission.findByIdAndUpdate(permission._id, permission, { new: true })
        : await new Permission(permission).save();
      return { moduleId, permission: permissionData._id };
    })
  );

  existingRole.permissions = formattedPermissions;
  const updatedRole = await existingRole.save();

  logger.info(`Permissions updated for role ID: ${_id}`);
  return new ApiResponse(statusCode.OK, updatedRole, "Role permission updated successfully");
};

export const getRoleByIdService = async (roleId) => {
  logger.info(`Fetching role by ID: ${roleId}`);
  const roles = await Role.findById(roleId)
  .populate("permissions.moduleId")
  .populate("permissions.permission")
  .populate("levelId"); 
  logger.info(`Role fetched: ${roleId}`);
  return new ApiResponse(statusCode.OK, roles, "Role fetched successfully");
};


// Blog Services
const blogFilePath = path.join(process.cwd(), "data/blogs.json");
export const getBlogServices = async () => {
  logger.info("Fetching blog");
  const blog = fs.readFileSync(blogFilePath, "utf8");
  logger.info("Fetched blog");
  return new ApiResponse(statusCode.OK, JSON.parse(blog), "Blog fetched successfully");
};

// News Services
const newsFilePath = path.join(process.cwd(), "data/news.json");
export const getNewsServices = async () => {
  logger.info("Fetching news");
  const news = fs.readFileSync(newsFilePath, "utf8");
  logger.info("Fetched news");
  return new ApiResponse(statusCode.OK, JSON.parse(news), "News fetched successfully");
};