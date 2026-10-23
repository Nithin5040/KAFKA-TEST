import React, { useState, useEffect } from 'react';
import FlipkartStore from './components/FlipkartStore';
import LiveArchitectureEngine from './components/LiveArchitectureEngine';

export default function App() {
  const [status, setStatus] = useState({
    kafka: { mode: 'REAL_BROKER', isConnected: true },
    rabbitmq: { mode: 'REAL_BROKER', isConnected: true },
    database: { isConnected: true, provider: 'Supabase Cloud PostgreSQL' }
  });

  const [stats, setStats] = useState({
    kafkaProduced: 0,
    kafkaConsumed: 0,
    rabbitEnqueued: 0,
    rabbitAcked: 0,
    rabbitFailed: 0,
    dbWrites: 0
  });

  const [rabbitMetrics, setRabbitMetrics] = useState({
    'order.payment': { count: 0, acked: 0, failed: 0 },
    'order.inventory': { count: 0, acked: 0, failed: 0 },
    'order.notification': { count: 0, acked: 0, failed: 0 },
    'order.dlq': { count: 0 }
  });

  const [orders, setOrders] = useState([]);
  const [logs, setLogs] = useState([]);
  const [latestOrder, setLatestOrder] = useState(null);
  const [latestEvent, setLatestEvent] = useState(null);

  // Fetch initial data
  const fetchData = async () => {
    try {
      const [statusRes, ordersRes, logsRes] = await Promise.all([
        fetch('/api/status').then(r => r.json()).catch(() => null),
        fetch('/api/orders').then(r => r.json()).catch(() => []),
        fetch('/api/logs').then(r => r.json()).catch(() => [])
      ]);

      if (statusRes) {
        setStatus(statusRes);
        if (statusRes.stats) setStats(statusRes.stats);
        if (statusRes.rabbitmq?.metrics) setRabbitMetrics(statusRes.rabbitmq.metrics);
      }
      if (Array.isArray(ordersRes) && ordersRes.length > 0) {
        setOrders(ordersRes);
        if (!latestOrder) setLatestOrder(ordersRes[0]);
      }
      if (Array.isArray(logsRes)) setLogs(logsRes);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    fetchData();

    // WebSocket connection for real-time live events
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.hostname}:5000`;
    let ws = null;
    let reconnectTimeout = null;

    const connectWs = () => {
      ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          
          if (msg.type === 'INIT_STATE') {
            if (msg.data.stats) setStats(msg.data.stats);
            if (msg.data.logs) setLogs(msg.data.logs);
          } else if (msg.type === 'NEW_LOG') {
            setLogs(prev => [...prev.slice(-100), msg.data]);
          } else if (msg.type === 'STATS_UPDATE') {
            setStats(msg.data);
          } else if (msg.type === 'KAFKA_EVENT') {
            setLatestEvent(msg.data);
          } else if (msg.type === 'RABBIT_METRICS') {
            setRabbitMetrics(msg.data);
          } else if (msg.type === 'ORDER_UPDATED') {
            setOrders(prev => {
              const idx = prev.findIndex(o => o.id === msg.data.orderId);
              const updatedItem = {
                id: msg.data.orderId,
                status: msg.data.status,
                rabbit_tasks: msg.data.tasks,
                ...(msg.data.order || {})
              };

              setLatestOrder(updatedItem);

              if (idx >= 0) {
                const next = [...prev];
                next[idx] = { ...next[idx], ...updatedItem };
                return next;
              } else {
                return [updatedItem, ...prev];
              }
            });
          }
        } catch (err) {
          console.error('WebSocket parse error:', err);
        }
      };

      ws.onclose = () => {
        reconnectTimeout = setTimeout(connectWs, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connectWs();
    const interval = setInterval(fetchData, 8000);

    return () => {
      clearInterval(interval);
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, []);

  const handleBatchStream = async (count) => {
    try {
      await fetch('/api/orders/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count })
      });
      fetchData();
    } catch (err) {
      console.error('Error during batch stream:', err);
    }
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      overflow: 'hidden'
    }}>
      {/* LEFT HALF (50%): Realistic Flipkart Shopping Experience */}
      <div style={{ height: '100%', overflow: 'hidden' }}>
        <FlipkartStore
          onOrderPlaced={(data) => {
            if (data?.order) {
              setLatestOrder(data.order);
              setOrders(prev => [data.order, ...prev]);
            }
          }}
          activeOrderId={latestOrder?.id}
        />
      </div>

      {/* RIGHT HALF (50%): Live Kafka & RabbitMQ Architecture & Supabase Engine */}
      <div style={{ height: '100%', overflow: 'hidden' }}>
        <LiveArchitectureEngine
          status={status}
          stats={stats}
          rabbitMetrics={rabbitMetrics}
          latestOrder={latestOrder}
          latestEvent={latestEvent}
          orders={orders}
          logs={logs}
          onRefresh={fetchData}
          onBatchStream={handleBatchStream}
        />
      </div>
    </div>
  );
}
