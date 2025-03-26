import winston from 'winston';
import 'winston-daily-rotate-file';

const { format, transports } = winston;

// Custom log format
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf(({ level, message, timestamp }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
);

// Winston Logger Setup
const logger = winston.createLogger({
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3, 
    debug: 4
  },
  level: 'debug',
  format: logFormat,
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize({ all: true }),
        logFormat
      )
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
  exceptionHandlers: [
    new transports.File({ filename: 'logs/exceptions.log' })
  ],
  rejectionHandlers: [
    new transports.File({ filename: 'logs/rejections.log' })
  ]
});

// Middleware to log HTTP requests
export const requestLogger = (req, res, next) => {
  logger.http(`Incoming request: ${req.method} ${req.originalUrl} from ${req.ip}`);
  next();
};

// Middleware to log HTTP responses
export const responseLogger = (req, res, next) => {
  const originalSend = res.send;

  res.send = function (body) {
    let responseMessage = "";

    if (typeof body === "string") {
      responseMessage = body;
    } else if (typeof body === "object" && body !== null) {
      responseMessage = body.message || "No message in response";
    }

    logger.info(`Response Sent: [${res.statusCode}] ${req.method} ${req.originalUrl}`);
    logger.info(`Response Message: ${responseMessage}`);

    return originalSend.call(this, body);
  };

  next();
};

export default logger;
