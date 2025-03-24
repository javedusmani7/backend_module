import jwt from "jsonwebtoken";
import { statusCode } from "../config/config.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import { encryptPassword, comparePassword } from "../middlewares/encryption.js";
import User from "../models/User.js";
import Role from "../models/Role.js";

export const registerService = async (req) => {
  const { name, email, password } = req.body;
  let role = await Role.findOne().sort({ roleId: 1 });
  const existingUser = await User.findOne({ email });
  if (existingUser) return new ApiResponse(statusCode.ALREADY_EXISTS, existingUser, "User already exists");
  const hashedPassword = await encryptPassword(password);
  const newUser = await new User({ name, email, password: hashedPassword, role: role._id }).save();
  return new ApiResponse(statusCode.CREATED, newUser, "User registered successfully");
};

export const loginService = async (req) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).populate("role", "roleId roleName");
  if (!user) return new ApiResponse(statusCode.NOT_FOUND, null, "User not found");
  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) return new ApiResponse(statusCode.UNAUTHORIZED, null, "Invalid credentials");
  const userObj = user.toObject();
  delete userObj.password;
  const token = jwt.sign(userObj, process.env.TOKEN_SECRET, { expiresIn: "1h" });
  return new ApiResponse(statusCode.OK, { token, user: userObj }, "User logged in successfully");
}

export const getUsersService = async () => {
  try {
    const users = await User.find().populate("role", "roleId roleName -_id").select("-password");
    return { statusCode: statusCode.OK, data: users };
  } catch (error) {
    console.log(error);
    throw new apiError(statusCode.INTERNAL_ERROR, "Error fetching users", error);
  }
};

export const deleteUserService = async (req) => {
  const { _id } = req;
  const user = await User.findByIdAndDelete(_id); 
  return new ApiResponse(statusCode.OK, user, "User has been deleted successfully");
}
