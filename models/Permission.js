import mongoose from "mongoose";

const PermissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    required: true,
  },
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Module", 
    required: true,
  },
  permissions: {
    create: { type: Boolean, default: false }, 
    read: { type: Boolean, default: false },   // Allow viewing data
    update: { type: Boolean, default: false }, // Allow modifying data
    delete: { type: Boolean, default: false }, // Allow removing data
  },
  submodules: {
    type: Object, // Stores submodule permissions dynamically
    default: {},
  },
});

const Permission = mongoose.model("Permission", PermissionSchema);
export default Permission;
