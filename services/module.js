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
import User from "../models/User.js";


// Module Services
export const createModuleService = async (req , createdBy) => {
  logger.info(`Creating module with data: ${JSON.stringify(req)}`);
  const moduleData = { ...req, createdBy };
  const module = await trackQueryTime(
    () => new Module(moduleData).save(),
    "Module.save",
    { data: moduleData }
  );
  logger.info(`Module created successfully: ${module._id}`);
  return new ApiResponse(statusCode.CREATED, module, "Module created successfully");
};

export const deleteModuleService = async ({ moduleId }) => {
  logger.info(`Soft deleting module with ID: ${moduleId}`);

  const module = await trackQueryTime(
    () =>
      Module.findByIdAndUpdate(
        moduleId,
        { isDeleted: true },
        { new: true } 
      ),
    "Module.findByIdAndUpdate",
    { moduleId }
  );
  logger.info(`Module soft deleted: ${moduleId}`);
  return new ApiResponse(statusCode.OK, module, "Module soft deleted successfully");
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
    () =>Module.find({isDeleted: false}),
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

// export const createRoleService = async (req) => {
//   const { roleName, permissions, levelId } = req.body;
//   const roleID = req.user.role;

//   const userRoleData = await trackQueryTime(
//     () => Role.findById(roleID),
//     "Role.findById",
//     { roleID }
//   );

//   const parentLevel = [...userRoleData.parentLevel, userRoleData.levelId];
//   const createdBy = req.user._id;
//   const searchRoleName = roleName.toUpperCase().trim();
//   logger.info(`Creating role: ${searchRoleName}`);

//   const existingRole = await trackQueryTime(
//     () => Role.findOne({ roleName: searchRoleName }),
//     "Role.findOne",
//     { roleName: searchRoleName }
//   );

//   if (existingRole) {
//     logger.warn(`Role already exists: ${searchRoleName}`);
//     throw new apiError(statusCode.ALREADY_EXISTS, "Role already exists", existingRole);
//   }

//   const formattedPermissions = await Promise.all(
//     permissions.map(async ({ moduleId, permission }) => {
//       if (permission.write || permission.delete || permission.update) {
//         permission.read = true;
//       }
//       const permissionData = await trackQueryTime(
//         () => new Permission(permission).save(),
//         "Permission.save",
//         { moduleId }
//       );
//       return { moduleId, permission: permissionData._id };
//     })
//   );

//   const newRole = new Role({
//     roleName: searchRoleName,
//     permissions: formattedPermissions,
//     levelId,
//     parentLevel,
//     createdBy
//   });

//   const savedRole = await trackQueryTime(
//     () => newRole.save(),
//     "Role.save",
//     { roleName: searchRoleName }
//   );

//   logger.info(`Role created successfully: ${searchRoleName}`);

//   return new ApiResponse(statusCode.CREATED, savedRole, "Role created successfully");
// };

export const createRoleService = async (req) => {
  console.log("ASHISH");
  
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
console.log("BIJENDRA");

  if (existingRole) {
    logger.warn(`Role already exists: ${searchRoleName}`);
    throw new apiError(statusCode.ALREADY_EXISTS, "Role already exists", existingRole);
  }

  const existingLevel = await Role.find({ levelId });
  console.log("existingLevel", existingLevel.length);

  if (existingLevel.length) {
    throw new apiError(statusCode.ALREADY_EXISTS, "Role already exists for the given leven", existingLevel);
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
// export const getRolesService = async (req) => {
//   const { role } = req.user;
//   const userRoleData = await trackQueryTime(
//     () => Role.findById(role).populate("levelId"),
//     "Role.findById",
//     { role }
//   );
//   console.log("Role data", userRoleData.levelId.levelId);

//   const levelData = await trackQueryTime(
//     () => Level.find({ levelId: { $gt: userRoleData.levelId.levelId } }).select("_id"),
//     "Level.find",
//     { levelId: userRoleData.levelId.levelId }
//   );

//   const levelIds = levelData.map((level) => level._id);
//   logger.info("Fetching all roles");

//   const roles = await trackQueryTime(
//     () => Role.find({ levelId: { $in: levelIds } })
//       .populate("permissions.moduleId")
//       .populate("permissions.permission")
//       .populate("levelId"),
//     "Role.find",
//     { levelIds }
//   );

//   logger.info(`Fetched ${roles.length} roles`);
//   return new ApiResponse(statusCode.OK, roles, "Roles fetched successfully");
// };

export const getRolesService = async (req, res) => {
  const { role } = req.user;
  const roleData = await Role.find({ 
      _id: role,
      isDeleted: false
    })
    .populate("permissions.moduleId")
    .populate("permissions.permission")
    .populate("levelId");

    let object = roleData.map((role) => {
      return {
        ...role.toObject(),
        permissions: role.permissions.map((permission) => ({
          moduleId: permission.moduleId,
          permission: permission.permission
        }))
      };
    });    
  
  object[0].permissions = object[0].permissions.map((permission) => {    
    let obj = permission.permission.toObject();    
    for (let key in obj) {
      if (typeof obj[key] === "boolean" && obj[key] === false) {
        delete obj[key];
      }
    }
    return {
      moduleId: permission.moduleId,
      permission: obj,
    };
  });
  return new ApiResponse(statusCode.OK, object, "Roles fetched successfully");
};

export const getChildRoleService = async (req, res) => {
  const { role } = req.user;
  const userData = await Role.findById(role)
    .populate({
      path: "levelId",
      select: "levelId -_id",
    })
    .select("levelId -_id");

  const userLevelId = userData.levelId.levelId;

  const levelData = await Level.find({ levelId: userLevelId + 1 }).select("_id");
  console.log("levelData", levelData);
  

  const roleData = await Role.find({ 
      levelId: levelData[0]._id,
      isDeleted: false
    })
    .populate("permissions.moduleId")
    .populate("permissions.permission")
    .populate("levelId");

    let object = roleData.map((role) => {
      return {
        ...role.toObject(),
        permissions: role.permissions.map((permission) => ({
          moduleId: permission.moduleId,
          permission: permission.permission
        }))
      };
    });
  
  object[0].permissions = object[0].permissions.map((permission) => {    
    let obj = permission.permission.toObject();    
    for (let key in obj) {
      if (typeof obj[key] === "boolean" && obj[key] === false) {
        delete obj[key];
      }
    }
    return {
      moduleId: permission.moduleId,
      permission: obj,
    };
  });
  return new ApiResponse(statusCode.OK, object, "Roles fetched successfully");
};


export const getAllRolesService = async (req) => {
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
    () => Role.find({ levelId: { $in: levelIds },  isDeleted: false, })
      .populate("permissions.moduleId")
      .populate("permissions.permission")
      .populate("levelId"),
    "Role.find",
    { levelIds }
  );

  let object = roles.map((role) => {
    return {
      ...role.toObject(),
      permissions: role.permissions.map((permission) => ({
        moduleId: permission.moduleId,
        permission: permission.permission
      }))
    };
  });
  object.forEach((role) => {
    role.permissions =   role.permissions.map((permission) => {    
      let obj = permission.permission.toObject();    
      for (let key in obj) {
        if (typeof obj[key] === "boolean" && obj[key] === false) {
          delete obj[key];
        }
      }
      return {
        moduleId: permission.moduleId,
        permission: obj,
      };
    });
  });
return new ApiResponse(statusCode.OK, object, "Roles fetched successfully");
 
};



export const updateRoleService = async (req) => {
  const { _id, roleId, roleName, permissions, levelId } = req;

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

  const role = await trackQueryTime(
    () => Role.findById(roleId),
    "Role.findById",
    { roleId }
  );

  if (!role) {
    logger.warn(`Role not found: ${roleId}`);
    throw new apiError(statusCode.NOT_FOUND, "Role not found");
  }

  if (role.defaultRole) {
    logger.warn(`Attempt to delete a default role: ${roleId}`);
    throw new apiError(statusCode.LACK_PERMISSION, "Cannot delete default roles");
  }

  // Soft delete permissions
  const deletedPermissions = await Promise.all(
    role.permissions.map(async (perm) => {
      return await trackQueryTime(
        () => Permission.findByIdAndUpdate(perm.permission, { isDeleted: true }, { new: true }),
        "Permission.softDelete",
        { permissionId: perm.permission }
      );
    })
  );

  // Soft delete the role
  const softDeletedRole = await trackQueryTime(
    () => Role.findByIdAndUpdate(roleId, { isDeleted: true }, { new: true }),
    "Role.softDelete",
    { roleId }
  );

  logger.info(`Role soft deleted: ${roleId}`);

  return new ApiResponse(
    statusCode.OK,
    {
      roleId: role.roleId,
      roleName: role.roleName,
      deletedPermissions,
    },
    `Role '${role.roleName}' and associated permissions soft deleted successfully`
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
  const blogs = await trackQueryTime(() => Blog.find({ isDeleted: false }), "Blog.find");
  logger.info("Fetched blogs from database");
  return new ApiResponse(statusCode.OK, blogs, "Blogs fetched successfully");
};


export const addBlogServices = async (blogData) => {
  try {
    const { title, content , createdBy } = blogData;

    logger.info("Creating a new blog entry");

    const newBlog = await trackQueryTime(
      () => Blog.create({ title, content , createdBy }),
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
  logger.info(`Soft deleting blog with ID: ${blogId}`);

  const deletedBlog = await trackQueryTime(
    () =>
      Blog.findByIdAndUpdate(
        blogId,
        { isDeleted: true },
        { new: true }
      ),
    "Blog.findByIdAndUpdate",
    { blogId }
  );

  if (!deletedBlog) {
    logger.warn(`Blog not found: ${blogId}`);
    throw new apiError(statusCode.NOT_FOUND, "Blog not found");
  }

  logger.info(`Blog soft deleted successfully: ${blogId}`);
  return new ApiResponse(statusCode.OK, deletedBlog, "Blog soft deleted successfully");
};


// News Services

export const getNewsServices = async () => {
  logger.info("Fetching news from database");
  const news = await trackQueryTime(() => News.find({ isDeleted: false }), "News.find");
  logger.info("Fetched news from database");
  return new ApiResponse(statusCode.OK, news, "News fetched successfully");
};

// Add news
export const addNewsServices = async (newsData) => {
  try {
    const { title, content , createdBy } = newsData;
    logger.info("Creating a new news entry");

    const newNews = await trackQueryTime(
      () => News.create({ title, content , createdBy }),
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
// export const deleteNewsServices = async (newsId) => {
//   logger.info(`Deleting news with ID: ${newsId}`);

//   const deletedNews = await trackQueryTime(
//     () => News.findByIdAndUpdate(
//       newsId,
//       { isDeleted: true },
//       { new: true }
//     ),
//     "News.findByIdAndUpdate",
//     { newsId }
//   );

//   if (!deletedNews) {
//     logger.warn(`News not found: ${newsId}`);
//     throw new apiError(statusCode.NOT_FOUND, "News not found");
//   }

//   logger.info(`News deleted successfully: ${newsId}`);
//   return new ApiResponse(statusCode.OK, deletedNews, "News deleted successfully");
// };

export const deleteNewsServices = async (newsId, currentUserId) => {
  logger.info(`Deleting news with ID: ${newsId}`);

  const news = await News.findById(newsId).populate({
    path: 'createdBy',
    populate: {
      path: 'role',
      populate: {
        path: 'levelId',
      },
    },
  });

  if (!news) {
    throw new apiError(statusCode.NOT_FOUND, "News not found");
  }

  const currentUser = await User.findById(currentUserId).populate({
    path: 'role',
    populate: {
      path: 'levelId',
    },
  });

  const currentLevel = currentUser?.role?.levelId?.levelId;
  const creatorLevel = news?.createdBy?.role?.levelId?.levelId;

  console.log("currentLevel", currentLevel);
  console.log("creatorLevel", creatorLevel);
  

  if (currentLevel == null || creatorLevel == null) {
    throw new apiError(statusCode.BAD_REQUEST, "Could not determine user levels");
  }

  if (currentLevel > creatorLevel) {
    throw new apiError(statusCode.FORBIDDEN, "You are not allowed to delete this record.");
  }

  const deletedNews = await News.findByIdAndDelete(newsId);
  return new ApiResponse(statusCode.OK, deletedNews, "News deleted successfully");
};
