import mongoose from "mongoose";

const ModuleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., Dashboard, Reports, Users
  submodules: [
    {
      name: { type: String, required: true }, // e.g., Overview, Stats
    },
  ],
});

const Module = mongoose.model("Module", ModuleSchema);
export default Module;
