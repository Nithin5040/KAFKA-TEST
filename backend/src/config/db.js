const { Pool } = require('pg');
const eventBus = require('../services/eventBus');

let pool = null;
let isConnected = false;
let cloudProviderName = 'Not Configured (Memory Store)';

// In-memory fallback if no cloud DB configured yet
const memoryDb = {
  orders: [],
  audit_logs: []
};

async function initDb(customUrl = null) {
  const dbUrl = customUrl || process.env.DATABASE_URL;

  if (!dbUrl || dbUrl.trim() === '') {
    eventBus.log('CLOUD_DB', 'No DATABASE_URL configured. Running in Local Memory DB Mode.');
    isConnected = false;
    cloudProviderName = 'In-Memory (Awaiting Supabase/Neon URL)';
    return;
  }

  try {
    if (pool) {
      await pool.end().catch(() => {});
    }

    // Determine provider name from URL
    if (dbUrl.includes('supabase.co')) cloudProviderName = 'Supabase Cloud PostgreSQL';
    else if (dbUrl.includes('neon.tech')) cloudProviderName = 'Neon Cloud PostgreSQL';
    else if (dbUrl.includes('aws') || dbUrl.includes('rds')) cloudProviderName = 'AWS RDS PostgreSQL';
    else cloudProviderName = 'Cloud PostgreSQL';

    pool = new Pool({
      connectionString: dbUrl,
      ssl: {
        rejectUnauthorized: false
      },
      connectionTimeoutMillis: 5000
    });

    // Test connection
    const client = await pool.connect();
    
    // Auto-create tables if they don't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(64) PRIMARY KEY,
        customer_name VARCHAR(120),
        item VARCHAR(120),
        amount NUMERIC(10, 2),
        status VARCHAR(60) NOT NULL,
        kafka_partition INT DEFAULT 0,
        kafka_offset BIGINT DEFAULT 0,
        rabbit_tasks JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        order_id VARCHAR(64),
        stage VARCHAR(40),
        message TEXT,
        payload JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    client.release();

    isConnected = true;
    eventBus.log('CLOUD_DB', `Successfully connected to ${cloudProviderName}! Schema verified.`);
    eventBus.broadcast('DB_STATUS', { isConnected: true, provider: cloudProviderName });
  } catch (err) {
    console.error('Database connection error:', err.message);
    isConnected = false;
    cloudProviderName = `Connection Error: ${err.message}`;
    eventBus.log('CLOUD_DB', `Failed to connect to Cloud DB: ${err.message}`);
    eventBus.broadcast('DB_STATUS', { isConnected: false, error: err.message, provider: cloudProviderName });
  }
}

async function saveOrder(order) {
  eventBus.updateStat('dbWrites', 1);

  if (isConnected && pool) {
    try {
      const query = `
        INSERT INTO orders (id, customer_name, item, amount, status, kafka_partition, kafka_offset, rabbit_tasks, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          kafka_partition = EXCLUDED.kafka_partition,
          kafka_offset = EXCLUDED.kafka_offset,
          rabbit_tasks = EXCLUDED.rabbit_tasks,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *;
      `;
      const values = [
        order.id,
        order.customer_name || 'Anonymous',
        order.item || 'Generic Item',
        order.amount || 0,
        order.status,
        order.kafka_partition || 0,
        order.kafka_offset || 0,
        JSON.stringify(order.rabbit_tasks || {})
      ];
      const res = await pool.query(query, values);
      eventBus.log('CLOUD_DB', `Order [${order.id}] persisted to Cloud PostgreSQL (${order.status})`);
      return res.rows[0];
    } catch (err) {
      eventBus.log('CLOUD_DB', `Error saving order to Cloud DB: ${err.message}. Falling back to memory.`);
    }
  }

  // Fallback to memory
  const existingIdx = memoryDb.orders.findIndex(o => o.id === order.id);
  const existing = existingIdx >= 0 ? memoryDb.orders[existingIdx] : {};
  const updatedOrder = {
    ...existing,
    ...order,
    customer_name: order.customer_name || existing.customer_name || 'Anonymous',
    item: order.item || existing.item || 'Generic Item',
    amount: order.amount !== undefined ? order.amount : (existing.amount || 0),
    kafka_partition: order.kafka_partition !== undefined ? order.kafka_partition : (existing.kafka_partition || 0),
    kafka_offset: order.kafka_offset !== undefined ? order.kafka_offset : (existing.kafka_offset || 0),
    rabbit_tasks: { ...(existing.rabbit_tasks || {}), ...(order.rabbit_tasks || {}) },
    updated_at: new Date().toISOString(),
    created_at: existing.created_at || order.created_at || new Date().toISOString()
  };

  if (existingIdx >= 0) {
    memoryDb.orders[existingIdx] = updatedOrder;
  } else {
    memoryDb.orders.unshift(updatedOrder);
  }

  eventBus.log('CLOUD_DB', `Order [${order.id}] saved to local store (${order.status})`);
  return updatedOrder;
}

async function getOrders(limit = 50) {
  if (isConnected && pool) {
    try {
      const res = await pool.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT $1', [limit]);
      return res.rows;
    } catch (err) {
      console.error('Error fetching orders from DB:', err.message);
    }
  }
  return memoryDb.orders.slice(0, limit);
}


async function getAuditLogs(limit = 50) {
  if (isConnected && pool) {
    try {
      const res = await pool.query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT $1', [limit]);
      return res.rows;
    } catch (err) {
      console.error('Error fetching audit logs:', err.message);
    }
  }
  return memoryDb.audit_logs.slice(0, limit);
}

function getStatus() {
  return {
    isConnected,
    provider: cloudProviderName,
    activeUrlMasked: process.env.DATABASE_URL 
      ? process.env.DATABASE_URL.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@')
      : 'None'
  };
}

module.exports = {
  initDb,
  saveOrder,
  getOrders,
  getAuditLogs,
  getStatus
};
