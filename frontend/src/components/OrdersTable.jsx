import React, { useState } from 'react';
import { Database, Eye, CheckCircle2, Clock, XCircle, Search, RefreshCw } from 'lucide-react';

export default function OrdersTable({ orders, onRefresh }) {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterText, setFilterText] = useState('');

  const filteredOrders = (orders || []).filter(o => {
    const text = `${o.id} ${o.customer_name} ${o.item} ${o.status}`.toLowerCase();
    return text.includes(filterText.toLowerCase());
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="badge badge-success"><CheckCircle2 size={12} /> Completed</span>;
      case 'FAILED_PROCESSING':
        return <span className="badge badge-failed"><XCircle size={12} /> DLQ Routed</span>;
      case 'PROCESSING':
        return <span className="badge badge-pending"><Clock size={12} /> Processing</span>;
      default:
        return <span className="badge badge-kafka">{status}</span>;
    }
  };

  const getTaskStatusDot = (taskStatus) => {
    if (taskStatus === 'CONFIRMED' || taskStatus === 'RESERVED' || taskStatus === 'SENT') {
      return <span style={{ color: '#10b981', fontWeight: 600 }}>✓ ACK</span>;
    }
    if (taskStatus === 'FAILED') {
      return <span style={{ color: '#ef4444', fontWeight: 600 }}>✗ DLQ</span>;
    }
    return <span style={{ color: '#f59e0b' }}>⋯ Queued</span>;
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={18} color="#10b981" /> Cloud Database Orders Ledger
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Real-time state records persisted in PostgreSQL
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search orders..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="input-field"
              style={{ padding: '6px 12px 6px 30px', fontSize: '0.78rem', width: '160px' }}
            />
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          <button
            id="btn-refresh-orders"
            onClick={onRefresh}
            className="btn-secondary"
            style={{ padding: '6px 10px', fontSize: '0.75rem' }}
            title="Refresh Orders"
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '10px 14px' }}>Order ID</th>
              <th style={{ padding: '10px 14px' }}>Customer & Item</th>
              <th style={{ padding: '10px 14px' }}>Amount</th>
              <th style={{ padding: '10px 14px' }}>Kafka Metadata</th>
              <th style={{ padding: '10px 14px' }}>RabbitMQ Tasks</th>
              <th style={{ padding: '10px 14px' }}>Status</th>
              <th style={{ padding: '10px 14px', textAlign: 'center' }}>Inspect</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  No orders yet. Dispatch an order from the left panel to trigger the pipeline!
                </td>
              </tr>
            ) : (
              filteredOrders.map((ord) => {
                const tasks = ord.rabbit_tasks || {};
                return (
                  <tr
                    key={ord.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '10px 14px' }} className="mono">
                      <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{ord.id}</span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{ord.customer_name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{ord.item}</div>
                    </td>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#38bdf8' }}>
                      ${parseFloat(ord.amount || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: '10px 14px' }} className="mono">
                      <div style={{ fontSize: '0.7rem', color: '#c084fc' }}>
                        P: {ord.kafka_partition ?? 0} • Off: {ord.kafka_offset ?? 0}
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.68rem' }} className="mono">
                        <div>Pay: {getTaskStatusDot(tasks.payment)}</div>
                        <div>Inv: {getTaskStatusDot(tasks.inventory)}</div>
                        <div>Notif: {getTaskStatusDot(tasks.notification)}</div>
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      {getStatusBadge(ord.status)}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                        title="View Full JSON Record"
                      >
                        <Eye size={12} /> View
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* JSON Inspector Modal */}
      {selectedOrder && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }} className="mono">
                Order Record: {selectedOrder.id}
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.8rem' }}
              >
                ✕ Close
              </button>
            </div>
            <pre style={{
              flex: 1,
              overflowY: 'auto',
              background: '#090d16',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '16px',
              fontSize: '0.75rem',
              color: '#38bdf8',
              lineHeight: 1.5
            }} className="mono">
              {JSON.stringify(selectedOrder, null, 2)}
            </pre>
          </div>
        </div>
      )}

    </div>
  );
}
