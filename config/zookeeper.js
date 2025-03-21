require('dotenv').config();
const zookeeper = require('node-zookeeper-client');

const zkConnectionString = process.env.ZOOKEEPER_HOST || 'localhost:2181';
const zkClient = zookeeper.createClient(zkConnectionString);

zkClient.on('connected', () => {
  console.log('✅ Zookeeper connected');
});

zkClient.on('error', (err) => {
  console.error('❌ Zookeeper Error:', err);
});


const connectZookeeper = () => {
  return new Promise((resolve, reject) => {
    zkClient.once('connected', () => {
      console.log('✅ Zookeeper connected');
      resolve();
    });

    zkClient.connect();

    // Fallback timeout in case Zookeeper never connects
    setTimeout(() => {
      reject(new Error('❌ Zookeeper connection timeout'));
    }, 10000);
  });
};

const generateUniqueId = () => {
  console.log('⚙️ Calling generateUniqueId...');
  return new Promise((resolve, reject) => {
    const path = '/url-';

    zkClient.create(
      path,
      Buffer.from(''),
      zookeeper.CreateMode.EPHEMERAL_SEQUENTIAL,
      (err, fullPath) => {
        if (err) {
          console.error('❌ Error creating node:', err);
          return reject(err);
        }

        const sequenceId = parseInt(fullPath.replace('/url-', ''), 10);
        resolve(sequenceId);
      }
    );
  });
};

module.exports = {
  zkClient,
  connectZookeeper,
  generateUniqueId,
};
