import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js"; // Ensure correct import
import Role from "../models/Role.js";
import { statusCode } from "../config/config.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token= req.cookies?.authToken ;  
  if (!token) {
    return next(new apiError(401, "Unauthorized request"));
  }

  const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
  const user = await User.findById(decodedToken.id || decodedToken._id).select("-password");// Ensure token payload contains correct user ID key
  
  if (!user) {
    return next(new apiError(401, "Invalid access token"));
  }
  req.user = user; // Attach user to request
  next();
});

export const verifyAdmin = asyncHandler(async (req, res, next) => {
  const { role } = req.user;
  const adminRole = await Role.findOne().sort({ roleId: -1 });
  if (role != adminRole) return next(new apiError(statusCode.LACK_PERMISSION, "You don't have permission for the operation"));  
  return next();
})
