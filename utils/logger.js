import winston from 'winston';
import 'winston-daily-rotate-file';
import dotenv from 'dotenv';
import { isLoggerEnabled } from '../controllers/loggerToggle.controller.js';
dotenv.config();

const { format, transports } = winston;

const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf(({ level, message, timestamp }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
);

// Core Winston logger with all transports always attached
const internalLogger = winston.createLogger({
  levels: { error: 0, warn: 1, info: 2, http: 3, debug: 4 },
  level: 'debug',
  format: logFormat,
  transports: [
    new transports.Console({
      format: format.combine(format.colorize({ all: true }), logFormat)
    }),
    new transports.DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '14d'
    }),
    new transports.DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d'
    }),
    new transports.DailyRotateFile({
      filename: 'logs/slowQuery-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'warn',
      maxFiles: '30d'
    })
  ],
  exceptionHandlers: [new transports.File({ filename: 'logs/exceptions.log' })],
  rejectionHandlers: [new transports.File({ filename: 'logs/rejections.log' })]
});

// Logger wrapper
const logger = {
  log: (level, message) => {
    if (isLoggerEnabled()) {
      internalLogger.log(level, message);
    }
  },
  error: (message) => logger.log('error', message),
  warn: (message) => logger.log('warn', message),
  info: (message) => logger.log('info', message),
  http: (message) => logger.log('http', message),
  debug: (message) => logger.log('debug', message)
};

// Slow query logger
const slowQueryLogger = {
  warn: (message) => {
    if (isLoggerEnabled()) {
      internalLogger.log('warn', `[SLOW QUERY] ${message}`);
    }
  }
};

const SLOW_QUERY_THRESHOLD = parseInt(process.env.SLOW_QUERY_THRESHOLD, 10) || 1000;

export const trackQueryTime = async (queryFunction, functionName, metadata = {}) => {
  const start = process.hrtime();

  try {
    const result = await queryFunction();
    const [seconds, nanoseconds] = process.hrtime(start);
    const executionTime = (seconds * 1000) + (nanoseconds / 1e6);

    if (executionTime > SLOW_QUERY_THRESHOLD) {
      slowQueryLogger.warn(JSON.stringify({
        function: functionName,
        executionTime: `${executionTime.toFixed(2)}ms`,
        metadata,
        apiInfo: metadata.apiInfo || {},
        timestamp: new Date().toISOString()
      }));
    }

    return result;
  } catch (error) {
    logger.error(`Error in ${functionName}: ${error.message}`);
    throw error;
  }
};

// Request logger middleware
export const requestLogger = (req, res, next) => {
  req.startTime = process.hrtime();
  logger.http(`Incoming request: ${req.method} ${req.originalUrl} from ${req.ip}`);
  next();
};

// Response logger middleware
export const responseLogger = (req, res, next) => {
  res.on("finish", () => {
    if (!req.startTime) return;

    const [seconds, nanoseconds] = process.hrtime(req.startTime);
    const responseTime = (seconds * 1000) + (nanoseconds / 1e6);

    logger.info(`Response Sent: [${res.statusCode}] ${req.method} ${req.originalUrl} - ${responseTime.toFixed(2)}ms`);

    if (responseTime > SLOW_QUERY_THRESHOLD) {
      slowQueryLogger.warn(JSON.stringify({
        method: req.method,
        url: req.originalUrl,
        responseTime: `${responseTime.toFixed(2)}ms`,
        statusCode: res.statusCode,
        timestamp: new Date().toISOString()
      }));
    }
  });

  next();
};

export default logger;
export { slowQueryLogger, SLOW_QUERY_THRESHOLD };
