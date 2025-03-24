import mongoose from "mongoose";
import { STATUS } from "../config/statusConfig.js";

const ModuleSchema = new mongoose.Schema({
  name: {
    type: String,
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
      default: STATUS.PENDING 
    }
});

const Module = mongoose.model("Module", ModuleSchema);
export default Module;
