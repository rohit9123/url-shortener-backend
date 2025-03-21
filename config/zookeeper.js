// config/zookeeper.js

const zookeeper = require('node-zookeeper-client');

const zkClient = zookeeper.createClient('localhost:2181');

zkClient.once('connected', () => {
  console.log('✅ Connected to Zookeeper');
});

zkClient.connect();

/**
 * Generates a unique sequential ID using Zookeeper.
 * Creates a node like /url-00000001, /url-00000002, etc.
 */
const generateUniqueId = () => {
  return new Promise((resolve, reject) => {
    const path = '/url-';

    zkClient.create(path, Buffer.from(''), zookeeper.CreateMode.EPHEMERAL_SEQUENTIAL, (err, fullPath) => {
      if (err) {
        return reject(err);
      }

      // Extract numeric part from fullPath (e.g., /url-00000017 => 17)
      const sequenceId = parseInt(fullPath.replace('/url-', ''), 10);
      resolve(sequenceId);
    });
  });
};

module.exports = {
  zkClient,
  generateUniqueId,
};
