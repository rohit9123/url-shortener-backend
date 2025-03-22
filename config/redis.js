// config/redisClient.js
require('dotenv').config();
const { createClient } = require('redis');

// Use host and port from .env if provided
const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
});

redisClient.on('error', (err) => {
  console.error('❌ Redis Error:', err);
});

redisClient.on('connect', async () => {
  console.log('✅ Redis connected');
  

  try {
    console.log('🔧 Redis config set: 512MB maxmemory, allkeys-lru eviction policy');
  } catch (err) {
    console.error('❌ Redis config set failed:', err);
  }
});

// Connect Redis
redisClient.connect();

module.exports = redisClient;
