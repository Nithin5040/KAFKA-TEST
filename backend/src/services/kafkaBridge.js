const db = require('../config/db');
const { publishToRabbit, QUEUES } = require('../config/rabbitmq');
const rabbitWorkers = require('./rabbitWorkers');
const eventBus = require('./eventBus');

async function processKafkaMessage(kafkaRecord) {
  const { topic, partition, offset, key, value } = kafkaRecord;
  const order = value;

  eventBus.log('SYSTEM', `[Kafka -> RabbitMQ Bridge] Ingested Order #${order.id} from Kafka [Partition ${partition}, Offset ${offset}]`);

  // Step 1: Save state to Cloud DB
  await db.saveOrder({
    id: order.id,
    customer_name: order.customerName,
    item: order.item,
    amount: order.amount,
    status: 'KAFKA_INGESTED',
    kafka_partition: partition,
    kafka_offset: offset,
    rabbit_tasks: {
      payment: 'QUEUED',
      inventory: 'QUEUED',
      notification: 'QUEUED'
    }
  });

  // Step 2: Route specialized task messages to RabbitMQ
  // Task 1: Payment processing
  await publishToRabbit(
    'PAYMENT',
    'order.payment.process',
    {
      orderId: order.id,
      amount: order.amount,
      customerName: order.customerName,
      forceFail: order.forceFail || false
    },
    rabbitWorkers.handlePaymentWorker
  );

  // Task 2: Inventory reservation
  await publishToRabbit(
    'INVENTORY',
    'order.inventory.reserve',
    {
      orderId: order.id,
      item: order.item,
      quantity: order.quantity || 1
    },
    rabbitWorkers.handleInventoryWorker
  );

  // Task 3: Customer notification
  await publishToRabbit(
    'NOTIFICATION',
    'order.notification.send',
    {
      orderId: order.id,
      customerName: order.customerName,
      email: `${order.customerName.toLowerCase().replace(/\s+/g, '.')}@example.com`
    },
    rabbitWorkers.handleNotificationWorker
  );

  eventBus.log('SYSTEM', `[Bridge] Successfully dispatched 3 RabbitMQ tasks for Order #${order.id}`);
}

module.exports = {
  processKafkaMessage
};
