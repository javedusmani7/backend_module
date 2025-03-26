import mongoose from "mongoose";
import { STATUS } from "../config/statusConfig.js";

const ModuleSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ["User Management", "Role Management"],
    required: true,
  },
  desciption: {
    type: String,
  },
  group: {
    type: String,
    enum: ["Dashboard", "Payment", "User", "Settings"],
    required: true,
  },
  status: { 
      type: String, 
      enum: Object.values(STATUS), 
      default: STATUS.ACTIVE 
    }
},{ timestamps: true });

const Module = mongoose.model("Module", ModuleSchema);
export default Module;
