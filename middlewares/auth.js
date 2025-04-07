import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js"; // Ensure correct import
import Role from "../models/Role.js";
import { statusCode } from "../config/config.js";
import Module from "../models/Module.js";
import Permission from "../models/Permission.js";
import { getRoleByIdService } from "../services/module.js";
import { getLevelByIdService } from "../services/level.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.authToken;
  if (!token) {
    throw new apiError(401, "Unauthorized request");
  }

  const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
  const user = await User.findById(decodedToken.id || decodedToken._id).select("-password");// Ensure token payload contains correct user ID key

  if (!user) {
    throw new apiError(401, "Invalid access token");
  }
  req.user = user;
  next();
});

export const verifyPermission = asyncHandler(async (req, res, next) => {  
  const { operation,  module} = req.body;
  const { role } = req.user;
  if (req.body.operation) {
    delete req.body.operation;
  }  
  if (req.body.module) {
    delete req.body.module;
  }    
  const module_id = await Module.findOne({"name": module}).select("_id");
  
  if (!module_id?._id) {
    throw new apiError(statusCode.NOT_FOUND, "Module not found");
  }
  const roleData = await Role.findById(role).select("permissions -_id"); 
  const index = roleData.permissions.findIndex(item => item.moduleId.equals(module_id._id)); 
  // console.log("index", index);
  
  if (index == -1) {
    throw new apiError(statusCode.LACK_PERMISSION, "You don't have permission for the operation");
  } 
  const permission = await Permission.findById(roleData.permissions[index].permission)
  // console.log("permission", permission[operation]);
  
  if (!permission[operation]) {
    throw new apiError(statusCode.LACK_PERMISSION, "You don't have permission for the operation");
  }
  next();
});

export const verifyLevel = asyncHandler(async (req, res, next) => {
  const { role } = req.user;
  // const { levelId } = req.body;
  const roleData = await getRoleByIdService(role);
  let levelData;  
  if (req.body?.levelId) {

   levelData = await getLevelByIdService(req.body.levelId);   
   levelData = levelData.data;
  }

  if (req.body?._id) {
    levelData = await Role.findById(req.body._id).populate("levelId").select("levelId -_id");
    levelData = levelData.levelId;    
  }  
  const userLevel = roleData.data.levelId.levelId;
  const roleLevel = levelData.levelId;


 if (userLevel != (roleLevel - 1)) {
    throw new apiError(statusCode.LACK_PERMISSION, "You don't have permission for the operation");
  }
  
  // if (userLevel >= roleLevel) {
  //   throw new apiError(statusCode.LACK_PERMISSION, "You don't have permission for the operation");
  // }
  return next();
});

export const verifyAdmin = asyncHandler(async (req, res, next) => {
  const { role } = req.user;
  const adminRole = await Role.findById(role)

  if (adminRole.roleName !== "OWNER") {
    throw new apiError(statusCode.LACK_PERMISSION, "You don't have permission for the operation");
  }
  return next();
})
