import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js"; // Ensure correct import

export const verifyJWT = asyncHandler(async (req, res, next) => {

  const token= req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
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
