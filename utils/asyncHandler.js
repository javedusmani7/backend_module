import mongoose from "mongoose";
import logger from "../logger.js"

const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
      Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
    };
  };
  
  export const errorHandler = (err, req, res, next) => {  
      let statusCode = err.statusCode || 500;
      let message = err.message || "Internal Server Error";
  
      if (err instanceof mongoose.Error.CastError) {
          statusCode = 400;
          message = `Invalid ${err.path}: ${err.value}`;
      }
  
      logger.error(`Error: ${message} | Status: ${statusCode} | URL: ${req.originalUrl}`);
  
      res.status(statusCode).json({
          success: false,
          message,
          error: err.name || "Error",
          stack: process.env.NODE_ENV === "development" ? err.stack : undefined, 
      });
  };
  
  export { asyncHandler };