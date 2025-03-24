import express from "express";
import { createModule, createRole, deleteModule, deleteRole, getModules, getRoleByID, getRoles, updateModule, updatePermission, updateRole } from "../controllers/moduleController.js";
import { apiLimiter } from "../middlewares/rateLimiter.js";
import { verifyAdmin, verifyJWT } from "../middlewares/auth.js";

const router = express.Router();
router.use(apiLimiter);


router.post("/module", verifyJWT, createModule);
router.put("/module", verifyJWT, updateModule);
router.delete("/module", verifyJWT, deleteModule);
router.get("/module", verifyJWT, getModules);
router.post("/role", createRole);
router.delete("/role", verifyJWT, verifyAdmin, deleteRole);
router.get("/role", verifyJWT, getRoles);
router.put("/role", verifyJWT, verifyAdmin, updateRole);
router.put("/role/permission", verifyJWT, verifyAdmin, updatePermission);
router.post("/rolebyid", verifyJWT, getRoleByID);
export default router;

