const db = require('../config/db');
const eventBus = require('./eventBus');

// Tracks status of subtasks for each order
const orderTracker = new Map();

async function handlePaymentWorker(task) {
  const { orderId, amount, customerName, forceFail } = task;
  eventBus.log('RABBITMQ', `[Payment Worker] Processing charge of $${amount} for Order #${orderId}`);

  // Test failure condition
  if (forceFail || customerName === 'FAIL_TEST' || amount > 9000) {
    eventBus.log('RABBITMQ', `[Payment Worker] REJECTED payment for Order #${orderId} (Simulated decline / limit reached). NACK sent -> DLQ!`);
    await updateOrderSubtask(orderId, 'payment', 'FAILED', 'Payment declined');
    return false; // Triggers NACK -> DLQ
  }

  // Success
  eventBus.log('RABBITMQ', `[Payment Worker] Payment of $${amount} APPROVED for Order #${orderId}. ACK sent.`);
  await updateOrderSubtask(orderId, 'payment', 'CONFIRMED', `Charged $${amount}`);
  return true; // Triggers ACK
}

async function handleInventoryWorker(task) {
  const { orderId, item, quantity } = task;
  eventBus.log('RABBITMQ', `[Inventory Worker] Reserving item '${item}' (Qty: ${quantity || 1}) for Order #${orderId}`);
  
  // Success
  eventBus.log('RABBITMQ', `[Inventory Worker] Stock locked for '${item}' in warehouse. ACK sent.`);
  await updateOrderSubtask(orderId, 'inventory', 'RESERVED', `Warehouse allocated ${item}`);
  return true;
}

async function handleNotificationWorker(task) {
  const { orderId, customerName, email } = task;
  eventBus.log('RABBITMQ', `[Notification Worker] Dispatching receipt email to ${email || customerName}`);
  
  // Success
  eventBus.log('RABBITMQ', `[Notification Worker] Email sent. ACK sent.`);
  await updateOrderSubtask(orderId, 'notification', 'SENT', `Notification dispatched to ${email || customerName}`);
  return true;
}

async function updateOrderSubtask(orderId, taskName, taskStatus, details) {
  let tracker = orderTracker.get(orderId);
  if (!tracker) {
    tracker = {
      orderId,
      tasks: {
        payment: 'PENDING',
        inventory: 'PENDING',
        notification: 'PENDING'
      }
    };
    orderTracker.set(orderId, tracker);
  }

  tracker.tasks[taskName] = taskStatus;

  // Check overall completion
  const isAllDone = Object.values(tracker.tasks).every(status => status === 'CONFIRMED' || status === 'RESERVED' || status === 'SENT');
  const hasFailure = Object.values(tracker.tasks).some(status => status === 'FAILED');

  const finalStatus = hasFailure ? 'FAILED_PROCESSING' : (isAllDone ? 'COMPLETED' : 'PROCESSING');

  const updated = await db.saveOrder({
    id: orderId,
    status: finalStatus,
    rabbit_tasks: tracker.tasks
  });

  eventBus.broadcast('ORDER_UPDATED', {
    orderId,
    status: finalStatus,
    tasks: tracker.tasks,
    order: updated
  });

  if (isAllDone || hasFailure) {
    orderTracker.delete(orderId);
  }
}

module.exports = {
  handlePaymentWorker,
  handleInventoryWorker,
  handleNotificationWorker
};
