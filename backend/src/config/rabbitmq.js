const amqp = require('amqplib');
const eventBus = require('../services/eventBus');

const EXCHANGE_NAME = 'order.exchange';
const DLX_EXCHANGE = 'order.dlx';
const DLQ_QUEUE = 'order.dlq';

const QUEUES = {
  PAYMENT: 'order.payment',
  INVENTORY: 'order.inventory',
  NOTIFICATION: 'order.notification'
};

let connection = null;
let channel = null;
let isConnected = false;

// Queue metrics cache
const queueMetrics = {
  [QUEUES.PAYMENT]: { count: 0, acked: 0, failed: 0 },
  [QUEUES.INVENTORY]: { count: 0, acked: 0, failed: 0 },
  [QUEUES.NOTIFICATION]: { count: 0, acked: 0, failed: 0 },
  [DLQ_QUEUE]: { count: 0 }
};

async function initRabbitMQ(workerHandlers) {
  const url = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';

  try {
    eventBus.log('RABBITMQ', `Connecting to RabbitMQ broker at ${url}...`);
    connection = await amqp.connect(url, { timeout: 4000 });
    channel = await connection.createChannel();

    // Setup Dead Letter Exchange and Queue
    await channel.assertExchange(DLX_EXCHANGE, 'fanout', { durable: true });
    await channel.assertQueue(DLQ_QUEUE, { durable: true });
    await channel.bindQueue(DLQ_QUEUE, DLX_EXCHANGE, '');

    // Setup Main Topic Exchange
    await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });

    // Assert and bind queues with DLX configuration
    for (const [key, qName] of Object.entries(QUEUES)) {
      await channel.assertQueue(qName, {
        durable: true,
        deadLetterExchange: DLX_EXCHANGE,
        messageTtl: 60000 // 60s TTL
      });
      await channel.bindQueue(qName, EXCHANGE_NAME, `${qName}.#`);

      // Set prefetch to 1 for fair dispatch across workers
      await channel.prefetch(1);

      // Start consumer worker
      if (workerHandlers && workerHandlers[key]) {
        channel.consume(qName, async (msg) => {
          if (!msg) return;
          const content = JSON.parse(msg.content.toString());
          try {
            const success = await workerHandlers[key](content);
            if (success) {
              channel.ack(msg);
              queueMetrics[qName].acked += 1;
              eventBus.updateStat('rabbitAcked', 1);
            } else {
              // Send to dead letter queue without requeue
              channel.nack(msg, false, false);
              queueMetrics[qName].failed += 1;
              queueMetrics[DLQ_QUEUE].count += 1;
              eventBus.updateStat('rabbitFailed', 1);
            }
          } catch (err) {
            channel.nack(msg, false, false);
            queueMetrics[qName].failed += 1;
            queueMetrics[DLQ_QUEUE].count += 1;
            eventBus.updateStat('rabbitFailed', 1);
          }
          broadcastQueueMetrics();
        });
      }
    }

    isConnected = true;
    eventBus.log('RABBITMQ', 'Connected to real RabbitMQ broker! Exchanges & Queues initialized.');
    eventBus.broadcast('RABBIT_STATUS', { isConnected: true, url, mode: 'REAL_BROKER' });
  } catch (err) {
    isConnected = false;
    eventBus.log('RABBITMQ', `Live RabbitMQ unreachable (${err.message}). Activating Interactive Simulator.`);
    eventBus.broadcast('RABBIT_STATUS', { isConnected: false, url, mode: 'SIMULATOR', error: err.message });
  }
}

async function publishToRabbit(queueType, routingKey, payload, simulatorWorker) {
  eventBus.updateStat('rabbitEnqueued', 1);
  const qName = QUEUES[queueType];

  if (isConnected && channel) {
    try {
      const sent = channel.publish(
        EXCHANGE_NAME,
        routingKey,
        Buffer.from(JSON.stringify(payload)),
        { persistent: true }
      );
      if (sent) {
        queueMetrics[qName].count += 1;
        eventBus.log('RABBITMQ', `Message published to Exchange '${EXCHANGE_NAME}' -> Route '${routingKey}' for Order #${payload.orderId}`);
        broadcastQueueMetrics();
        return { success: true, mode: 'REAL_BROKER' };
      }
    } catch (err) {
      eventBus.log('RABBITMQ', `RabbitMQ publish error: ${err.message}. Routing via simulator.`);
    }
  }

  // Simulator Fallback
  if (qName) queueMetrics[qName].count += 1;
  eventBus.log('RABBITMQ', `[SIMULATED RABBITMQ] Enqueued task to '${qName}' (Routing Key: ${routingKey})`);
  broadcastQueueMetrics();

  if (simulatorWorker) {
    // Simulate async worker processing with slight delay
    const delay = 500 + Math.random() * 800;
    setTimeout(async () => {
      try {
        const success = await simulatorWorker(payload);
        if (success) {
          queueMetrics[qName].acked += 1;
          eventBus.updateStat('rabbitAcked', 1);
        } else {
          queueMetrics[qName].failed += 1;
          queueMetrics[DLQ_QUEUE].count += 1;
          eventBus.updateStat('rabbitFailed', 1);
        }
      } catch (err) {
        queueMetrics[qName].failed += 1;
        queueMetrics[DLQ_QUEUE].count += 1;
        eventBus.updateStat('rabbitFailed', 1);
      }
      broadcastQueueMetrics();
    }, delay);
  }

  return { success: true, mode: 'SIMULATOR' };
}

function broadcastQueueMetrics() {
  eventBus.broadcast('RABBIT_METRICS', queueMetrics);
}

function getRabbitStatus() {
  return {
    isConnected,
    exchange: EXCHANGE_NAME,
    queues: QUEUES,
    metrics: queueMetrics,
    url: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
    mode: isConnected ? 'REAL_BROKER' : 'SIMULATOR'
  };
}

module.exports = {
  initRabbitMQ,
  publishToRabbit,
  getRabbitStatus,
  QUEUES,
  EXCHANGE_NAME
};
