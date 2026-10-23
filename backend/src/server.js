require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const { WebSocketServer } = require('ws');

const db = require('./config/db');
const { initKafka } = require('./config/kafka');
const { initRabbitMQ } = require('./config/rabbitmq');
const rabbitWorkers = require('./services/rabbitWorkers');
const { processKafkaMessage } = require('./services/kafkaBridge');
const eventBus = require('./services/eventBus');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mount API routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString()
  });
});

// Create HTTP server
const server = http.createServer(app);

// Setup WebSocket server
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  eventBus.registerWsClient(ws);
});

async function startServer() {
  server.listen(PORT, async () => {
    console.log(`====================================================`);
    console.log(`🚀 Kafka + RabbitMQ Full-Stack Backend Online!`);
    console.log(`📡 HTTP Server running on: http://localhost:${PORT}`);
    console.log(`⚡ WebSocket Server active on: ws://localhost:${PORT}`);
    console.log(`====================================================`);

    // 1. Initialize Cloud DB
    await db.initDb();

    // 2. Initialize Kafka Consumer
    await initKafka(processKafkaMessage);

    // 3. Initialize RabbitMQ Workers
    await initRabbitMQ({
      PAYMENT: rabbitWorkers.handlePaymentWorker,
      INVENTORY: rabbitWorkers.handleInventoryWorker,
      NOTIFICATION: rabbitWorkers.handleNotificationWorker
    });
  });
}

startServer();
