import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema({
    "read": {
        type: Boolean,
        default: false,
      },
      "write": {
        type: Boolean,
        default: false,
      },
      "delete": {
        type: Boolean,
        default: false,
      },
      "update": {
        type: Boolean,
        default: false,
      },
});

const Permission = mongoose.model("Permission", permissionSchema);
export default Permission;