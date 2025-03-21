import express from "express";
import { createModule, createRole, deleteModule, deleteRole, getModules, updateModule   } from "../controllers/moduleController.js";
import { apiLimiter } from "../middlewares/rateLimiter.js";
import { verifyJWT } from "../middlewares/auth.js";

const router = express.Router();
router.use(apiLimiter);


router.post("/module",createModule);
router.put("/module",updateModule);
router.delete("/module",deleteModule);
router.get("/module",getModules);
router.post("/role",createRole);
router.delete("/role/:roleId", deleteRole);

export default router;

