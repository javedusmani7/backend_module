import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { statusCode } from "../config/config.js";
import { userRegistrationSchema, userLoginSchema, deleteUserSchema } from "../validation/userValidation.js";
import { registerService, loginService, getUsersService, deleteUserService, adminUpdateUserService } from "../services/user.js";
import { updateUserSchema } from "../validation/moduleValidation.js";

export const register = asyncHandler(async (req, res) => {
  const { error } = userRegistrationSchema.validate(req.body);
  if (error) {
    throw new apiError(statusCode.USER_ERROR, error.details[0].message, error.details);
  }  
  const result = await registerService(req);
  res.status(result.statusCode).json(result);
});

// Login user
export const login = asyncHandler(async (req, res) => {
  const { error } = userLoginSchema.validate(req.body);
  if (error) {
    throw new apiError(statusCode.USER_ERROR, error.details[0].message, error.details);
  }
  const result = await loginService(req);
  if (result.data && result.data.token) {
    res.cookie('authToken', result.data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' ? true : false,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    delete result.data.token;
  }
  res.status(result.statusCode).json(result);
});

export const getUsers = asyncHandler(async (req, res) => {
  const result = await getUsersService();
  if (!result || result.length === 0) {
    throw new apiError(statusCode.NOT_FOUND, "No users found");
  }
  res.status(statusCode.OK).json(result);
});

export const deleteUser = asyncHandler(async (req, res) => {
    const { error } = deleteUserSchema.validate(req.body);
  if (error) {
    throw new apiError(statusCode.USER_ERROR, error.details[0].message, error.details);
  }
  const result = await deleteUserService(req.body);
  res.status(statusCode.OK).json(result);
})

export const adminUpdateUser = asyncHandler(async ( req, res) => {
  const { error } = updateUserSchema.validate(req.body);
  if (error) {
    throw new apiError(statusCode.USER_ERROR, error.details[0].message, error.details);
  }
  const result = await adminUpdateUserService(req.body);
  res.status(statusCode.OK).json(result);
})