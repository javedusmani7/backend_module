import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiError.js";
import { statusCode } from "../config/config.js";
import { userRegistrationSchema, userLoginSchema } from "../validation/userValidation.js";

export const register = async (req, res) => {
  try {
    const { error } = userRegistrationSchema.validate(req.body);

    if (error) {      
      throw new ApiError(statusCode.USER_ERROR, error.details[0].message,error.details);
    }

    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message
     });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { error } = userLoginSchema.validate(req.body);

    if (error) {      
      throw new ApiError(statusCode.USER_ERROR, error.details[0].message,error.details);
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, "yourSecretKey", { expiresIn: "1h" });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
