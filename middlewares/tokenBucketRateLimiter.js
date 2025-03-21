// middlewares/tokenBucketRateLimiter.js
const redisClient = require('../config/redisClient');

const MAX_TOKENS = 5;
const REFILL_INTERVAL_SECONDS = 60 * 12; // 1 token every 12 mins
const REFILL_RATE = 1 / REFILL_INTERVAL_SECONDS; // tokens per second

const tokenBucketRateLimiter = async (req, res, next) => {
  try {
    const userKey = req.ip; // Or req.user.id for authenticated users

    const tokensKey = `bucket:tokens:${userKey}`;
    const timestampKey = `bucket:lastRefill:${userKey}`;

    // Get current token count and last refill time
    let [tokens, lastRefill] = await redisClient.mGet(tokensKey, timestampKey);

    const now = Math.floor(Date.now() / 1000); // current time in seconds

    tokens = parseFloat(tokens) || MAX_TOKENS;
    lastRefill = parseInt(lastRefill) || now;

    // Calculate time passed and refill tokens
    const secondsPassed = now - lastRefill;
    const tokensToAdd = secondsPassed * REFILL_RATE;

    tokens = Math.min(MAX_TOKENS, tokens + tokensToAdd);
    const tokensLeft = Math.floor(tokens);

    if (tokensLeft < 1) {
      const nextRefillIn = Math.ceil((1 - tokens) / REFILL_RATE);
      return res.status(429).json({
        success: false,
        message: `Rate limit exceeded. Try again after ${nextRefillIn} seconds.`,
      });
    }

    // Consume a token
    tokens = tokens - 1;

    // Save updated values back to Redis
    await redisClient.multi()
      .set(tokensKey, tokens)
      .set(timestampKey, now)
      .exec();

    next();
  } catch (err) {
    console.error('Token Bucket Limiter Error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = tokenBucketRateLimiter;
