// services/redisService.js
const redisClient = require('../config/redis');

const CACHE_EXPIRY_SECONDS = 3600; // 1 hour (adjust as needed)

/**
 * Get a value from Redis cache by key.
 * If not found, returns null.
 */

const getFromCache = async (key) => {
  try {
    const data = await redisClient.get(key);
    // Return raw string instead of parsing JSON
    return data || null;
  } catch (err) {
    console.error('❌ Redis Get Error:', err);
    return null;
  }
};

/**
 * Set a value into Redis cache.
 * Automatically expires after CACHE_EXPIRY_SECONDS.
 */

const setToCache = async (key, value) => {
  try {
    // Store as raw string instead of JSON
    await redisClient.set(key, value, {
      EX: CACHE_EXPIRY_SECONDS
    });
  } catch (err) {
    console.error('❌ Redis Set Error:', err);
  }
};
/**
 * Delete a value from cache by key.
 */
const deleteFromCache = async (key) => {
  try {
    await redisClient.del(key);
  } catch (err) {
    console.error('❌ Redis Delete Error:', err);
  }
};

module.exports = {
  getFromCache,
  setToCache,
  deleteFromCache,
};
