import express from "express";
import { register, login, getUsers, deleteUser } from "../controllers/userController.js";
import { apiLimiter } from "../middlewares/rateLimiter.js";
import moduleRoutes from "./module.js";
import { verifyJWT } from "../middlewares/auth.js";

const router = express.Router();
router.use(apiLimiter);

router.get("/", verifyJWT, getUsers);
router.post("/delete", verifyJWT, deleteUser);
router.post("/register", register);
router.post("/login", login);
router.use(moduleRoutes);

export default router;
