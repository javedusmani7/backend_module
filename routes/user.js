import express from "express";
import { register, login, getUsers, deleteUser, adminUpdateUser, getUserById, updateUser, addUser, getpartnerShipController } from "../controllers/userController.js";
import { apiLimiter } from "../middlewares/rateLimiter.js";
import moduleRoutes from "./module.js";
import { verifyAdmin, verifyJWT, verifyPermission } from "../middlewares/auth.js";

const router = express.Router();
router.use(apiLimiter);

router.post("/", verifyJWT, getUsers);
router.post("/delete", verifyJWT, verifyPermission, deleteUser);
router.post("/register", register);
router.post("/login", login);
router.post('/update/updatebyadmin',verifyJWT, verifyPermission, adminUpdateUser);
router.get("/getloginuser", verifyJWT, getUserById);
router.post("/updateuser", verifyJWT, updateUser);
//Add New user
router.post("/adduser", verifyJWT, addUser);
router.get("/get_partnerShip", getpartnerShipController);
router.use(moduleRoutes);

export default router;
