import express from "express";
import { register, login, getRoles } from "../controllers/userController.js";
import { apiLimiter } from "../middlewares/rateLimiter.js";
import moduleRoutes from "./module.js";

const router = express.Router();
router.use(apiLimiter);

router.post("/register", register);
router.post("/login", login);
router.get("/roles/list", getRoles);
router.use(moduleRoutes);

export default router;
