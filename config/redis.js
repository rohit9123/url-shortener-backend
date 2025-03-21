// config/redisClient.js
const { createClient } = require('redis');

const redisClient = createClient();

redisClient.on('error', (err) => {
  console.error('❌ Redis Error:', err);
});

redisClient.on('connect', async () => {
  console.log('✅ Redis connected');

  try {
    // Set max memory limit (e.g., 512MB or adjust based on infra)
    await redisClient.configSet('maxmemory', '512mb');

    // Set eviction policy to allkeys-lru
    await redisClient.configSet('maxmemory-policy', 'allkeys-lru');

    console.log('🔧 Redis config set: 512MB maxmemory, allkeys-lru eviction policy');
  } catch (err) {
    console.error('❌ Redis config set failed:', err);
  }
});

// Connect Redis
redisClient.connect();

module.exports = redisClient;
