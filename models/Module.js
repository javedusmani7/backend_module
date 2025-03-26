import mongoose from "mongoose";
import { STATUS } from "../config/statusConfig.js";

const ModuleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  
  path: {
    type: String,
    default: "", // No need for required since it has a default value
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
});

const Module = mongoose.model("Module", ModuleSchema);
export default Module;
