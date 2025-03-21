import jwt from "jsonwebtoken";
import { statusCode } from "../config/config.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import { encryptPassword, comparePassword } from "../middlewares/encryption.js";
import User from "../models/User.js";
import Role from "../models/Role.js";
import mongoose from "mongoose";

export const registerService = async (req) => {
    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });    
    if (existingUser) return new ApiResponse(statusCode.ALREADY_EXISTS, existingUser, "User already exists");
    const hashedPassword = await encryptPassword(password);
    const objectId = new mongoose.Types.ObjectId(role);
    const newUser = await new User({ name, email, password: hashedPassword, role: objectId }).save();    
    return new ApiResponse(statusCode.CREATED, newUser, "User registered successfully");
};

export const loginService = async (req) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return new ApiResponse(statusCode.NOT_FOUND, null, "User not found");
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) return new ApiResponse(statusCode.UNAUTHORIZED, null, "Invalid credentials");
    const token = jwt.sign(user.toObject(), process.env.TOKEN_SECRET, { expiresIn: "1h" });
    return new ApiResponse(statusCode.OK, { token, user }, "User logged in successfully");
}



export const getRolesService = async () => {
  // Fetch all roles from Role model
  const roles = await Role.find({}, { _id: 1, roleId: 1, roleName: 1 });

  return roles;
};

export const getUsersService = async () => {
  try {
    const users = await User.find().populate("role", "roleId roleName -_id").select("-password"); // Fetch users with their role IDs
    return { statusCode: statusCode.OK, data: users };
  } catch (error) {
    console.log(error);
    throw new apiError(statusCode.INTERNAL_ERROR, "Error fetching users", error);
  }
};
