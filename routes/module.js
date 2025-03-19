import express from "express";
import { getModulesWithPermissions , updatePermissions   } from "../controllers/moduleController.js";
import { apiLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();
router.use(apiLimiter);

router.get("/get", getModulesWithPermissions);
router.post("/update", updatePermissions);

export default router;

