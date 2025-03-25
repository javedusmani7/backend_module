import express from "express";
import { createModule, createRole, deleteModule, deleteRole, getModules, getRoleByID, getRoles, updateModule, updatePermission, updateRole } from "../controllers/moduleController.js";
import { apiLimiter } from "../middlewares/rateLimiter.js";
import { verifyAdmin, verifyJWT } from "../middlewares/auth.js";

const router = express.Router();
router.use(apiLimiter);


router.post("/module",  createModule);
router.put("/module", verifyJWT, updateModule);
router.delete("/module", verifyJWT, deleteModule);
router.post("/getModule", verifyJWT, getModules);
router.post("/createRole", createRole);
router.post("/deleteRole", verifyJWT, deleteRole);
router.post("/getRole", verifyJWT, getRoles);
router.put("/updateRole", verifyJWT, verifyAdmin, updateRole);
router.put("/role/permission", verifyJWT, verifyAdmin, updatePermission);
router.post("/rolebyid", verifyJWT, getRoleByID);
export default router;

