import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { statusCode } from "../config/config.js";
import { ApiResponse } from "../utils/apiResponse.js";
import User from "../models/User.js";

export const registerService = async (req, res) => {
    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new ApiResponse(statusCode.ALREADY_EXISTS, existingUser, "User already exists");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await new User({ name, email, password: hashedPassword, role }).save();
    return new ApiResponse(statusCode.CREATED, newUser, "User registered successfully");
}

export const loginService = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new ApiResponse(statusCode.NOT_FOUND, null, "User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new ApiResponse(statusCode.UNAUTHORIZED, null, "Invalid credentials");

    const token = jwt.sign(user.toObject(), process.env.TOKEN_SECRET, { expiresIn: "1h" });
    return new ApiResponse(statusCode.OK, { token, user }, "User logged in successfully");
}