import { statusCode } from "../config/config.js";
import Level from "../models/Level.js";
import Role from "../models/Role.js";
import User from "../models/User.js";
import { ApiResponse } from "../utils/apiResponse.js";

export const createLevelService = async (req) => {
  const { levelId } = req;
  const level = await Level.findOne({ levelId });
  if (level?._id) {
    return new ApiResponse(
      statusCode.ALREADY_EXISTS,
      level,
      "Level Already exist"
    );
  }
  const newLevel = await new Level(req).save();
  return new ApiResponse(statusCode.OK, newLevel, "Level has been created");
};

// export const getAllLevelService = async () => {
//     const levelData = await Level.find().sort({ levelId: 1 });
//     return new ApiResponse(statusCode.OK, levelData, "Level fetched successfully");
// };

export const getAllLevelService = async (userId) => {
  console.log(userId, "sa");

  // Fetch user details along with their role
  const user = await User.findById(userId).populate("role");
  console.log("User ID:", user);

  if (!user) {
    console.log("User not found");
    return new ApiResponse(statusCode.NOT_FOUND, null, "User not found");
  }

  const userRole = await Role.findById(user.role).populate("levelId");
  if (!userRole) {
    console.log("Role not found");
    return new ApiResponse(statusCode.NOT_FOUND, null, "Role not found");
  }

  const userLevel = userRole.levelId;

  console.log("User Level:", userLevel.levelId);

  const levelData = await Level.find({
    levelId: { $gt: userLevel.levelId },
  }).sort({ levelId: 1 });
  console.log("Filtered Levels:", levelData);

  return new ApiResponse(
    statusCode.OK,
    levelData,
    "Level fetched successfully"
  );
};

export const deleteLevelByIdService = async (req) => {
  const levelData = await Level.findById(req);
  if (!levelData._id) {
    return new ApiResponse(statusCode.NOT_FOUND, null, "Level not found");
  }
};

export const getLevelByIdService = async (id) => {
  const levelData = await Level.findById(id);
  return new ApiResponse(
    statusCode.OK,
    levelData,
    "Level fetched successfully"
  );
};
