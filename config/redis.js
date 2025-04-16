const { createClient } = require('redis');

class RedisClient {
  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL, // Use full Upstash URL from environment
      socket: {
        tls: true, // Required for Upstash
        rejectUnauthorized: false, // For self-signed certs (use true in production)
        connectTimeout: 10000,
        reconnectStrategy: (retries) => {
          console.log(`♻️ Redis reconnecting (attempt ${retries + 1})`);
          return Math.min(retries * 500, 5000);
        }
      }
    });

    this.isConnected = false;
    
    this.client
      .on('connect', () => {
        console.log('🔌 Redis connection established');
        this.isConnected = true;
      })
      .on('ready', () => console.log('✅ Redis ready'))
      .on('error', (err) => {
        console.error('❌ Redis error:', err);
        this.isConnected = false;
      })
      .on('end', () => {
        console.log('🔴 Redis connection closed');
        this.isConnected = false;
      });

    // Auto-connect on initialization
    this.connect().catch(console.error);
  }

  async connect() {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
  }

  async get(key) {
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error('GET error:', error);
      throw error;
    }
  }

  
  async set(key, value, options = {}) {
  try {
    return await this.client.set(key, value, options);
  } catch (error) {
    console.error('SET error:', error);
    throw error;
  }
}	

  async healthCheck() {
    try {
      await this.client.ping();
      return true;
    } catch (error) {
      return false;
    }
  }

  async quit() {
    if (this.client.isOpen) {
      await this.client.quit();
    }
  }

  get status() {
    return this.isConnected ? 'connected' : 'disconnected';
  }
}

module.exports = new RedisClient();
