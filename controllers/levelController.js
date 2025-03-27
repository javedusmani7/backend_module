import { statusCode } from "../config/config.js";
import { createLevelService, deleteLevelByIdService, getAllLevelService } from "../services/level.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createLevelSchema, deleteLevelSchema } from "../validation/levelValidation.js";

export const createLevel = asyncHandler(async (req, res) => {
    const { error } = createLevelSchema.validate(req.body);
    if (error) {
        throw new apiError(statusCode.USER_ERROR, error.details[0].message, error.details);
    }
    const result = await createLevelService(req.body);
    res.status(result.statusCode).json(result);
});

export const getAllLevel = asyncHandler(async (req, res) => {
<<<<<<< Updated upstream
    const { roleId } = req.body; // Get roleId from request body
    if (!roleId) {
      return res.status(400).json({ message: "Role ID is required" });
    }
    const result = await getAllLevelService(roleId);
=======
    const result = await getAllLevelService(req.user);
>>>>>>> Stashed changes
    res.status(result.statusCode).json(result);
  });
  

export const deleteLevelById = asyncHandler(async (req, res) => {
    const { error } = deleteLevelSchema.validate(req.body);
    if (error) {
        throw new apiError(statusCode.USER_ERROR, error.details[0].message, error.details);
    }
    const { _id } = req.body;
    const result = await deleteLevelByIdService(_id);
    res.status(result.statusCode).json(result);
})