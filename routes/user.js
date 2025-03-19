import express from "express";
import { register, login, getRoles } from "../controllers/userController.js";
import { apiLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();
router.use(apiLimiter);

router.post("/register", register);
router.post("/login", login);
router.get("/roles/list", getRoles);

export default router;
