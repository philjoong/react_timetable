const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const redis = require('redis');
const { promisify } = require('util');

const app = express();
const port = 3002;
const host = process.env.REDIS_HOST;
console.log("Using Redis host:", process.env.REDIS_HOST);
const client = redis.createClient({ host: host, port:6379 });
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

app.use(bodyParser.json());
app.use(cors());

// let servers = [
//   {
//     id: 1,
//     name: 'Server 1',
//     schedule: [],
//   },
//   {
//     id: 2,
//     name: 'Server 2',
//     schedule: [],
//   },
// ];

client.on('error', (err) => {
  console.log(`Connected to Redis server at ${client.options.host} >>> error`,  err);
});

client.connect().catch(err => {
  console.error('Failed to connect to Redis server', err);
});


// /api/data endpoint: return server data
app.get('/api/data', async (req, res) => {
  try {
    const servers = await getAsync('servers');
    res.json(JSON.parse(servers || '[]'));
  } catch (err) {
    res.status(500).json({ message: 'Error fetching from Redis', error: err.message });
  }
});

// /api/update 엔드포인트: 서버 데이터 업데이트
app.post('/api/update', async (req, res) => {
  const newServer = req.body;
  try {
    let servers = await getAsync('servers');
    servers = JSON.parse(servers || '[]');

    // 서버 ID를 기준으로 기존 데이터를 찾아 업데이트
    const updatedServers = servers.map(server => (server.id === newServer.id ? newServer : server));
    await setAsync('servers', JSON.stringify(updatedServers));
    res.json(updatedServers);
  } catch (err) {
    res.status(500).json({ message: 'Error updating Redis', error: err.message });
  }
});

// 새로운 서버 정보 추가
app.post('/api/servers', async (req, res) => {
  const { id, name } = req.body;
  try {
    let servers = await getAsync('servers');
    servers = JSON.parse(servers || '[]');
    servers.push({ id, name, schedule: [] });
    await setAsync('servers', JSON.stringify(servers));
    res.status(201).json(servers);
  } catch (err) {
    res.status(500).json({ message: 'Error adding to Redis', error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at ${port}`);
});
