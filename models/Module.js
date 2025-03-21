import mongoose from "mongoose";

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
});

const Module = mongoose.model("Module", ModuleSchema);
export default Module;
