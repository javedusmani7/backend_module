import winston from "winston";
import path from "path";
import fs from "fs";

// Ensure logs directory exists
const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Check if the file exists, create it if not
const errorLogPath = path.join(logDir, "error.log");
if (!fs.existsSync(errorLogPath)) {
  fs.writeFileSync(errorLogPath, "", { mode: 0o666 }); // Read & Write permission
}

// Create Winston logger
const logger = winston.createLogger({
  level: "error",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({ format: winston.format.simple() }),
    new winston.transports.File({ filename: errorLogPath }),
  ],
});

export default logger;
