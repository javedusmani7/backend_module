import { Role } from "../models/role.model";
import { Permission } from "../models/permission.model";
import { Module } from "../models/module.model";
import { apiError } from "../utils/apiError";
import { statusCode } from "../config/config";
import { asyncHandler } from "../utils/asyncHandler";

export const checkPermission = asyncHandler(async(req, res, next) => {
    const user = req.user;
    const roleId = user.role;
    const { moduleId, action, subModule } = req.body;
    const role = await Role.findById(roleId);
    if(role.roleId === 1) {
        return next();
    }
    const permissions = await Permission.findOne({userId: user._id});
    const moduleData = await Module.findById(moduleId);
    if (!moduleData) {
        return next(new apiError(statusCode.NOT_FOUND, "Module not found"));
    }
    if (subModule) {
        if (permissions[subModule].action){
            next();
        }
        return next(new apiError(statusCode.UNAUTHORIZED, "Module not found"));
    }
    
    next();
});