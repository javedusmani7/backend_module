import mongoose from "mongoose";
import { STATUS } from "../config/statusConfig.js";

const RoleSchema = new mongoose.Schema({
  roleId: { 
    type: Number, 
    unique: true, 
    required: true, 
  },
  roleName: { 
    type: String, 
    required: true,
    unique: true, 
  },
  permissions: [{
    "moduleId": {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
    },
    "permission": {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Permission",
    },
  }],
  status: { 
      type: String, 
      enum: Object.values(STATUS), 
      default: STATUS.ACTIVE 
    }
}, { timestamps: true });

const Role = mongoose.model("Role", RoleSchema);
export default Role;
