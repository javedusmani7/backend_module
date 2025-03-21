import express from "express";
import { getModulesWithPermissions , updatePermissions   } from "../controllers/moduleController.js";
import { apiLimiter } from "../middlewares/rateLimiter.js";
import { verifyJWT } from "../middlewares/auth.js";
import { adminPermission, checkPermission } from "../middlewares/checkPermission.js";

const router = express.Router();
router.use(apiLimiter);

router.get("/role/permissions", verifyJWT, getModulesWithPermissions);
router.post("/role/permissions", verifyJWT,updatePermissions);


export default router;

