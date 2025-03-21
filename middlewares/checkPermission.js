// import { apiError } from "../utils/apiError.js";
// import { statusCode } from "../config/config.js";
// import { asyncHandler } from "../utils/asyncHandler.js";
// import Module from "../models/Module.js";
// import Permission from "../models/Permission.js";
// import Role from "../models/Role.js";

// export const checkPermission = asyncHandler(async (req, res, next) => {
//     const user = req.user;
//     const roleId = user.role;
//     const { moduleId, action, subModule } = req.body;
//     const role = await Role.findById(roleId);    
//     if (role.roleId == 1) {
//         return next();        
//     }
//     const permissions = await Permission.findOne({ userId: user._id });
//     const moduleData = await Module.findById(moduleId);
//     if (!moduleData) {
//        throw new apiError(statusCode.NOT_FOUND, "Module not found");
//     }

//     if (permissions[action]) {
//         if (subModule) {
//             if (permissions[subModule].action) {
//                return next();
//             }
//             throw new apiError(statusCode.UNAUTHORIZED, "User does not have permission to perform this action");
//         }
//         return next();
//     }
//     throw new apiError(statusCode.UNAUTHORIZED, "User does not have permission to perform this action");
// });

// export const adminPermission = asyncHandler(async (req, res, next) => {
//     const user = req.user;
//     const roleId = user.role;
//     const { userId } = req.body;
//     const adminRole = await Role.findById(roleId);
//     const userRole = await Role.findOne({ userId });

//     if (adminRole.roleId <= userRole.roleId) {
//         return next();
//     }
//     throw new apiError(statusCode.UNAUTHORIZED, "User does not have permission to perform this action");
// });
