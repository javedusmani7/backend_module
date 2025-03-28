import express from "express";
import { apiLimiter } from "../middlewares/rateLimiter.js";
import { createLevel, deleteLevelById, getAllLevel } from "../controllers/levelController.js";
import { verifyJWT } from "../middlewares/auth.js";

const router = express.Router();
router.use(apiLimiter);

router.post("/createLevel",verifyJWT,createLevel);
router.get('/getLevel', verifyJWT, getAllLevel);
router.post('/deleteLevel',verifyJWT, deleteLevelById);

export default router;
