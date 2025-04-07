import express from 'express';
import { toggleLogger } from '../controllers/loggerToggle.controller.js';

const router = express.Router();
router.post('/toggle', toggleLogger);

export default router;