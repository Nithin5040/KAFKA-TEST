import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PipelineVisualizer from './components/PipelineVisualizer';
import OrderDispatcher from './components/OrderDispatcher';
import OrdersTable from './components/OrdersTable';
import LiveConsole from './components/LiveConsole';
import DbConfigModal from './components/DbConfigModal';
import LearningModal from './components/LearningModal';

export default function App() {
  const [status, setStatus] = useState({
    kafka: { mode: 'SIMULATOR', isConnected: false },
    rabbitmq: { mode: 'SIMULATOR', isConnected: false },
    database: { isConnected: false, provider: 'In-Memory (Awaiting Supabase/Neon URL)' }
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
  const [latestEvent, setLatestEvent] = useState(null);

  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  // Fetch initial REST data
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
      if (Array.isArray(ordersRes)) setOrders(ordersRes);
      if (Array.isArray(logsRes)) setLogs(logsRes);
    } catch (err) {
      console.error('Error fetching initial data:', err);
    }
  };

  useEffect(() => {
    fetchData();

    // WebSocket connection for real-time live updates
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.hostname}:5000`;
    let ws = null;
    let reconnectTimeout = null;

    const connectWs = () => {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('Connected to pipeline WebSocket telemetry stream');
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          
          if (msg.type === 'INIT_STATE') {
            if (msg.data.stats) setStats(msg.data.stats);
            if (msg.data.logs) setLogs(msg.data.logs);
          } else if (msg.type === 'NEW_LOG') {
            setLogs(prev => [...prev.slice(-150), msg.data]);
          } else if (msg.type === 'STATS_UPDATE') {
            setStats(msg.data);
          } else if (msg.type === 'KAFKA_EVENT') {
            setLatestEvent(msg.data);
          } else if (msg.type === 'RABBIT_METRICS') {
            setRabbitMetrics(msg.data);
          } else if (msg.type === 'ORDER_UPDATED') {
            setOrders(prev => {
              const idx = prev.findIndex(o => o.id === msg.data.orderId);
              if (idx >= 0) {
                const next = [...prev];
                next[idx] = { ...next[idx], status: msg.data.status, rabbit_tasks: msg.data.tasks, ...(msg.data.order || {}) };
                return next;
              } else if (msg.data.order) {
                return [msg.data.order, ...prev];
              }
              return prev;
            });
          } else if (msg.type === 'DB_STATUS') {
            setStatus(prev => ({
              ...prev,
              database: {
                ...prev.database,
                isConnected: msg.data.isConnected,
                provider: msg.data.provider
              }
            }));
          }
        } catch (err) {
          console.error('WebSocket message parsing error:', err);
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

    // Polling fallback every 6 seconds
    const interval = setInterval(fetchData, 6000);

    return () => {
      clearInterval(interval);
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, []);

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px' }}>
      
      {/* Top Header */}
      <Header
        status={status}
        onOpenDbModal={() => setIsDbModalOpen(true)}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
      />

      {/* Main Architecture Visualizer */}
      <PipelineVisualizer
        stats={stats}
        rabbitMetrics={rabbitMetrics}
        latestEvent={latestEvent}
      />

      {/* Two Column Section: Dispatcher & DB Table */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(340px, 420px) 1fr',
        gap: '24px',
        alignItems: 'stretch'
      }}>
        {/* Left: Dispatcher & Simulator */}
        <div>
          <OrderDispatcher
            onOrderCreated={(data) => {
              if (data?.order) {
                setOrders(prev => [data.order, ...prev]);
              }
            }}
            onBatchDispatched={() => {
              fetchData();
            }}
          />
        </div>

        {/* Right: Orders Ledger from Cloud DB */}
        <div>
          <OrdersTable
            orders={orders}
            onRefresh={fetchData}
          />
        </div>
      </div>

      {/* Real-time Telemetry Console */}
      <LiveConsole
        logs={logs}
        onClear={() => setLogs([])}
      />

      {/* Cloud DB Connection Modal */}
      <DbConfigModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        currentStatus={status.database}
        onConfigSaved={(newDbStatus) => {
          setStatus(prev => ({ ...prev, database: newDbStatus }));
          fetchData();
        }}
      />

      {/* Architecture Learning Guide Modal */}
      <LearningModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

    </div>
  );
}
