import { ApiError } from "../utils/apiError.js";
import { statusCode } from "../config/config.js";
import { userRegistrationSchema, userLoginSchema } from "../validation/userValidation.js";
import { registerService, loginService } from "../services/user.js";

export const register = async (req, res) => {
  try {
    const { error } = userRegistrationSchema.validate(req.body);

    if (error) {
      throw new ApiError(statusCode.USER_ERROR, error.details[0].message, error.details);
    }
    const result = await registerService(req, res);
    res.status(result.statusCode).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Server Error", error: error.message
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { error } = userLoginSchema.validate(req.body);
    if (error) {
      throw new ApiError(statusCode.USER_ERROR, error.details[0].message, error.details);
    }
    const result = await loginService(req, res);
    res.status(result.statusCode).json(result);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
