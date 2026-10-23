import React from 'react';
import { ArrowRight, Server, Database, Radio, Cpu, Bell, CreditCard, PackageCheck, AlertOctagon, CheckCircle2 } from 'lucide-react';

export default function PipelineVisualizer({ stats, rabbitMetrics, latestEvent }) {
  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      
      {/* Title & Description */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={18} color="#8b5cf6" /> Live Architecture Pipeline Flow
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Watch events flow from Ingestion (Kafka) through Routing & Worker Queues (RabbitMQ) to Cloud Database
          </p>
        </div>

        {/* Global Pipeline Counters */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 14px', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Kafka Ingested: </span>
            <strong style={{ color: '#c084fc', marginLeft: '4px' }}>{stats.kafkaProduced || 0}</strong>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 14px', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>RabbitMQ Acked: </span>
            <strong style={{ color: '#fb923c', marginLeft: '4px' }}>{stats.rabbitAcked || 0}</strong>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 14px', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Cloud DB Writes: </span>
            <strong style={{ color: '#34d399', marginLeft: '4px' }}>{stats.dbWrites || 0}</strong>
          </div>
        </div>
      </div>

      {/* Visual Pipeline Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        alignItems: 'stretch'
      }}>

        {/* STAGE 1: Client Ingestion */}
        <div className="glass-panel" style={{ padding: '16px', borderLeft: '4px solid #3b82f6', background: 'rgba(15, 23, 42, 0.6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>Stage 1</span>
            <Radio size={16} color="#60a5fa" />
          </div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '6px' }}>REST / Order Ingest</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            Client initiates order creation via HTTP API endpoint.
          </p>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 10px', borderRadius: '8px', fontSize: '0.7rem' }} className="mono">
            <div style={{ color: '#60a5fa' }}>POST /api/orders</div>
            <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>Payload: {`{ id, item, amount }`}</div>
          </div>
        </div>

        {/* STAGE 2: Apache Kafka Event Stream */}
        <div className="glass-panel" style={{ padding: '16px', borderLeft: '4px solid #a855f7', background: 'rgba(168, 85, 247, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span className="badge badge-kafka">Stage 2: Kafka</span>
            <Server size={16} color="#a855f7" />
          </div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '4px', color: '#e9d5ff' }}>Event Commit Log</h3>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
            Topic: <span className="mono" style={{ color: '#c084fc' }}>orders.stream</span>
          </p>

          {/* Partitions Representation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[0, 1, 2].map((pId) => {
              const isCurrentPartition = latestEvent?.partition === pId;
              return (
                <div 
                  key={pId}
                  style={{
                    background: isCurrentPartition ? 'rgba(168, 85, 247, 0.25)' : 'rgba(0,0,0,0.3)',
                    border: `1px solid ${isCurrentPartition ? '#a855f7' : 'rgba(255,255,255,0.05)'}`,
                    borderRadius: '6px',
                    padding: '6px 10px',
                    fontSize: '0.7rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.3s'
                  }}
                  className="mono"
                >
                  <span style={{ color: isCurrentPartition ? '#f3e8ff' : 'var(--text-secondary)' }}>Partition #{pId}</span>
                  <span style={{ fontSize: '0.65rem', color: '#c084fc' }}>
                    {isCurrentPartition ? `Offset: ${latestEvent.offset} (Live)` : 'Partitioned Log'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* STAGE 3: Stream Bridge Consumer */}
        <div className="glass-panel" style={{ padding: '16px', borderLeft: '4px solid #eab308', background: 'rgba(234, 179, 8, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span className="badge" style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#facc15' }}>Stage 3: Bridge</span>
            <ArrowRight size={16} color="#facc15" />
          </div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '6px' }}>Event-to-Task Bridge</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            Consumes Kafka event log & fans out micro-tasks to RabbitMQ queues with routing keys.
          </p>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 10px', borderRadius: '8px', fontSize: '0.7rem' }} className="mono">
            <div style={{ color: '#facc15' }}>Exchange: order.exchange</div>
            <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>Type: Topic Exchange</div>
          </div>
        </div>

        {/* STAGE 4: RabbitMQ Task Queues & Workers */}
        <div className="glass-panel" style={{ padding: '16px', borderLeft: '4px solid #f97316', background: 'rgba(249, 115, 22, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span className="badge badge-rabbit">Stage 4: RabbitMQ</span>
            <Server size={16} color="#f97316" />
          </div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '6px', color: '#ffedd5' }}>Task Routing & Workers</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
            {/* Payment Queue */}
            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '6px', padding: '6px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fb923c' }}>
                <CreditCard size={12} /> order.payment
              </span>
              <span className="badge badge-success" style={{ padding: '2px 6px', fontSize: '0.65rem' }}>
                {rabbitMetrics['order.payment']?.acked || 0} ACK
              </span>
            </div>

            {/* Inventory Queue */}
            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '6px', padding: '6px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fb923c' }}>
                <PackageCheck size={12} /> order.inventory
              </span>
              <span className="badge badge-success" style={{ padding: '2px 6px', fontSize: '0.65rem' }}>
                {rabbitMetrics['order.inventory']?.acked || 0} ACK
              </span>
            </div>

            {/* Notification Queue */}
            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '6px', padding: '6px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fb923c' }}>
                <Bell size={12} /> order.notification
              </span>
              <span className="badge badge-success" style={{ padding: '2px 6px', fontSize: '0.65rem' }}>
                {rabbitMetrics['order.notification']?.acked || 0} ACK
              </span>
            </div>

            {/* Dead Letter Queue (DLQ) */}
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '6px', padding: '6px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f87171' }}>
                <AlertOctagon size={12} /> order.dlq (Dead Letter)
              </span>
              <span className="badge badge-failed" style={{ padding: '2px 6px', fontSize: '0.65rem' }}>
                {rabbitMetrics['order.dlq']?.count || 0} NACK
              </span>
            </div>
          </div>
        </div>

        {/* STAGE 5: Cloud Database Persistence */}
        <div className="glass-panel" style={{ padding: '16px', borderLeft: '4px solid #10b981', background: 'rgba(16, 185, 129, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span className="badge badge-cloud">Stage 5: Cloud DB</span>
            <Database size={16} color="#10b981" />
          </div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '6px', color: '#d1fae5' }}>PostgreSQL Persistence</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            Guaranteed state persistence across all worker subtasks in cloud database.
          </p>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 10px', borderRadius: '8px', fontSize: '0.7rem' }} className="mono">
            <div style={{ color: '#34d399' }}>Table: orders</div>
            <div style={{ color: '#34d399', marginTop: '2px' }}>Table: audit_logs</div>
            <div style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Status: COMPLETED / DLQ</div>
          </div>
        </div>

      </div>

    </div>
  );
}
