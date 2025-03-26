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
  },
  defaultRole:{
    type: Boolean,
    default: false
  },
  levelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Level",
  },
  parentLevel: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Level",
    default: []
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  }
}, { timestamps: true });

const Role = mongoose.model("Role", RoleSchema);
export default Role;
