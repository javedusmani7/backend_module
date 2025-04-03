import winston from 'winston';
import 'winston-daily-rotate-file';
import dotenv from 'dotenv';
dotenv.config();

const { format, transports } = winston;

// Log format
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf(({ level, message, timestamp }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
);

// Main logger
const logger = winston.createLogger({
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
    })
  ],
  exceptionHandlers: [new transports.File({ filename: 'logs/exceptions.log' })],
  rejectionHandlers: [new transports.File({ filename: 'logs/rejections.log' })]
});

// Slow Query Logger
const slowQueryLogger = winston.createLogger({
  level: 'warn',  // Ensure warning level logs are captured
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp }) => {
          return `[${timestamp}] ${level}: ${message}`;
        })
      )
    }),
    new winston.transports.DailyRotateFile({
      filename: 'logs/slowQuery-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d'
    })
  ]
});

// Slow Query Threshold (Default: 1 second)
const SLOW_QUERY_THRESHOLD = parseInt(process.env.SLOW_QUERY_THRESHOLD, 10) || 1000;

export const trackQueryTime = async (queryFunction, functionName, metadata = {}) => {
  console.log(`i am in trackQueryTime`);
  const start = process.hrtime();

  try {
    const result = await queryFunction();
    const [seconds, nanoseconds] = process.hrtime(start);
    const executionTime = (seconds * 1000) + (nanoseconds / 1e6); // Convert to milliseconds

    if (executionTime > (global.SLOW_QUERY_THRESHOLD || 1000)) { // Default to 1 second if not set
      if (typeof slowQueryLogger !== "undefined") {
        slowQueryLogger.warn(JSON.stringify({
          function: functionName,
          executionTime: `${executionTime.toFixed(2)}ms`,
          metadata,
          apiInfo: metadata.apiInfo || {},
          timestamp: new Date().toISOString()
        }));
      } else {
        console.warn(`[Slow Query] ${functionName} took ${executionTime.toFixed(2)}ms`);
      }
    }

    return result;
  } catch (error) {
    if (typeof logger !== "undefined") {
      logger.error(`Error in ${functionName}: ${error.message}`);
    } else {
      console.error(`Error in ${functionName}: ${error.message}`);
    }
    throw error;
  }
};

//Middleware to log incoming requests
export const requestLogger = (req, res, next) => {
  req.startTime = process.hrtime(); 
  logger.http(`Incoming request: ${req.method} ${req.originalUrl} from ${req.ip}`);
  next();
};

//Middleware to log responses and slow queries
export const responseLogger = (req, res, next) => {
  res.on("finish", () => { 
    if (!req.startTime) return;
    
    const [seconds, nanoseconds] = process.hrtime(req.startTime);
    const responseTime = (seconds * 1000) + (nanoseconds / 1e6); // Convert to milliseconds

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
