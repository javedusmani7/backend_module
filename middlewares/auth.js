import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js"; // Ensure correct import
import Role from "../models/Role.js";
import { statusCode } from "../config/config.js";
import Module from "../models/Module.js";
import Permission from "../models/Permission.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.authToken;
  if (!token) {
    return next(new apiError(401, "Unauthorized request"));
  }

  const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
  const user = await User.findById(decodedToken.id || decodedToken._id).select("-password");// Ensure token payload contains correct user ID key

  if (!user) {
    return next(new apiError(401, "Invalid access token"));
  }
  req.user = user;
  next();
});

export const verifyPermission = asyncHandler(async (req, res, next) => {
  const { option } = req.body;
  const { operation } = option;
  const { role } = req.user;
  if (req.body.option) {
    delete req.body.option;
  }  
  const module_id = await Module.findOne({"name": option.module}).select("_id");
  
  if (!module_id?._id) {
    return next(new apiError(statusCode.NOT_FOUND, "Module not found"));
  }
  const roleData = await Role.findById(role).select("permissions -_id"); 
  const index = roleData.permissions.findIndex(item => item.moduleId.equals(module_id._id)); 
  if (index == -1) {
    return next(new apiError(statusCode.LACK_PERMISSION, "You don't have permission for the operation"));
  } 
  const permission = await Permission.findById(roleData.permissions[index].permission)
  if (!permission[operation]) {
    return next(new apiError(statusCode.LACK_PERMISSION, "You don't have permission for the operation"));
  }
  next();
});

export const verifyAdmin = asyncHandler(async (req, res, next) => {
  const { role } = req.user;
  const adminRole = await Role.findById(role)

  if (adminRole.roleName !== "OWNER") {
    return next(new apiError(statusCode.LACK_PERMISSION, "You don't have permission for the operation"));
  }
  return next();
})
