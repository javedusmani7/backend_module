import logger from "../utils/logger.js";
import fs from "fs";
import path from "path";

export const errorHandlerWinston = (err, req, res, next) => {
  const logFile = path.join(process.cwd(), "logs", "error.log");

  console.log("Checking log file:", logFile);
  console.log("Log file exists?", fs.existsSync(logFile));

  logger.error({
    message: err.message,
    stack: err.stack,
    route: req.originalUrl,
    method: req.method,
  });

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};
