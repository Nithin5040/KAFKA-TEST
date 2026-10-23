import React, { useState } from 'react';
import { Database, Eye, CheckCircle2, Clock, XCircle, Search, RefreshCw, ExternalLink } from 'lucide-react';

export default function OrdersTable({ orders, onRefresh, onSelectOrder }) {
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

  return (
    <div className="card-clean" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
      
      {/* Table Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={18} color="#34d399" /> Supabase Cloud Database Records
          </h3>
          <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
            Live table <code className="mono" style={{ color: '#34d399' }}>orders</code> in your PostgreSQL cloud database
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Search bar */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search orders..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="clean-input"
              style={{ padding: '6px 12px 6px 28px', fontSize: '0.75rem', width: '150px' }}
            />
            <Search size={13} color="var(--text-muted)" style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          <button
            onClick={onRefresh}
            className="btn-ghost"
            style={{ padding: '6px 10px', fontSize: '0.75rem' }}
            title="Refresh from Cloud Database"
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {/* Clean Table View */}
      <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.78rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '10px 14px' }}>Order ID</th>
              <th style={{ padding: '10px 14px' }}>Customer & Item</th>
              <th style={{ padding: '10px 14px' }}>Amount</th>
              <th style={{ padding: '10px 14px' }}>Kafka Partition</th>
              <th style={{ padding: '10px 14px' }}>RabbitMQ Tasks</th>
              <th style={{ padding: '10px 14px' }}>Status</th>
              <th style={{ padding: '10px 14px', textAlign: 'center' }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  No orders found. Click a 1-click test button on the left to dispatch an order!
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
                      transition: 'background 0.15s',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      if (onSelectOrder) onSelectOrder(ord);
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '10px 14px' }} className="mono">
                      <span style={{ color: '#ffffff', fontWeight: 600 }}>{ord.id}</span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{ord.customer_name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{ord.item}</div>
                    </td>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#38bdf8' }}>
                      ${parseFloat(ord.amount || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: '10px 14px' }} className="mono">
                      <span className="badge badge-kafka">
                        P#{ord.kafka_partition ?? 0} (Off {ord.kafka_offset ?? 0})
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        <span style={{
                          padding: '2px 5px',
                          borderRadius: '4px',
                          fontSize: '0.65rem',
                          background: tasks.payment === 'FAILED' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                          color: tasks.payment === 'FAILED' ? '#f87171' : '#34d399'
                        }}>
                          Pay: {tasks.payment || 'Queued'}
                        </span>
                        <span style={{
                          padding: '2px 5px',
                          borderRadius: '4px',
                          fontSize: '0.65rem',
                          background: 'rgba(16,185,129,0.15)',
                          color: '#34d399'
                        }}>
                          Inv: {tasks.inventory || 'Queued'}
                        </span>
                        <span style={{
                          padding: '2px 5px',
                          borderRadius: '4px',
                          fontSize: '0.65rem',
                          background: 'rgba(16,185,129,0.15)',
                          color: '#34d399'
                        }}>
                          Email: {tasks.notification || 'Queued'}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      {getStatusBadge(ord.status)}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(ord);
                        }}
                        className="btn-ghost"
                        style={{ padding: '3px 8px', fontSize: '0.7rem' }}
                      >
                        <Eye size={12} /> JSON
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
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
          <div className="card-clean" style={{ width: '100%', maxWidth: '580px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', padding: '24px', background: '#0d1322' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }} className="mono">
                Supabase Record: {selectedOrder.id}
              </h3>
              <button onClick={() => setSelectedOrder(null)} className="btn-ghost" style={{ padding: '4px 10px' }}>
                ✕ Close
              </button>
            </div>
            <pre style={{
              flex: 1,
              overflowY: 'auto',
              background: '#070b14',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '14px',
              fontSize: '0.74rem',
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
