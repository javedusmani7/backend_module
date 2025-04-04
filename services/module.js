import Module from "../models/Module.js";
import { statusCode } from "../config/config.js";
import { ApiResponse } from "../utils/apiResponse.js";
import Permission from "../models/Permission.js";
import Role from "../models/Role.js";
import logger, { trackQueryTime } from "../logger.js";
import fs from "fs";
import path from "path";
import Level from "../models/Level.js";
import { apiError } from "../utils/apiError.js";
import Blog from "../models/Blog.js";
import News from "../models/News.js";
import { log } from "console";


// Module Services
export const createModuleService = async (req) => {
  logger.info(`Creating module with data: ${JSON.stringify(req)}`);
  const module = await trackQueryTime(
    () => new Module(req).save(),
    "Module.save",
    { data: req }
  );
  logger.info(`Module created successfully: ${module._id}`);
  return new ApiResponse(statusCode.CREATED, module, "Module created successfully");
};

export const deleteModuleService = async ({ moduleId }) => {
  logger.info(`Deleting module with ID: ${moduleId}`);
  const module = await trackQueryTime(
    () => Module.findByIdAndDelete(moduleId),
    "Module.findByIdAndDelete",
    { moduleId }
  );
  logger.info(`Module deleted: ${moduleId}`);
  return new ApiResponse(statusCode.OK, module, "Module deleted successfully");
};

export const updateModuleService = async ({ moduleId, moduleData }) => {
  logger.info(`Updating module ID: ${moduleId}`);
  const module = await trackQueryTime(
    () => Module.findByIdAndUpdate(moduleId, moduleData, { new: true }),
    "Module.findByIdAndUpdate",
    { moduleId }
  );
  logger.info(`Module updated: ${moduleId}`);
  return new ApiResponse(statusCode.OK, module, "Module updated successfully");
};

export const getModulesService = async () => {
  logger.info("Fetching all modules");
  const modules = await trackQueryTime(
    () =>Module.find({}),
    "Module.find"
  );
  logger.info(`Fetched ${modules.length} modules`);
  return new ApiResponse(statusCode.OK, modules, "Modules fetched successfully");
};


/*
//testing
export const getModulesService = async (req) => {
  logger.info("Fetching all modules");

  // 1 min delay function
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const modules = await trackQueryTime(
    async () => {
      await delay(60000); // 1 min (60,000ms) delay
      return Module.find({});
    },
    "Module.find"
  );

  logger.info(`Fetched ${modules.length} modules`);
  return new ApiResponse(statusCode.OK, modules, "Modules fetched successfully");
};

*/

// Role Services

export const createRoleService = async (req) => {
  const { roleName, permissions, levelId } = req.body;
  const roleID = req.user.role;
  
  const userRoleData = await trackQueryTime(
    () => Role.findById(roleID),
    "Role.findById",
    { roleID }
  );
  
  const parentLevel = [...userRoleData.parentLevel, userRoleData.levelId];
  const createdBy = req.user._id;
  const searchRoleName = roleName.toUpperCase().trim();
  logger.info(`Creating role: ${searchRoleName}`);

  const existingRole = await trackQueryTime(
    () => Role.findOne({ roleName: searchRoleName }),
    "Role.findOne",
    { roleName: searchRoleName }
  );
  
  if (existingRole) {
    logger.warn(`Role already exists: ${searchRoleName}`);
    throw new apiError(statusCode.ALREADY_EXISTS, "Role already exists", existingRole);
  }

  const formattedPermissions = await Promise.all(
    permissions.map(async ({ moduleId, permission }) => {
      if (permission.write || permission.delete || permission.update) {
        permission.read = true;
      }
      const permissionData = await trackQueryTime(
        () => new Permission(permission).save(),
        "Permission.save",
        { moduleId }
      );
      return { moduleId, permission: permissionData._id };
    })
  );

  const newRole = new Role({
    roleName: searchRoleName,
    permissions: formattedPermissions,
    levelId,
    parentLevel,
    createdBy
  });

  const savedRole = await trackQueryTime(
    () => newRole.save(),
    "Role.save",
    { roleName: searchRoleName }
  );
  
  logger.info(`Role created successfully: ${searchRoleName}`);

  return new ApiResponse(statusCode.CREATED, savedRole, "Role created successfully");
};


