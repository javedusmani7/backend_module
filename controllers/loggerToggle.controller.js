import dotenv from 'dotenv';
dotenv.config();
let loggerEnabled = process.env.LOGGER_ENABLED === 'true';

export const toggleLogger = (req, res) => {
  loggerEnabled = !loggerEnabled;
  res.json({ message: `Logger is now ${loggerEnabled ? 'ENABLED' : 'DISABLED'}` });
};

export const isLoggerEnabled = () => loggerEnabled;