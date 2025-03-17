const { RateLimiterMemory } = require('rate-limiter-flexible');

const rateLimiter = new RateLimiterMemory({
  points: 5, // 5 requests
  duration: 1, // per second
});

const rateLimit = async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip); // Consume 1 point per request based on IP
    next();
  } catch (rejRes) {
    res.status(429).json({ message: 'Too many requests, please try again later.' });
  }
};

module.exports = rateLimit;
