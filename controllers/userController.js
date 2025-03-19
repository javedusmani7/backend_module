import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { statusCode } from "../config/config.js";
import { userRegistrationSchema, userLoginSchema } from "../validation/userValidation.js";
import { registerService, loginService } from "../services/user.js";

export const register = asyncHandler(async (req, res) => {

    const { error } = userRegistrationSchema.validate(req.body);

    if (error) {
      throw new ApiError(statusCode.USER_ERROR, error.details[0].message, error.details);
    }
    const result = await registerService(req);
    res.status(result.statusCode).json(result);
});

// Login user
export const login = asyncHandler( async (req, res) => {
    const { error } = userLoginSchema.validate(req.body);
    if (error) {
      throw new ApiError(statusCode.USER_ERROR, error.details[0].message, error.details);
    }
    const result = await loginService(req);
    res.status(result.statusCode).json(result);
});

//fetch roles

export const getRoles = asyncHandler(async (req, res) => {
  const result = await getRolesService();
  
  if (!result || result.length === 0) {
    throw new ApiError(statusCode.NOT_FOUND, "No roles found");
  }

  res.status(statusCode.OK).json(result);
});