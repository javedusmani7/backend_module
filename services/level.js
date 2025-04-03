import { statusCode } from "../config/config.js";
import Level from "../models/Level.js";
import Role from "../models/Role.js";
import User from "../models/User.js";
import { apiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import logger, { trackQueryTime } from "../logger.js";

export const createLevelService = async (req) => {
  const { levelId } = req.body;
  logger.info(`Creating level with ID: ${levelId}`);

  const level = await trackQueryTime(() => Level.findOne({ levelId }), "Level.findOne", { levelId });
  if (level) {
    logger.warn(`Level already exists: ${levelId}`);
    return new ApiResponse(statusCode.ALREADY_EXISTS, level, "Level Already exists");
  }

  const newLevel = await trackQueryTime(() => new Level(req.body).save(), "Level.save", { levelId });
  logger.info(`Level created successfully: ${levelId}`);
  return new ApiResponse(statusCode.CREATED, newLevel, "Level has been created");
};

export const getAllLevelService = async (req) => {
  const { role } = req;
  logger.info(`Fetching levels for role: ${role}`);

  const userRoleData = await trackQueryTime(() => Role.findById(role).populate("levelId"), "Role.findById", { role });
  if (!userRoleData) {
    throw new apiError(statusCode.NOT_FOUND, "Role not found");
  }

  const levelData = await trackQueryTime(
    () => Level.find({ levelId: { $gt: userRoleData.levelId?.levelId || 0 } }).sort({ levelId: 1 }),
    "Level.find",
    { role }
  );

  logger.info(`Levels fetched successfully for role: ${role}`);
  return new ApiResponse(statusCode.OK, levelData, "Levels fetched successfully");
};

export const deleteLevelByIdService = async (req) => {
  const { id } = req.params;
  logger.info(`Deleting level with ID: ${id}`);

  const levelData = await trackQueryTime(() => Level.findByIdAndDelete(id), "Level.findByIdAndDelete", { id });
  if (!levelData) {
    logger.warn(`Level not found: ${id}`);
    throw new apiError(statusCode.NOT_FOUND, "Level not found");
  }

  logger.info(`Level deleted successfully: ${id}`);
  return new ApiResponse(statusCode.OK, levelData, "Level has been deleted successfully");
};

export const getLevelByIdService = async (id) => {
  logger.info(`Fetching level with ID: ${id}`);

  const levelData = await trackQueryTime(() => Level.findById(id), "Level.findById", { id });
  if (!levelData) {
    logger.warn(`Level not found: ${id}`);
    throw new apiError(statusCode.NOT_FOUND, "Level not found");
  }

  logger.info(`Level fetched successfully: ${id}`);
  return new ApiResponse(statusCode.OK, levelData, "Level fetched successfully");
};
