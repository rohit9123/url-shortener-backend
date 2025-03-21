// server.js
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const urlRoutes = require('./routes/urlRoutes');
const { connectZookeeper, zkClient } = require('./config/zookeeper');
const redisClient = require('./config/redis');

dotenv.config();
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', urlRoutes);

// Connect Zookeeper ONCE
connectZookeeper();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Graceful Shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Gracefully shutting down...');
  try {
    await redisClient.quit();
    zkClient.close();
  } catch (err) {
    console.error('❌ Error during shutdown:', err);
  }
  process.exit(0);
});