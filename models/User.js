import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 3, maxlength: 50 },
  email: { type: String, unique: true, required: true, maxlength: 50 },
  password: { type: String, required: true },
  role: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true }
});

const User = mongoose.model("User", UserSchema);
export default User;
