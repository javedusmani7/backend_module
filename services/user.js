import jwt from "jsonwebtoken";
import { statusCode } from "../config/config.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { encryptPassword, comparePassword } from "../middlewares/encryption.js";
import User from "../models/User.js";

export const registerService = async (req) => {
    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new ApiResponse(statusCode.ALREADY_EXISTS, existingUser, "User already exists");
    const hashedPassword = await encryptPassword(password);
    const newUser = await new User({ name, email, password: hashedPassword, role }).save();
    return new ApiResponse(statusCode.CREATED, newUser, "User registered successfully");
};

export const loginService = async (req) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new ApiResponse(statusCode.NOT_FOUND, null, "User not found");
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) throw new ApiResponse(statusCode.UNAUTHORIZED, null, "Invalid credentials");
    const token = jwt.sign(user.toObject(), process.env.TOKEN_SECRET, { expiresIn: "1h" });
    return new ApiResponse(statusCode.OK, { token, user }, "User logged in successfully");
}

export const getRolesService = async () => {
    // Fetch distinct roles from the User collection
    const roles = await User.distinct("role");
    
    return roles.map((role) => ({
      role,
      name: role === 1 ? "Superadmin" : role === 2 ? "Admin" : "Moderator",
    }));
  };
