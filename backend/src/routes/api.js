const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { publishOrderToKafka, getKafkaStatus } = require('../config/kafka');
const { getRabbitStatus } = require('../config/rabbitmq');
const { processKafkaMessage } = require('../services/kafkaBridge');
const eventBus = require('../services/eventBus');

const router = express.Router();

// System health and connection statuses
router.get('/status', (req, res) => {
  res.json({
    kafka: getKafkaStatus(),
    rabbitmq: getRabbitStatus(),
    database: db.getStatus(),
    stats: eventBus.stats
  });
});

// Update or test Cloud Database connection
router.post('/config/db', async (req, res) => {
  const { databaseUrl } = req.body;
  if (!databaseUrl) {
    return res.status(400).json({ error: 'databaseUrl is required' });
  }

  process.env.DATABASE_URL = databaseUrl;
  await db.initDb(databaseUrl);
  res.json({
    message: 'Database connection updated',
    status: db.getStatus()
  });
});

// Fetch recent orders from DB
router.get('/orders', async (req, res) => {
  try {
    const orders = await db.getOrders(50);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch recent logs
router.get('/logs', (req, res) => {
  res.json(eventBus.logs);
});

// Single Order Creation (Ingested via Kafka)
router.post('/orders', async (req, res) => {
  try {
    const { customerName, item, amount, quantity, forceFail } = req.body;

    const orderId = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
    const orderPayload = {
      id: orderId,
      customerName: customerName || 'Alice Cooper',
      item: item || 'MacBook Pro M3',
      amount: parseFloat(amount) || 1999.00,
      quantity: parseInt(quantity) || 1,
      forceFail: Boolean(forceFail),
      timestamp: new Date().toISOString()
    };

    eventBus.log('SYSTEM', `New Order Request [${orderId}]. Enqueueing to Apache Kafka...`);

    // Step 1 of the architecture: Publish to Kafka
    const kafkaResult = await publishOrderToKafka(orderPayload, processKafkaMessage);

    res.status(202).json({
      message: 'Order accepted and published to Kafka stream',
      orderId,
      kafkaResult,
      order: orderPayload
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Batch / Load Simulation: Emit multiple orders rapidly to demonstrate Kafka streaming
router.post('/orders/batch', async (req, res) => {
  try {
    const count = Math.min(parseInt(req.body.count) || 5, 25);
    const sampleItems = ['Sony WH-1000XM5', 'Apple iPad Air', 'Dell XPS 15', 'Keychron Q1 Pro', 'Samsung Galaxy S24'];
    const sampleCustomers = ['Liam Miller', 'Noah Davis', 'Emma Wilson', 'Olivia Martinez', 'James Taylor'];

    const batchPromises = [];
    for (let i = 0; i < count; i++) {
      const orderId = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
      const orderPayload = {
        id: orderId,
        customerName: sampleCustomers[i % sampleCustomers.length],
        item: sampleItems[i % sampleItems.length],
        amount: Math.floor(Math.random() * 800 + 150),
        quantity: 1,
        timestamp: new Date().toISOString()
      };

      batchPromises.push(publishOrderToKafka(orderPayload, processKafkaMessage));
    }

    const results = await Promise.all(batchPromises);
    res.status(202).json({
      message: `Batch of ${count} orders published to Kafka stream`,
      count,
      results
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
