import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { corsOptions } from './config/config.js';
import { connectDB } from './config/db.js';
import userRoutes from "./routes/user.js";
import levelRoutes from "./routes/level.js";
import loggerRoutes from "./routes/loggerRoutes.js";
import { errorHandler } from './utils/asyncHandler.js';
import responseEncrypt from './middlewares/responseEncrypt.js';
import logger, { requestLogger, responseLogger } from "./utils/logger.js"; 

dotenv.config(); 

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(requestLogger); // Log requests sabse upar 
app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(responseEncrypt); // Uncomment if needed

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/level", levelRoutes);
app.use("/api/logger", loggerRoutes);

// Response Logger (should be after routes)
app.use(responseLogger);

// Global Error Handler
app.use(errorHandler);


connectDB()
  .then(() => {
    logger.info("Database Connected Successfully");

    app.listen(PORT, () => {
      logger.info(` Server is running on port ${PORT}`);
    }).on('error', (err) => {
      logger.error(`Server failed to start: ${err.message}`);
    });
  })
  .catch(err => {
    logger.error(`Database Connection Error: ${err.message}`);
    process.exit(1); 
  });
