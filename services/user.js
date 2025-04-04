import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { statusCode } from "../config/config.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import { encryptPassword, comparePassword } from "../middlewares/encryption.js";
import User from "../models/User.js";
import Role from "../models/Role.js";
import logger, { trackQueryTime } from "../logger.js";

// Register Service
export const registerService = async (req) => {
  const { name, email, password } = req.body;
  logger.info(`Register attempt for email: ${email}`);

  let role = await trackQueryTime(() => Role.findOne({ roleName: "USER" }), "Role.findOne", { email });
  if (!role) {
    logger.warn(`USER role not found for email: ${email}`);
    throw new apiError(statusCode.NOT_FOUND, "USER role does not exist");
  }

  const existingUser = await trackQueryTime(() => User.findOne({ email }), "User.findOne", { email });
  if (existingUser) {
    logger.warn(`User already exists: ${email}`);
    throw new apiError(statusCode.ALREADY_EXISTS, "User already exists", existingUser);
  }

  const hashedPassword = await encryptPassword(password);
  const newUser = await trackQueryTime(() => new User({
    name,
    email,
    password: hashedPassword,
    role: role?._id || null,
  }).save(), "User.save", { email });

  logger.info(`User registered successfully: ${email}`);
  return new ApiResponse(statusCode.CREATED, newUser, "User registered successfully");
};

// Login Service
export const loginService = async (req) => {
  const { email, password } = req.body;
  logger.info(`Login attempt for email: ${email}`);

  const user = await trackQueryTime(() => User.findOne({ email }).populate("role", "roleId roleName"), "User.findOne", { email });
  if (!user) {
    logger.warn(`Login failed: User not found (${email})`);
    throw new apiError(statusCode.NOT_FOUND, "User not found");
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    logger.warn(`Invalid login attempt: ${email}`);
    throw new apiError(statusCode.UNAUTHORIZED, "Password mismatch");
  }

  const payload = { id: user._id, email: user.email, role: user.role };
  const token = jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: "1h" });

  logger.info(`User logged in successfully: ${email}`);
  return new ApiResponse(statusCode.OK, { token, user: payload }, "User logged in successfully");
};

// Get All Users
export const getUsersService = async () => {
  logger.info("Fetching all users");
  const users = await trackQueryTime(() => User.find().populate("role", "roleId roleName _id").select("-password"), "User.find");

  logger.info(`Successfully fetched ${users.length} users`);
  return { statusCode: statusCode.OK, data: users };
};

// Delete User Service
export const deleteUserService = async (req) => {
  const { _id } = req;
  logger.info(`Delete request for user ID: ${_id}`);

  const user = await trackQueryTime(() => User.findByIdAndDelete(_id), "User.findByIdAndDelete", { _id });
  if (!user) {
    logger.warn(`User not found for deletion: ${_id}`);
    throw new apiError(statusCode.NOT_FOUND, "User not found");
  }

  logger.info(`User deleted successfully: ${_id}`);
  return new ApiResponse(statusCode.OK, user, "User has been deleted successfully");
};

export const adminUpdateUserService = async (req) => {
  const { role } = req.user;
  const { _id } = req.body;
  const userRoleData = await trackQueryTime(() => Role.findById(role).populate("levelId"));  
  const assignUserRoleData = await trackQueryTime(() => User.findById(_id).populate({
    path: "role",
    populate: {
      path: "levelId",
      select: "levelId"
    }
  }), "User.findById", { _id });
  
  const userPreviousRole = assignUserRoleData.role.levelId.levelId;
  const loginUserRole = userRoleData.levelId.levelId;
  if (userPreviousRole < loginUserRole) {
    throw new apiError(statusCode.LACK_PERMISSION, "You don't have permission for the operation");
  }
  
  const updateuserData = await trackQueryTime(() => User.findByIdAndUpdate(_id, { $set: req.body }, { new: true }).populate("role").exec());
  return new ApiResponse(statusCode.CREATED, updateuserData, "User role updated successfully");
};


export const getUsersByIdService = async (userId) => {
  const userData = await User.findById(userId).populate({
    path: "role",
    populate: {
      path: "levelId",
      select: "levelId"
    }
  }).select('-password');
  return new ApiResponse(statusCode.OK, userData, "User fetched successfully");
};

export const updateUserService = async (req) => {
  const { _id } = req;
  const updatedUser = await User.findByIdAndUpdate(_id, { $set: req }, { new: true }).populate({
    path: "role",
    populate: {
      path: "levelId",
      select: "levelId"
    }
  }).select('-password');
  return new ApiResponse(statusCode.CREATED, updatedUser, "User updated successfully");
};

//New User Service
export const addUserService = async (req) => {
  const { name, email, password, userId, emailVerified, ipv4, ipv4Verified, ipv6, ipv6Verified, deviceId, deviceIdVerified, mobileNumber, mobileVerified, multiLogin , role: roleId } = req.body;

  logger.info(`Adding new user: ${email}`);
  if (!roleId) {
    throw new apiError(statusCode.BAD_REQUEST, "Role is required");
  }

  const role = await trackQueryTime(() => Role.findById(roleId), "Role.findById", { roleId });
  if (!role) {
    logger.warn(`USER role not found for email: ${email}`);
    throw new apiError(statusCode.NOT_FOUND, "USER role does not exist");
  }

  const existingUser = await trackQueryTime(() => User.findOne({ email }), "User.findOne", { email });
  if (existingUser) {
    logger.warn(`User already exists: ${email}`);
    throw new apiError(statusCode.ALREADY_EXISTS, "User already exists", existingUser);
  }

  const hashedPassword = await encryptPassword(password);
  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    role: role?._id,
    userId: userId || null,
    emailVerified: emailVerified || false,
    ipv4: ipv4 || null,
    ipv4Verified: ipv4Verified || false,
    ipv6: ipv6 || null,
    ipv6Verified: ipv6Verified || false,
    deviceId: deviceId || null,
    deviceIdVerified: deviceIdVerified || false,
    mobileNumber: mobileNumber || null,
    mobileVerified: mobileVerified || false,
    multiLogin: multiLogin || false,
  });

  await trackQueryTime(() => newUser.save(), "User.save", { email });

  logger.info(`User added successfully: ${email}`);
  return new ApiResponse(statusCode.CREATED, newUser, "User added successfully");
};