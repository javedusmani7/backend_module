import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true , minlength: 3 , maxlength: 50 },
  email: { type: String, unique: true, required: true ,  unique: true , maxlength: 50 },
  password: { type: String, required: true },
  role: {
    type: Number,
    enum: [1, 2, 3], // 1: Superadmin, 2: Admin, 3: Moderator
    required: true,
  },
});

const User = mongoose.model("User", UserSchema);
export default User;