//Test
export const createRoleServiceTest = async (req) => {
  const { roleName, permissions, levelId } = req.body; 
  const searchRoleName = roleName.toUpperCase().trim();
  logger.info(`Creating role: ${searchRoleName}`);

  const existingRole = await trackQueryTime(
    () => Role.findOne({ roleName: searchRoleName }),
    "Role.findOne",
    { roleName: searchRoleName }
  );
  
  if (existingRole) {
    logger.warn(`Role already exists: ${searchRoleName}`);
    throw new apiError(statusCode.ALREADY_EXISTS, "Role already exists", existingRole);
  }

  const formattedPermissions = await Promise.all(
    permissions.map(async ({ moduleId, permission }) => {
      const permissionData = await trackQueryTime(
        () => new Permission(permission).save(),
        "Permission.save",
        { moduleId }
      );
      return { moduleId, permission: permissionData._id };
    })
  );

  const newRole = new Role({
    roleName: searchRoleName,
    permissions: formattedPermissions,
    levelId,
  });

  const savedRole = await trackQueryTime(
    () => newRole.save(),
    "Role.save",
    { roleName: searchRoleName }
  );
  
  logger.info(`Role created successfully: ${searchRoleName}`);

  return new ApiResponse(statusCode.CREATED, savedRole, "Role created successfully");
};

//get roles service
export const getRolesService = async (req) => {
  const { role } = req.user;
  const userRoleData = await trackQueryTime(
    () => Role.findById(role).populate("levelId"),
    "Role.findById",
    { role }
  );
  console.log("Role data", userRoleData.levelId.levelId);
  
  const levelData = await trackQueryTime(
    () => Level.find({ levelId: { $gt: userRoleData.levelId.levelId } }).select("_id"),
    "Level.find",
    { levelId: userRoleData.levelId.levelId }
  );
  
  const levelIds = levelData.map((level) => level._id);
  logger.info("Fetching all roles");
  
  const roles = await trackQueryTime(
    () => Role.find({ levelId: { $in: levelIds } })
      .populate("permissions.moduleId")
      .populate("permissions.permission")
      .populate("levelId"),
    "Role.find",
    { levelIds }
  );
  
  logger.info(`Fetched ${roles.length} roles`);
  return new ApiResponse(statusCode.OK, roles, "Roles fetched successfully");
};

export const updateRoleService = async (req) => {
  const {_id, roleId, roleName, permissions, levelId } = req;

  const existingRole = await trackQueryTime(
    () => Role.findById(_id),
    "Role.findById",
    { _id }
  );
  
  if (!existingRole) {
    logger.warn(`Role not found: ${_id}`);
    throw new apiError(statusCode.NOT_FOUND, "Role not found");
  }

  const formattedPermissions = await Promise.all(
    permissions.map(async ({ moduleId, permission }) => {
      let permissionData = permission._id
        ? await trackQueryTime(
            () => Permission.findByIdAndUpdate(permission._id, permission, { new: true }),
            "Permission.findByIdAndUpdate",
            { permissionId: permission._id }
          )
        : await trackQueryTime(
            () => new Permission(permission).save(),
            "Permission.save",
            { moduleId }
          );
      return { moduleId, permission: permissionData._id };
    })
  );

  existingRole.roleId = roleId;
  existingRole.roleName = roleName;
  existingRole.permissions = formattedPermissions;
  existingRole.levelId = levelId;

  const updatedRole = await trackQueryTime(
    () => existingRole.save(),
    "Role.save",
    { _id }
  );
  
  logger.info(`Role updated successfully: ${_id}`);
  return new ApiResponse(statusCode.OK, updatedRole, "Role updated successfully");
};

export const deleteRoleService = async (roleId) => {
  logger.info(`Deleting role ID: ${roleId}`);
  const role = await trackQueryTime(() => Role.findById(roleId), "Role.findById", { roleId });
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
      return await trackQueryTime(() => Permission.findByIdAndDelete(perm.permission), "Permission.findByIdAndDelete", { permissionId: perm.permission });
    })
  );

  await trackQueryTime(() => Role.findByIdAndDelete(roleId), "Role.findByIdAndDelete", { roleId });
  logger.info(`Role deleted: ${roleId}`);

  return new ApiResponse(
    statusCode.OK,
    { roleId: role.roleId, roleName: role.roleName, deletedPermissions },
    `Role '${role.roleName}' (ID: ${role.roleId}) and associated permissions deleted successfully`
  );
};

export const updatePermissionService = async ({ _id, permission }) => {
  logger.info(`Updating permissions for role ID: ${_id}`);

  const existingRole = await trackQueryTime(() => Role.findById(_id), "Role.findById", { _id });
  if (!existingRole) {
    logger.warn(`Role not found: ${_id}`);
    throw new ApiResponse(statusCode.NOT_FOUND, null, "Role not found");
  }

  const formattedPermissions = await Promise.all(
    permission.map(async ({ moduleId, permission }) => {
      if (permission.write || permission.delete || permission.update) {
        permission.read = true;
      }
      let permissionData = permission._id
        ? await trackQueryTime(() => Permission.findByIdAndUpdate(permission._id, permission, { new: true }), "Permission.findByIdAndUpdate", { permissionId: permission._id })
        : await trackQueryTime(() => new Permission(permission).save(), "Permission.save", { moduleId });
      return { moduleId, permission: permissionData._id };
    })
  );

  existingRole.permissions = formattedPermissions;
  const updatedRole = await trackQueryTime(() => existingRole.save(), "Role.save", { _id });

  logger.info(`Permissions updated for role ID: ${_id}`);
  return new ApiResponse(statusCode.OK, updatedRole, "Role permission updated successfully");
};

