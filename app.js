import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { corsOptions } from './config/config.js';
import { connectDB } from './config/db.js';
import userRoutes from "./routes/user.js";
import levelRoutes from "./routes/level.js"
import { errorHandler } from './utils/asyncHandler.js';
import responseEncrypt from './middlewares/responseEncrypt.js';
import logger from './logger.js';
import { requestLogger, responseLogger } from './logger.js';


dotenv.config();

connectDB()
  .then(() => logger.info("Database Connected Successfully"))
  .catch(err => logger.error(`Database Connection Error: ${err.message}`));

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(responseEncrypt);

app.use(requestLogger);  // Request Logging
app.use(responseLogger); // Response Logging

app.use("/api/users", userRoutes);
app.use("/api/level",levelRoutes);
app.use(errorHandler); 

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});