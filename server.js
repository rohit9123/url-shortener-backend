const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { createZookeeperClients } = require('./config/zookeeper');
const { initializeZNodes } = require('./services/zookeeperService');
const redisClient = require('./config/redis');

dotenv.config();
const app = express();

async function startServer() {
  try {
    // Database initialization
    require('./config/db')();

    // Middleware
    app.use(cors());
    app.use(express.json());

    // Routes
    app.use('/api', require('./routes/urlRoutes'));

    // Zookeeper initialization
    await createZookeeperClients();
    await initializeZNodes();
    
    // Server start
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Gracefully shutting down...');
      await redisClient.quit();
      getConnectedClients().forEach(({ client }) => client.close());
      process.exit(0);
    });
  } catch (err) {
    console.error('❌ Startup error:', err);
    process.exit(1);
  }
}

startServer();