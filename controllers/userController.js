
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { statusCode } from "../config/config.js";
import { userRegistrationSchema, userLoginSchema } from "../validation/userValidation.js";
import { registerService, loginService } from "../services/user.js";

export const register = asyncHandler(async (req, res) => {
  
    const { error } = userRegistrationSchema.validate(req.body);

    if (error) {
      throw new ApiError(statusCode.USER_ERROR, error.details[0].message, error.details);
    }

    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)  throw new ApiError(401, "user already exist");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ name, email, password: hashedPassword, role });

    await newUser.save();
    return res
    .status(201)
    .json(new ApiResponse(200, newUser, "user is registred successfully"));
  });

// Login user
export const login = asyncHandler( async (req, res) => {
    const { error } = userLoginSchema.validate(req.body);
    if (error) {
      throw new ApiError(statusCode.USER_ERROR, error.details[0].message, error.details);
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if(!user) throw new ApiError(400, "Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new ApiError(400, "Invalid credentials")
    const token = jwt.sign({ id: user._id, role: user.role }, "yourSecretKey", { expiresIn: "1h" });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});
