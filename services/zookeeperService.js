const { getConnectedClients } = require('../config/zookeeper');

const ZOOKEEPER_OFFSETS = [1000000, 2000000];
const COUNTER_PATHS = ['/counter/node1', '/counter/node2'];
const MAX_SEQUENCE = 999999;

async function ensureZNodeExists(client, path, initialData = '0') {
  return new Promise((resolve, reject) => {
    client.exists(path, (err, stat) => {
      if (err) return reject(err);

      if (stat) return resolve();

      client.create(
        path,
        Buffer.from(initialData),
        zookeeper.CreateMode.PERSISTENT,
        (createErr) => {
          if (createErr?.code === -110) return resolve(); // Node exists
          if (createErr) return reject(createErr);
          resolve();
        }
      );
    });
  });
}

async function initializeZNodes() {
  const clients = getConnectedClients();
  if (!clients.length) throw new Error('No Zookeeper clients available');

  for (const [index, { client }] of clients.entries()) {
    try {
      await ensureZNodeExists(client, '/counter');
      await ensureZNodeExists(client, COUNTER_PATHS[index], '0');
    } catch (err) {
      console.error(`❌ ZNode initialization failed for client ${index + 1}:`, err);
      throw err;
    }
  }
}

function getAndIncrement(client, path, offset) {
  return new Promise((resolve, reject) => {
    client.getData(path, (err, data, stat) => {
      if (err) return reject(err);

      const current = parseInt(data.toString(), 10) || 0;
      if (current > MAX_SEQUENCE) return reject(new Error('Sequence overflow'));

      client.setData(
        path,
        Buffer.from(String(current + 1)),
        stat.version,
        (setErr) => {
          if (setErr) return reject(setErr);
          resolve(offset + current + 1);
        }
      );
    });
  });
}

async function generateUniqueId() {
  const clients = getConnectedClients();
  if (!clients.length) throw new Error('No Zookeeper clients available');

  const attempts = new Set();
  const errors = [];

  while (attempts.size < clients.length) {
    const index = Math.floor(Math.random() * clients.length);
    if (attempts.has(index)) continue;

    const { client } = clients[index];
    try {
      return await getAndIncrement(
        client,
        COUNTER_PATHS[index],
        ZOOKEEPER_OFFSETS[index]
      );
    } catch (err) {
      attempts.add(index);
      errors.push(`Client ${index + 1}: ${err.message}`);
    }
  }

  throw new Error(`All nodes failed: ${errors.join('; ')}`);
}

module.exports = { initializeZNodes, generateUniqueId };