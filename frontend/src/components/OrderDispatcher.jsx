import React, { useState } from 'react';
import { Send, Zap, AlertTriangle, ShieldCheck, ShoppingCart, CheckCircle2, XCircle } from 'lucide-react';

export default function OrderDispatcher({ onOrderCreated, onBatchDispatched }) {
  const [customerName, setCustomerName] = useState('Nithin');
  const [item, setItem] = useState('Apple MacBook Pro');
  const [amount, setAmount] = useState('2499.00');
  const [forceFail, setForceFail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);

  const dispatchOrder = async (payload) => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (onOrderCreated) onOrderCreated(data);
    } catch (err) {
      console.error('Error dispatching order:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    dispatchOrder({
      customerName,
      item,
      amount: parseFloat(amount),
      quantity: 1,
      forceFail
    });
  };

  const handleBatch = async (count) => {
    setBatchLoading(true);
    try {
      const res = await fetch('/api/orders/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count })
      });
      const data = await res.json();
      if (onBatchDispatched) onBatchDispatched(data);
    } catch (err) {
      console.error('Error batch streaming:', err);
    } finally {
      setBatchLoading(false);
    }
  };

  return (
    <div className="card-clean" style={{ padding: '20px' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingCart size={18} color="#c084fc" /> Dispatch Order Event
          </h3>
          <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
            Choose a quick scenario or submit a custom order
          </p>
        </div>
        <span className="badge badge-kafka">Kafka Ingestion</span>
      </div>

      {/* 3 Quick 1-Click Scenario Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        
        {/* Scenario 1: Standard Success */}
        <button
          type="button"
          disabled={loading}
          onClick={() => dispatchOrder({ customerName: 'Nithin (Normal)', item: 'MacBook Pro M3', amount: 2499.00, forceFail: false })}
          className="btn-preset"
          style={{ borderLeft: '4px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>
              🟢 Standard Order ($2,499)
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              Tests Happy Path: Kafka Event → RabbitMQ ACKs → Supabase Completed
            </div>
          </div>
          <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>1-Click Run</span>
        </button>

        {/* Scenario 2: DLQ Failure */}
        <button
          type="button"
          disabled={loading}
          onClick={() => dispatchOrder({ customerName: 'FAIL_TEST', item: 'Diamond Watch', amount: 9999.00, forceFail: true })}
          className="btn-preset"
          style={{ borderLeft: '4px solid #ef4444', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>
              🔴 Payment Declined ($9,999)
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              Tests Failure Path: RabbitMQ NACK → Routes into Dead Letter Queue (DLQ)
            </div>
          </div>
          <span className="badge badge-failed" style={{ fontSize: '0.68rem' }}>1-Click Run</span>
        </button>

        {/* Scenario 3: Batch Kafka Stream */}
        <button
          type="button"
          disabled={batchLoading}
          onClick={() => handleBatch(5)}
          className="btn-preset"
          style={{ borderLeft: '4px solid #8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>
              ⚡ High-Throughput Burst (5 Orders)
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              Streams 5 concurrent events into multiple Kafka partitions in parallel
            </div>
          </div>
          <span className="badge badge-kafka" style={{ fontSize: '0.68rem' }}>
            {batchLoading ? 'Streaming...' : '1-Click Burst'}
          </span>
        </button>

      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid var(--border-color)', margin: '16px 0 14px 0' }} />

      {/* Custom Order Form */}
      <form onSubmit={handleCustomSubmit}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '10px' }}>
          Or Create Custom Order:
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Customer Name</label>
            <input
              type="text"
              className="clean-input"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Item Name</label>
            <input
              type="text"
              className="clean-input"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              required
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', alignItems: 'flex-end', marginBottom: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Amount ($)</label>
            <input
              type="number"
              step="0.01"
              className="clean-input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', cursor: 'pointer', paddingBottom: '6px' }}>
            <input
              type="checkbox"
              checked={forceFail}
              onChange={(e) => setForceFail(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ color: forceFail ? '#f87171' : 'var(--text-secondary)' }}>Trigger DLQ Fail</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-action"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <Send size={15} /> {loading ? 'Emitting to Kafka...' : 'Dispatch Custom Order'}
        </button>
      </form>

    </div>
  );
}
