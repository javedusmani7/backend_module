import mongoose from "mongoose";
import { STATUS } from "../config/statusConfig.js";

const LevelSchema = new mongoose.Schema({
  levelId: {
    type: Number,
    enum: [1,2,3,4,5,6,7,8,9,10],
    required: true,
    unique: true
  },
  status: { 
      type: String, 
      enum: Object.values(STATUS), 
      default: STATUS.ACTIVE 
    }
},{ timestamps: true });

const Level = mongoose.model("Level", LevelSchema);
export default Level;