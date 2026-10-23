const { Kafka, Partitioners } = require('kafkajs');
const eventBus = require('../services/eventBus');

const TOPIC_NAME = 'orders.stream';
let kafka = null;
let producer = null;
let consumer = null;
let isConnected = false;
let mockOffset = 100;

async function initKafka(onMessageCallback) {
  const broker = process.env.KAFKA_BROKER || 'localhost:9092';
  const clientId = process.env.KAFKA_CLIENT_ID || 'order-stream-service';
  const groupId = process.env.KAFKA_GROUP_ID || 'order-processing-group';

  kafka = new Kafka({
    clientId,
    brokers: [broker],
    retry: {
      initialRetryTime: 300,
      retries: 3
    },
    connectionTimeout: 4000
  });

  producer = kafka.producer({
    createPartitioner: Partitioners.DefaultPartitioner
  });

  consumer = kafka.consumer({ groupId });

  try {
    eventBus.log('KAFKA', `Connecting to Kafka broker at ${broker}...`);
    await producer.connect();
    await consumer.connect();

    // Subscribe to orders topic
    await consumer.subscribe({ topic: TOPIC_NAME, fromBeginning: false });

    // Start consuming
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const offset = message.offset;
        const key = message.key ? message.key.toString() : null;
        const value = JSON.parse(message.value.toString());

        eventBus.updateStat('kafkaConsumed', 1);
        eventBus.log('KAFKA', `[Topic: ${topic} | Partition: ${partition} | Offset: ${offset}] Event received for Order #${value.id}`, {
          key,
          offset,
          partition,
          data: value
        });

        // Broadcast to WebSocket frontend
        eventBus.broadcast('KAFKA_EVENT', {
          topic,
          partition,
          offset,
          key,
          value,
          timestamp: new Date().toISOString()
        });

        if (onMessageCallback) {
          await onMessageCallback({ topic, partition, offset, key, value });
        }
      }
    });

    isConnected = true;
    eventBus.log('KAFKA', `Connected to real Apache Kafka broker (${broker}) & listening on topic '${TOPIC_NAME}'`);
    eventBus.broadcast('KAFKA_STATUS', { isConnected: true, broker, mode: 'REAL_BROKER' });
  } catch (err) {
    isConnected = false;
    eventBus.log('KAFKA', `Live Kafka broker unreachable (${err.message}). Activating Interactive Simulator.`);
    eventBus.broadcast('KAFKA_STATUS', { isConnected: false, broker, mode: 'SIMULATOR', error: err.message });
  }
}

async function publishOrderToKafka(orderPayload, onSimulatorCallback) {
  eventBus.updateStat('kafkaProduced', 1);

  if (isConnected && producer) {
    try {
      const partitionKey = orderPayload.id;
      const metadata = await producer.send({
        topic: TOPIC_NAME,
        messages: [
          {
            key: partitionKey,
            value: JSON.stringify(orderPayload),
            headers: {
              'correlation-id': orderPayload.id,
              'source-system': 'react-web-dashboard'
            }
          }
        ]
      });

      const record = metadata[0];
      eventBus.log('KAFKA', `Produced message to '${TOPIC_NAME}' [Partition: ${record.partition}, Offset: ${record.baseOffset}]`);
      return {
        success: true,
        partition: record.partition,
        offset: record.baseOffset,
        topic: TOPIC_NAME,
        mode: 'REAL_BROKER'
      };
    } catch (err) {
      eventBus.log('KAFKA', `Error producing to Kafka: ${err.message}. Routing via simulator.`);
    }
  }

  // Simulator Fallback
  mockOffset += 1;
  const virtualPartition = Math.floor(Math.random() * 3); // 3 virtual partitions
  const simRecord = {
    success: true,
    partition: virtualPartition,
    offset: mockOffset,
    topic: TOPIC_NAME,
    mode: 'SIMULATOR'
  };

  eventBus.log('KAFKA', `[SIMULATED KAFKA LOG] Event published to '${TOPIC_NAME}' [Partition ${virtualPartition}, Offset ${mockOffset}]`);
  eventBus.broadcast('KAFKA_EVENT', {
    topic: TOPIC_NAME,
    partition: virtualPartition,
    offset: mockOffset,
    key: orderPayload.id,
    value: orderPayload,
    isSimulated: true,
    timestamp: new Date().toISOString()
  });

  if (onSimulatorCallback) {
    setTimeout(async () => {
      eventBus.updateStat('kafkaConsumed', 1);
      await onSimulatorCallback({
        topic: TOPIC_NAME,
        partition: virtualPartition,
        offset: mockOffset,
        key: orderPayload.id,
        value: orderPayload
      });
    }, 400); // 400ms simulate network latency
  }

  return simRecord;
}

function getKafkaStatus() {
  return {
    isConnected,
    topic: TOPIC_NAME,
    broker: process.env.KAFKA_BROKER || 'localhost:9092',
    mode: isConnected ? 'REAL_BROKER' : 'SIMULATOR'
  };
}

module.exports = {
  initKafka,
  publishOrderToKafka,
  getKafkaStatus,
  TOPIC_NAME
};
