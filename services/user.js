import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { statusCode } from "../config/config.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import { encryptPassword, comparePassword } from "../middlewares/encryption.js";
import User from "../models/User.js";
import Role from "../models/Role.js";
import logger, { trackQueryTime } from "../utils/logger.js";

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
  const { identifier, password } = req.body;
  logger.info(`Login attempt for identifier: ${identifier}`);

  // Match user either by email or name
  const user = await trackQueryTime(() =>
    User.findOne({
      $or: [
        { email: identifier },
        { name: identifier }
      ]
    }).populate("role", "roleId roleName"),
    "User.findOne",
    { identifier }
  );

  if (!user) {
    logger.warn(`Login failed: User not found (${identifier})`);
    throw new apiError(statusCode.NOT_FOUND, "User not found");
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    logger.warn(`Invalid login attempt: ${identifier}`);
    throw new apiError(statusCode.UNAUTHORIZED, "Password mismatch");
  }

  const payload = { id: user._id, email: user.email, role: user.role };
  const token = jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: "1h" });

  logger.info(`User logged in successfully: ${identifier}`);
  return new ApiResponse(statusCode.OK, { token, user: payload }, "User logged in successfully");
};



// Get All Users
export const getUsersService = async (req) => {
  
  logger.info("Fetching all users");
  const { levelId }  = await Role.findById(req.user.role).populate("levelId").select("levelId");
  const role_list = await Role.aggregate([
    {
      $match: {isDeleted: false}
    },
    {
      $lookup: {
        from: 'levels',
        localField: 'levelId',
        foreignField: '_id',
        as: 'level'
      }
    },
    {
      $unwind: '$level'
    },
    {
      $match: { 'level.levelId': { $gt: levelId.levelId } } 
    },
    {
      $project: { _id: 1 }
    }
  ]);
  const user_list = await User.find({
    role: { $in: role_list.map(r => r._id) },
    isDeleted: false
  }).populate("role", "roleId roleName");

  
  logger.info(`Successfully fetched ${user_list.length} users`);
  return { statusCode: statusCode.OK, data: user_list };
};

// Delete User Service
export const deleteUserService = async (req) => {
  const { _id } = req;
  logger.info(`Delete request for user ID: ${_id}`);

  const user = await trackQueryTime(
    () => User.findByIdAndUpdate(_id, { isDeleted: true }, { new: true }),
    "User.findByIdAndUpdate",
    { _id }
  );
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
  const { name, email, password, userId, emailVerified, ipv4, ipv4Verified, ipv6, ipv6Verified, deviceId, deviceIdVerified, mobileNumber, mobileVerified, multiLogin , role: roleId , share} = req.body;

  logger.info(`Adding new user: ${email}`);
  if (!roleId) {
    throw new apiError(statusCode.BAD_REQUEST, "Role is required");
  }

  const role = await trackQueryTime(() => Role.findById(roleId), "Role.findById", { roleId });
  if (!role) {
    logger.warn(`USER role not found for email: ${email}`);
    throw new apiError(statusCode.NOT_FOUND, "USER role does not exist");
  }

  const existingUser = await trackQueryTime(() => User.findOne({ email , isDeleted: false}), "User.findOne", { email });
  if (existingUser) {
    logger.warn(`User already exists: ${email}`);
    throw new apiError(statusCode.ALREADY_EXISTS, "User already exists", existingUser);
  }

  const shareCalculate = await calculateParentShare(req.user._id, share);
  if(!shareCalculate) {
    throw new apiError(statusCode.BAD_REQUEST, "Insufficient share available");
  }

  const hashedPassword = await encryptPassword(password);
  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    role: role?._id,
    userId: userId || null,
    emailVerified: emailVerified || true,
    ipv4: ipv4 || null,
    ipv4Verified: ipv4Verified || true,
    ipv6: ipv6 || null,
    ipv6Verified: ipv6Verified || true,
    deviceId: deviceId || null,
    deviceIdVerified: deviceIdVerified || true,
    mobileNumber: mobileNumber || null,
    mobileVerified: mobileVerified || true,
    multiLogin: multiLogin || true,
    parent_Id : req.user._id,
    share: share || 0,
    remaining_share: share || 0,
  });

  await trackQueryTime(() => newUser.save(), "User.save", { email });

  logger.info(`User added successfully: ${email}`);
  return new ApiResponse(statusCode.CREATED, newUser, "User added successfully");
};

//calculate parent share
export const calculateParentShare = async (parent, share) => {
  const parentUser = await User.findOne({_id : parent} , { remaining_share: 1, share: 1 });
  if (!parentUser) {
    throw new apiError(statusCode.NOT_FOUND, "User not found");
  }

  if(parentUser.remaining_share < share) {
    throw new apiError(statusCode.BAD_REQUEST, "Insufficient share available");
  }

  parentUser.remaining_share = parentUser.remaining_share - share;
  return await parentUser.save();
};

//Get partnerShip Service
export const getpartnerShipService = async (userId) => {
  const userData = await User.aggregate(
    [
      {$lookup: {
        from: "roles",
        localField: "role",
        foreignField: "_id",
        as: "roleData"
      }},
      { $unwind: "$roleData" },         // Flatten the array
    
        {$lookup: {
        from: "levels",
        localField: "roleData.levelId",
        foreignField: "_id",
        as: "levelId",
      }},
      {$unwind : "$levelId"},
      {
        $group: {
          _id: {name :"$roleData.roleName", level :"$levelId.levelId" },    
          share: { $first: "$share" },            
          remaining_share: { $first: "$remaining_share" }  
        }
      },
        {$sort : {"_id.level" : 1}},
    ]
  )
  return new ApiResponse(statusCode.OK, userData, "User fetched successfully");
};