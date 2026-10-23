const EventEmitter = require('events');

class PipelineEventBus extends EventEmitter {
  constructor() {
    super();
    this.wsClients = new Set();
    this.logs = [];
    this.stats = {
      kafkaProduced: 0,
      kafkaConsumed: 0,
      rabbitEnqueued: 0,
      rabbitAcked: 0,
      rabbitFailed: 0,
      dbWrites: 0
    };
  }

  registerWsClient(ws) {
    this.wsClients.add(ws);
    // Send initial snapshot
    ws.send(JSON.stringify({
      type: 'INIT_STATE',
      data: {
        stats: this.stats,
        logs: this.logs.slice(-30)
      }
    }));

    ws.on('close', () => {
      this.wsClients.delete(ws);
    });
  }

  broadcast(type, data) {
    const message = JSON.stringify({ type, data, timestamp: new Date().toISOString() });
    for (const client of this.wsClients) {
      if (client.readyState === 1) { // OPEN
        client.send(message);
      }
    }
  }

  log(stage, message, details = {}) {
    const entry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      stage, // 'KAFKA' | 'RABBITMQ' | 'CLOUD_DB' | 'SYSTEM'
      message,
      details
    };
    this.logs.push(entry);
    if (this.logs.length > 200) this.logs.shift();

    this.broadcast('NEW_LOG', entry);
    console.log(`[${entry.stage}] ${entry.message}`);
  }

  updateStat(metricKey, delta = 1) {
    if (this.stats[metricKey] !== undefined) {
      this.stats[metricKey] += delta;
      this.broadcast('STATS_UPDATE', this.stats);
    }
  }
}

module.exports = new PipelineEventBus();