export const getRoleByIdService = async (roleId) => {
  logger.info(`Fetching role by ID: ${roleId}`);
  const roles = await trackQueryTime(() => Role.findById(roleId)
    .populate("permissions.moduleId")
    .populate("permissions.permission")
    .populate("levelId"), "Role.findById", { roleId }); 
  logger.info(`Role fetched: ${roleId}`);
  return new ApiResponse(statusCode.OK, roles, "Role fetched successfully");
};


// Blog Services

export const getBlogServices = async () => {
  logger.info("Fetching blogs from database");
  const blogs = await trackQueryTime(() => Blog.find(), "Blog.find");
  logger.info("Fetched blogs from database");
  return new ApiResponse(statusCode.OK, blogs, "Blogs fetched successfully");
};


export const addBlogServices = async (blogData) => {
  try {
    const { title, content } = blogData;

    logger.info("Creating a new blog entry");

    const newBlog = await trackQueryTime(
      () => Blog.create({ title, content }),
      "Blog.create"
    );

    logger.info(`Blog created successfully with ID: ${newBlog._id}`);
    return new ApiResponse(statusCode.CREATED, newBlog, "Blog created successfully");
  } catch (error) {
    logger.error(`Error creating blog: ${error.message}`);
    throw error;
  }
};



//Update Blog Services
export const updateBlogServices = async (blogData) => {
  try {
    const { _id, ...updateFields } = blogData;

    logger.info(`Updating blog with ID: ${_id}`);

    // Use `findByIdAndUpdate` with `$set` to allow partial updates
    const updatedBlog = await Blog.findByIdAndUpdate(
      _id,
      { $set: updateFields }, 
      { new: true, runValidators: true }
    );

    if (!updatedBlog) {
      throw new apiError(statusCode.NOT_FOUND, "Blog not found");
    }

    logger.info(`Blog updated successfully: ${_id}`);
    return new ApiResponse(statusCode.OK, updatedBlog, "Blog updated successfully");
  } catch (error) {
    logger.error(`Error updating blog: ${error.message}`);
    throw error;
  }
};



export const deleteBlogServices = async (blogId) => {
  logger.info(`Deleting blog with ID: ${blogId}`);
  
  const deletedBlog = await trackQueryTime(
    () => Blog.findByIdAndDelete(blogId),
    "Blog.findByIdAndDelete",
    { blogId }
  );

  if (!deletedBlog) {
    logger.warn(`Blog not found: ${blogId}`);
    throw new apiError(statusCode.NOT_FOUND, "Blog not found");
  }

  logger.info(`Blog deleted successfully: ${blogId}`);
  return new ApiResponse(statusCode.OK, deletedBlog, "Blog deleted successfully");
};

// News Services

export const getNewsServices = async () => {
  logger.info("Fetching news from database");
  const news = await trackQueryTime(() => News.find(), "News.find");
  logger.info("Fetched news from database");
  return new ApiResponse(statusCode.OK, news, "News fetched successfully");
};

// Add news
export const addNewsServices = async (newsData) => {
  try {
    const { title, content } = newsData;
    logger.info("Creating a new news entry");

    const newNews = await trackQueryTime(
      () => News.create({ title, content }),
      "News.create"
    );

    logger.info(`News created successfully with ID: ${newNews._id}`);
    return new ApiResponse(statusCode.CREATED, newNews, "News created successfully");
  } catch (error) {
    logger.error(`Error creating news: ${error.message}`);
    throw error;
  }
};

// Update news
export const updateNewsServices = async (newsData) => {
  try {
    const { _id, ...updateFields } = newsData;
    logger.info(`Updating news with ID: ${_id}`);

    const updatedNews = await News.findByIdAndUpdate(
      _id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedNews) {
      throw new apiError(statusCode.NOT_FOUND, "News not found");
    }

    logger.info(`News updated successfully: ${_id}`);
    return new ApiResponse(statusCode.OK, updatedNews, "News updated successfully");
  } catch (error) {
    logger.error(`Error updating news: ${error.message}`);
    throw error;
  }
};

// Delete news
export const deleteNewsServices = async (newsId) => {
  logger.info(`Deleting news with ID: ${newsId}`);

  const deletedNews = await trackQueryTime(
    () => News.findByIdAndDelete(newsId),
    "News.findByIdAndDelete",
    { newsId }
  );

  if (!deletedNews) {
    logger.warn(`News not found: ${newsId}`);
    throw new apiError(statusCode.NOT_FOUND, "News not found");
  }

  logger.info(`News deleted successfully: ${newsId}`);
  return new ApiResponse(statusCode.OK, deletedNews, "News deleted successfully");
};
