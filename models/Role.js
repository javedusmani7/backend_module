import mongoose from "mongoose";

const RoleSchema = new mongoose.Schema({
  roleId: { type: Number, unique: true, required: true },
  roleName: { type: String, required: true }
});

const Role = mongoose.model("Role", RoleSchema);
export default Role;
