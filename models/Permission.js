import mongoose from "mongoose";

const PermissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", //  Reference to the User model
    required: true,
  },
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Module",
    required: true,
  },
  permissions: {
    read: { type: Boolean, default: false },
    write: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
  },
  submodules: {
    type: Object, //  Stores submodule permissions dynamically
    default: {},
  },
});


const Permission = mongoose.model("Permission", PermissionSchema);
export default Permission;