import React from 'react';
import { ArrowRight, Server, Database, Radio, CheckCircle2, Clock, AlertTriangle, Layers, Cpu, CreditCard, PackageCheck, Mail, AlertOctagon } from 'lucide-react';

export default function PipelineVisualizer({ stats, rabbitMetrics, latestOrder, latestEvent }) {
  const tasks = latestOrder?.rabbit_tasks || {};
  const isOrderActive = Boolean(latestOrder);

  return (
    <div style={{ marginBottom: '24px' }}>
      
      {/* 4-Step Architecture Flowchart */}
      <div className="card-clean" style={{ padding: '20px 24px', marginBottom: '18px' }}>
        
        {/* Title & Counters */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} color="#8b5cf6" /> End-to-End System Flow
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              How an order travels from client event log to microservice worker queues to cloud database
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '5px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.75rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Kafka Stream: </span>
              <strong style={{ color: '#c084fc' }}>{stats.kafkaProduced || 0} events</strong>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '5px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.75rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>RabbitMQ Workers: </span>
              <strong style={{ color: '#fb923c' }}>{stats.rabbitAcked || 0} ACKs</strong>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '5px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.75rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Supabase Writes: </span>
              <strong style={{ color: '#34d399' }}>{stats.dbWrites || 0} records</strong>
            </div>
          </div>
        </div>

        {/* 4 Connected Stages */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px',
          position: 'relative'
        }}>

          {/* STEP 1: Kafka */}
          <div style={{
            background: 'rgba(168, 85, 247, 0.05)',
            border: '1px solid rgba(168, 85, 247, 0.25)',
            borderRadius: '12px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="badge badge-kafka">1. Ingest Event</span>
                <Server size={14} color="#c084fc" />
              </div>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f3e8ff', marginBottom: '4px' }}>
                Apache Kafka
              </h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                Topic: <code className="mono" style={{ color: '#c084fc' }}>orders.stream</code>
              </p>
            </div>
            
            <div style={{ background: 'rgba(0,0,0,0.35)', borderRadius: '8px', padding: '8px 10px', fontSize: '0.7rem' }} className="mono">
              <div style={{ color: 'var(--text-secondary)' }}>Partition Key: <span style={{ color: '#c084fc' }}>order.id</span></div>
              <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
                {latestEvent ? `Partition #${latestEvent.partition} • Off: ${latestEvent.offset}` : '3 Partitions active'}
              </div>
            </div>
          </div>

          {/* STEP 2: Bridge */}
          <div style={{
            background: 'rgba(234, 179, 8, 0.05)',
            border: '1px solid rgba(234, 179, 8, 0.25)',
            borderRadius: '12px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="badge" style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#facc15' }}>2. Stream Bridge</span>
                <ArrowRight size={14} color="#facc15" />
              </div>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fef08a', marginBottom: '4px' }}>
                Kafka-to-Rabbit Bridge
              </h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                Exchange: <code className="mono" style={{ color: '#facc15' }}>order.exchange</code>
              </p>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.35)', borderRadius: '8px', padding: '8px 10px', fontSize: '0.7rem' }} className="mono">
              <div style={{ color: '#facc15' }}>Fan-out to 3 Queues</div>
              <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>Type: Topic Exchange</div>
            </div>
          </div>

          {/* STEP 3: RabbitMQ */}
          <div style={{
            background: 'rgba(249, 115, 22, 0.05)',
            border: '1px solid rgba(249, 115, 22, 0.25)',
            borderRadius: '12px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="badge badge-rabbit">3. Worker Queues</span>
                <Cpu size={14} color="#fb923c" />
              </div>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffedd5', marginBottom: '4px' }}>
                RabbitMQ Workers
              </h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                Smart routing & explicit ACKs
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.68rem' }} className="mono">
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fb923c' }}>
                <span>💳 Payment:</span>
                <span>{rabbitMetrics['order.payment']?.acked || 0} ACK</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fb923c' }}>
                <span>📦 Inventory:</span>
                <span>{rabbitMetrics['order.inventory']?.acked || 0} ACK</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fb923c' }}>
                <span>✉️ Email:</span>
                <span>{rabbitMetrics['order.notification']?.acked || 0} ACK</span>
              </div>
            </div>
          </div>

          {/* STEP 4: Cloud DB */}
          <div style={{
            background: 'rgba(16, 185, 129, 0.05)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '12px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="badge badge-supabase">4. Cloud Persistence</span>
                <Database size={14} color="#34d399" />
              </div>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#d1fae5', marginBottom: '4px' }}>
                Supabase PostgreSQL
              </h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                Cloud tables: <code className="mono" style={{ color: '#34d399' }}>orders</code> & <code className="mono" style={{ color: '#34d399' }}>audit_logs</code>
              </p>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.35)', borderRadius: '8px', padding: '8px 10px', fontSize: '0.7rem' }} className="mono">
              <div style={{ color: '#34d399' }}>✓ ACID Storage</div>
              <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>Final state recorded</div>
            </div>
          </div>

        </div>
      </div>

      {/* Live Order Journey Tracker (Shows what happened to the latest order!) */}
      {latestOrder && (
        <div className="card-clean" style={{
          padding: '16px 20px',
          background: 'linear-gradient(90deg, rgba(168, 85, 247, 0.08), rgba(249, 115, 22, 0.08), rgba(16, 185, 129, 0.08))',
          border: '1px solid rgba(255, 255, 255, 0.14)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="badge badge-blue">Live Order Journey</span>
              <span className="mono" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>
                {latestOrder.id}
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                • {latestOrder.customer_name || latestOrder.customerName} ({latestOrder.item})
              </span>
            </div>

            <div>
              {latestOrder.status === 'COMPLETED' && (
                <span className="badge badge-success" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                  ✓ Successfully Processed & Saved to Supabase
                </span>
              )}
              {latestOrder.status === 'FAILED_PROCESSING' && (
                <span className="badge badge-failed" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                  ✗ Payment Declined → Routed to RabbitMQ DLQ
                </span>
              )}
              {latestOrder.status !== 'COMPLETED' && latestOrder.status !== 'FAILED_PROCESSING' && (
                <span className="badge badge-pending" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                  ⋯ Processing in Flight
                </span>
              )}
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '8px',
            fontSize: '0.75rem'
          }}>
            {/* Step 1: Ingested */}
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 10px', borderRadius: '8px', borderLeft: '3px solid #a855f7' }}>
              <div style={{ color: '#c084fc', fontWeight: 600 }}>1. Kafka Stream</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }} className="mono">
                Partition {latestOrder.kafka_partition ?? 0} (Offset {latestOrder.kafka_offset ?? 0})
              </div>
            </div>

            {/* Step 2: Routed */}
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 10px', borderRadius: '8px', borderLeft: '3px solid #facc15' }}>
              <div style={{ color: '#facc15', fontWeight: 600 }}>2. Task Bridge</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                Dispatched to RabbitMQ
              </div>
            </div>

            {/* Step 3: Workers */}
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 10px', borderRadius: '8px', borderLeft: '3px solid #fb923c' }}>
              <div style={{ color: '#fb923c', fontWeight: 600 }}>3. RabbitMQ Workers</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                Pay: {tasks.payment || 'Queued'} • Inv: {tasks.inventory || 'Queued'} • Notif: {tasks.notification || 'Queued'}
              </div>
            </div>

            {/* Step 4: Database */}
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 10px', borderRadius: '8px', borderLeft: `3px solid ${latestOrder.status === 'FAILED_PROCESSING' ? '#ef4444' : '#10b981'}` }}>
              <div style={{ color: latestOrder.status === 'FAILED_PROCESSING' ? '#f87171' : '#34d399', fontWeight: 600 }}>
                4. Supabase DB
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                Status: {latestOrder.status}
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
