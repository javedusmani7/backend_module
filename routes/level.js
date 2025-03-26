import express from "express";
import { apiLimiter } from "../middlewares/rateLimiter.js";
import { createLevel, deleteLevelById, getAllLevel } from "../controllers/levelController.js";

const router = express.Router();
router.use(apiLimiter);

router.post("/createLevel",createLevel);
router.get('/getLevel',getAllLevel);
router.post('/deleteLevel', deleteLevelById);

export default router;
