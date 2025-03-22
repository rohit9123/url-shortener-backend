// middlewares/tokenBucketRateLimiter.js
const redisClient = require('../config/redis');

const MAX_TOKENS = 5;
const REFILL_INTERVAL_SECONDS = 60 * 12; // 12 minutes
const REFILL_RATE = 1 / REFILL_INTERVAL_SECONDS; // Tokens per second

const tokenBucketRateLimiter = async (req, res, next) => {
  try {
    const userKey = req.ip;
    const tokensKey = `bucket:tokens:${userKey}`;
    const timestampKey = `bucket:lastRefill:${userKey}`;

    // 1. Get current values with debug logging
    const [tokensStored, lastRefillStored] = await redisClient.mGet(tokensKey, timestampKey);
    console.log('🔍 Initial Redis Values:', { tokensStored, lastRefillStored });

    // 2. Calculate token replenishment
    const now = Math.floor(Date.now() / 1000);
    let tokens = parseFloat(tokensStored) || MAX_TOKENS;
    let lastRefill = parseInt(lastRefillStored) || now;

    // 3. Calculate time-based token replenishment
    const secondsPassed = now - lastRefill;
    const tokensToAdd = secondsPassed * REFILL_RATE;
    tokens = Math.min(MAX_TOKENS, tokens + tokensToAdd);
    lastRefill = tokensToAdd > 0 ? now : lastRefill; // Only update refill time if tokens were added

    console.log(`➡ Pre-check | Tokens: ${tokens.toFixed(3)} | Last Refill: ${lastRefill} | Now: ${now}`);

    // 4. Check token availability
    if (tokens < 1) {
      const nextRefillIn = Math.ceil((1 - tokens) / REFILL_RATE);
      return res.status(429).json({
        success: false,
        message: `Rate limit exceeded. Try again after ${nextRefillIn} seconds.`,
      });
    }

    // 5. Update token count atomically
    tokens -= 1;
    const multi = redisClient.multi();
    multi.set(tokensKey, tokens.toFixed(6));
    multi.set(timestampKey, lastRefill.toString()); // Use calculated lastRefill, not current time
    
    const result = await multi.exec();
    console.log('✅ Token consumed. New state:', {
      tokens: tokens.toFixed(3),
      lastRefill,
      redisResult: result
    });

    next();
  } catch (err) {
    console.error('❌ Rate Limiter Error:', err.stack);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

module.exports = tokenBucketRateLimiter;