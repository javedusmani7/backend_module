import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 1000, // 1 secoond
  max: 100,  // Limit each IP to 5 requests per windowMs
  message: {
    message: 'Too many requests from this IP, please try again after 1 second',
  },
});
