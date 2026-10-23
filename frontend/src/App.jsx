import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PipelineVisualizer from './components/PipelineVisualizer';
import OrderDispatcher from './components/OrderDispatcher';
import OrdersTable from './components/OrdersTable';
import LiveConsole from './components/LiveConsole';
import DbConfigModal from './components/DbConfigModal';
import LearningModal from './components/LearningModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline' | 'orders' | 'logs'
  const [status, setStatus] = useState({
    kafka: { mode: 'SIMULATOR', isConnected: false },
    rabbitmq: { mode: 'SIMULATOR', isConnected: false },
    database: { isConnected: false, provider: 'Supabase Cloud PostgreSQL' }
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
      if (Array.isArray(ordersRes) && ordersRes.length > 0) {
        setOrders(ordersRes);
        if (!latestOrder) setLatestOrder(ordersRes[0]);
      }
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
          console.error('WebSocket message parse error:', err);
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

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '20px 24px' }}>
      
      {/* Clean Navbar & Tabs */}
      <Header
        status={status}
        onOpenDbModal={() => setIsDbModalOpen(true)}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* TAB 1: Main Interactive Pipeline & Dispatcher */}
      {activeTab === 'pipeline' && (
        <div>
          {/* Top: 4-Step Diagram & Live Order Journey */}
          <PipelineVisualizer
            stats={stats}
            rabbitMetrics={rabbitMetrics}
            latestOrder={latestOrder}
            latestEvent={latestEvent}
          />

          {/* Bottom: 2 Clear Columns */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(340px, 420px) 1fr',
            gap: '20px',
            alignItems: 'start'
          }}>
            {/* Left Column: 1-Click Scenarios & Custom Dispatcher */}
            <div>
              <OrderDispatcher
                onOrderCreated={(data) => {
                  if (data?.order) {
                    setLatestOrder(data.order);
                    setOrders(prev => [data.order, ...prev]);
                  }
                }}
                onBatchDispatched={() => {
                  fetchData();
                }}
              />
            </div>

            {/* Right Column: Live Recent Orders Feed */}
            <div className="card-clean" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#ffffff' }}>
                    Recent Orders in Supabase
                  </h3>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                    Click any order to view its live journey in the stepper above
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="btn-ghost"
                  style={{ fontSize: '0.75rem', padding: '5px 10px' }}
                >
                  View Full Ledger →
                </button>
              </div>

              {/* Order Cards List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {orders.slice(0, 5).map((ord) => {
                  const isSelected = latestOrder?.id === ord.id;
                  const isCompleted = ord.status === 'COMPLETED';
                  const isFailed = ord.status === 'FAILED_PROCESSING';
                  const tasks = ord.rabbit_tasks || {};

                  return (
                    <div
                      key={ord.id}
                      onClick={() => setLatestOrder(ord)}
                      style={{
                        background: isSelected ? 'rgba(139, 92, 246, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                        border: `1px solid ${isSelected ? 'rgba(139, 92, 246, 0.4)' : 'var(--border-color)'}`,
                        borderRadius: '10px',
                        padding: '12px 14px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.15s'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="mono" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff' }}>
                            {ord.id}
                          </span>
                          <span className="badge badge-kafka" style={{ fontSize: '0.65rem' }}>
                            P#{ord.kafka_partition ?? 0}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {ord.customer_name} • <span style={{ color: '#38bdf8' }}>${parseFloat(ord.amount || 0).toFixed(2)}</span> ({ord.item})
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        {isCompleted && <span className="badge badge-success">✓ Completed</span>}
                        {isFailed && <span className="badge badge-failed">✗ DLQ Routed</span>}
                        {!isCompleted && !isFailed && <span className="badge badge-pending">⋯ In Flight</span>}
                        <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          Pay: {tasks.payment || '..'} • Inv: {tasks.inventory || '..'} • Email: {tasks.notification || '..'}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {orders.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    No orders yet. Click "Standard Order ($2,499)" on the left to see the magic happen!
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: Supabase Cloud Database Ledger */}
      {activeTab === 'orders' && (
        <OrdersTable
          orders={orders}
          onRefresh={fetchData}
          onSelectOrder={(ord) => {
            setLatestOrder(ord);
            setActiveTab('pipeline');
          }}
        />
      )}

      {/* TAB 3: Real-Time Telemetry Logs Stream */}
      {activeTab === 'logs' && (
        <LiveConsole
          logs={logs}
          onClear={() => setLogs([])}
        />
      )}

      {/* Cloud DB Connection Settings Modal */}
      <DbConfigModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        currentStatus={status.database}
        onConfigSaved={(newDbStatus) => {
          setStatus(prev => ({ ...prev, database: newDbStatus }));
          fetchData();
        }}
      />

      {/* Educational Architecture Guide Modal */}
      <LearningModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

    </div>
  );
}
