import React, { useState } from 'react';
import { Send, Zap, AlertTriangle, ShieldCheck, ShoppingCart } from 'lucide-react';

export default function OrderDispatcher({ onOrderCreated, onBatchDispatched }) {
  const [customerName, setCustomerName] = useState('Nithin Developer');
  const [item, setItem] = useState('Apple MacBook Pro M3');
  const [amount, setAmount] = useState('2499.00');
  const [quantity, setQuantity] = useState('1');
  const [forceFail, setForceFail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          item,
          amount: parseFloat(amount),
          quantity: parseInt(quantity),
          forceFail
        })
      });
      const data = await res.json();
      if (onOrderCreated) onOrderCreated(data);
    } catch (err) {
      console.error('Error creating order:', err);
    } finally {
      setLoading(false);
    }
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
      console.error('Error dispatching batch:', err);
    } finally {
      setBatchLoading(false);
    }
  };

  const applyPreset = (presetName, presetAmount, shouldFail = false) => {
    setItem(presetName);
    setAmount(presetAmount.toString());
    setForceFail(shouldFail);
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShoppingCart size={18} color="#a855f7" /> Order Dispatcher & Load Simulator
        </h3>
        <span className="badge badge-kafka">Kafka Ingestion</span>
      </div>

      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
        Emit real-time order events to Kafka topic <code className="mono" style={{ color: '#c084fc' }}>orders.stream</code>. The bridge then fans out tasks to RabbitMQ.
      </p>

      {/* Quick Presets */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => applyPreset('Apple MacBook Pro M3', 2499.00, false)}
          className="btn-secondary"
          style={{ fontSize: '0.75rem', padding: '6px 10px' }}
        >
          MacBook ($2499)
        </button>
        <button
          type="button"
          onClick={() => applyPreset('Sony WH-1000XM5', 399.00, false)}
          className="btn-secondary"
          style={{ fontSize: '0.75rem', padding: '6px 10px' }}
        >
          Headphones ($399)
        </button>
        <button
          type="button"
          onClick={() => applyPreset('Luxury Diamond Watch', 9999.00, true)}
          className="btn-secondary"
          style={{ fontSize: '0.75rem', padding: '6px 10px', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#f87171' }}
        >
          🚨 High-Value (Triggers DLQ)
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Customer Name
            </label>
            <input
              id="input-customer-name"
              type="text"
              className="input-field"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Item / Product
            </label>
            <input
              id="input-item-name"
              type="text"
              className="input-field"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              required
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Amount ($ USD)
            </label>
            <input
              id="input-amount"
              type="number"
              step="0.01"
              className="input-field"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Quantity
            </label>
            <input
              id="input-quantity"
              type="number"
              min="1"
              max="20"
              className="input-field"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>
        </div>

        {/* DLQ Failure Test Checkbox */}
        <div style={{
          background: forceFail ? 'rgba(239, 68, 68, 0.12)' : 'rgba(255, 255, 255, 0.03)',
          border: `1px solid ${forceFail ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-color)'}`,
          borderRadius: '10px',
          padding: '10px 14px',
          marginBottom: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer'
        }}
        onClick={() => setForceFail(!forceFail)}
        >
          <input
            id="checkbox-force-fail"
            type="checkbox"
            checked={forceFail}
            onChange={(e) => setForceFail(e.target.checked)}
            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
          />
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: forceFail ? '#f87171' : 'var(--text-primary)' }}>
              Simulate Payment Failure & Dead Letter Queue (DLQ)
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              Sends NACK from Payment Worker and routes message into RabbitMQ <code className="mono">order.dlq</code>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            id="btn-dispatch-order"
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <Send size={15} /> {loading ? 'Streaming...' : 'Dispatch to Kafka'}
          </button>
        </div>
      </form>

      {/* High-Throughput Batch Simulator */}
      <div style={{ marginTop: '20px', paddingTop: '18px', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={14} color="#facc15" /> Kafka High-Throughput Batch Stream
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Load Testing</span>
        </div>
        <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
          Publish concurrent orders across multiple Kafka partitions simultaneously:
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            id="btn-batch-5"
            type="button"
            disabled={batchLoading}
            onClick={() => handleBatch(5)}
            className="btn-secondary"
            style={{ flex: 1, fontSize: '0.78rem', justifyContent: 'center' }}
          >
            ⚡ Stream 5 Orders
          </button>
          <button
            id="btn-batch-15"
            type="button"
            disabled={batchLoading}
            onClick={() => handleBatch(15)}
            className="btn-secondary"
            style={{ flex: 1, fontSize: '0.78rem', justifyContent: 'center', borderColor: 'rgba(234, 179, 8, 0.4)', color: '#facc15' }}
          >
            🚀 Stream 15 Orders
          </button>
        </div>
      </div>
    </div>
  );
}
