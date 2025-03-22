const zookeeper = require('node-zookeeper-client');

const MAX_RETRIES = 15;
const RETRY_INTERVAL = 5000;
const zookeeperClients = [];

function getConnectedClients() {
  return zookeeperClients.filter(client => 
    client.client.getState() === zookeeper.State.SYNC_CONNECTED
  );
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function verifyZookeeperWrite(client) {
  return new Promise((resolve, reject) => {
    const testPath = `/connection-test-${Date.now()}`;
    client.create(
      testPath,
      Buffer.from('test'),
      zookeeper.CreateMode.EPHEMERAL,
      (err) => {
        client.remove(testPath, -1, () => {});
        err ? reject(err) : resolve();
      }
    );
  });
}

async function createZookeeperClients() {
  try {
    const zkUrls = process.env.ZOOKEEPER_URLS?.split(',') || [];
    console.log('➡ Starting Zookeeper client creation...');

    for (const [index, zkUrl] of zkUrls.entries()) {
      const clientId = `zk-client-${index + 1}`;
      let client;
      let connected = false;

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          client = zookeeper.createClient(zkUrl.trim(), {
            sessionTimeout: 30000,
            retries: 5,
            spinDelay: 1000
          });

          client.on('state', state => {
            console.log(`🔌 ${clientId} connection state: ${state}`);
            if (state === zookeeper.State.EXPIRED) {
              console.error(`❌ ${clientId} session expired!`);
            }
          });

          await new Promise((resolve, reject) => {
            client.once('connected', async () => {
              console.log(`✅ ${clientId} connected to ${zkUrl}`);
              try {
                await verifyZookeeperWrite(client);
                connected = true;
                resolve();
              } catch (err) {
                reject(err);
              }
            });

            client.once('error', err => {
              console.error(`❌ ${clientId} connection error:`, err.message);
              reject(err);
            });

            client.connect();

            setTimeout(() => {
              if (!connected) reject(new Error('Connection timeout'));
            }, RETRY_INTERVAL);
          });

          zookeeperClients.push({ client, clientId });
          break;
        } catch (err) {
          console.warn(`⚠ ${clientId} attempt ${attempt} failed: ${err.message}`);
          if (attempt === MAX_RETRIES) {
            throw new Error(`${clientId} failed after ${MAX_RETRIES} attempts`);
          }
          await delay(RETRY_INTERVAL);
        }
      }
    }
    console.log('✅ All Zookeeper clients initialized');
  } catch (err) {
    console.error('❌ Critical Zookeeper initialization error:', err.stack);
    process.exit(1);
  }
}

module.exports = { createZookeeperClients, getConnectedClients };