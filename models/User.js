import mongoose from "mongoose";
import { STATUS } from "../config/statusConfig.js";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, minlength: 3, maxlength: 50 },
    email: { type: String, unique: true, required: true, maxlength: 50 },
    password: { type: String, required: true },
    role: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true },
    status: { type: String, enum: Object.values(STATUS) },

    // Optional fields
    userId: { type: String, unique: true, sparse: true }, // Unique but optional
    emailVerified: { type: Boolean, default: true },
    ipv4: { type: String },
    ipv4Verified: { type: Boolean, default: true },
    ipv6: { type: String },
    ipv6Verified: { type: Boolean, default: true },
    deviceId: { type: String },
    deviceIdVerified: { type: Boolean, default: true },
    mobileNumber: { type: String },
    mobileVerified: { type: Boolean, default: true },
    multiLogin: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },

    //heirarchy fields
    parent_Id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    share: { type: Number, default: 0 },
    remaining_share: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
export default User;
