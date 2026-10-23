import React from 'react';
import { BookOpen, Layers, Terminal, CheckCircle2, ArrowRight } from 'lucide-react';

export default function LearningModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.82)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '840px', maxHeight: '88vh', overflowY: 'auto', padding: '32px', background: 'rgba(15, 23, 42, 0.98)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px', background: 'linear-gradient(135deg, #8b5cf6, #f97316)', borderRadius: '12px' }}>
              <BookOpen size={24} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Mastering Kafka & RabbitMQ Integration</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Understanding the complementary roles of Event Streaming & Message Queuing
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '6px 14px' }}>
            ✕ Close
          </button>
        </div>

        {/* Section 1: The Core Question - Why Both? */}
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '14px', padding: '20px', marginBottom: '20px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '8px' }}>
            💡 Why do modern enterprise architectures use BOTH Kafka AND RabbitMQ?
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            A common misconception is that you must choose either Kafka <em>or</em> RabbitMQ. In high-scale distributed systems, they serve two fundamentally different paradigms:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '14px' }}>
            {/* Kafka Card */}
            <div style={{ background: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.25)', borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontWeight: 700, color: '#c084fc', marginBottom: '6px' }}>
                Apache Kafka = The Distributed Commit Log
              </div>
              <ul style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', paddingLeft: '18px', lineHeight: 1.6 }}>
                <li><strong>Immutable Stream:</strong> Messages are appended to an append-only log.</li>
                <li><strong>Replayable:</strong> Consumers track offsets and can replay history at any time.</li>
                <li><strong>High Throughput:</strong> Millions of events per second with partition parallelism.</li>
                <li><strong>Best For:</strong> Event sourcing, audit logging, telemetry, analytical feeds.</li>
              </ul>
            </div>

            {/* RabbitMQ Card */}
            <div style={{ background: 'rgba(249, 115, 22, 0.08)', border: '1px solid rgba(249, 115, 22, 0.25)', borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontWeight: 700, color: '#fb923c', marginBottom: '6px' }}>
                RabbitMQ = The Intelligent Message Broker
              </div>
              <ul style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', paddingLeft: '18px', lineHeight: 1.6 }}>
                <li><strong>Complex Routing:</strong> Direct, topic, header, and fanout exchanges.</li>
                <li><strong>Work Queues:</strong> Fair dispatch across competing worker microservices.</li>
                <li><strong>Granular Acks & DLQ:</strong> Per-message explicit ACK/NACK and dead letter queues.</li>
                <li><strong>Best For:</strong> Asynchronous tasks, background jobs, transactional workflows.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 2: How this project implements the pattern */}
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '14px', padding: '20px', marginBottom: '20px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '10px' }}>
            🔄 The Integrated Flow in this Application
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span className="badge badge-kafka" style={{ flexShrink: 0 }}>Step 1</span>
              <div>
                <strong>Ingestion into Kafka:</strong> The order creation request is published to Kafka topic <code className="mono">orders.stream</code> with key <code className="mono">order.id</code>. This guarantees partition ordering and acts as the system's immutable audit log.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span className="badge" style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#facc15', flexShrink: 0 }}>Step 2</span>
              <div>
                <strong>The Bridge Service:</strong> A Kafka consumer reads the raw stream, saves the initial event to Cloud PostgreSQL, and fans out 3 distinct job tasks to RabbitMQ with custom routing keys.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span className="badge badge-rabbit" style={{ flexShrink: 0 }}>Step 3</span>
              <div>
                <strong>RabbitMQ Task Execution & Routing:</strong> RabbitMQ routes messages to dedicated queues:
                <code className="mono" style={{ color: '#fb923c', marginLeft: '4px' }}>order.payment</code>, 
                <code className="mono" style={{ color: '#fb923c', marginLeft: '4px' }}>order.inventory</code>, and 
                <code className="mono" style={{ color: '#fb923c', marginLeft: '4px' }}>order.notification</code>.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', flexShrink: 0 }}>Step 4</span>
              <div>
                <strong>Dead Letter Queue (DLQ) Resilience:</strong> If a worker fails (e.g., payment declined), it sends a <code className="mono">nack</code>, and RabbitMQ automatically routes the poisoned message to the Dead Letter Queue (<code className="mono">order.dlq</code>).
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span className="badge badge-cloud" style={{ flexShrink: 0 }}>Step 5</span>
              <div>
                <strong>Cloud DB Finalization:</strong> As each worker ACKs, the Cloud PostgreSQL database atomically records completion, updating the order to <code className="mono">COMPLETED</code>.
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: How to run Docker Compose */}
        <div style={{ background: 'rgba(0, 0, 0, 0.4)', borderRadius: '14px', padding: '20px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={18} color="#38bdf8" /> Running Real Kafka & RabbitMQ via Docker Compose
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            The root directory contains a pre-configured <code className="mono">docker-compose.yml</code> ready to boot both brokers:
          </p>

          <pre style={{
            background: '#070a10',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '0.78rem',
            color: '#38bdf8',
            marginBottom: '12px'
          }} className="mono">
docker compose up -d
          </pre>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <div>• <strong>Kafka KRaft Broker:</strong> Port 9092 (No ZooKeeper required!)</div>
            <div>• <strong>RabbitMQ Broker:</strong> Port 5672 (AMQP protocol)</div>
            <div>• <strong>RabbitMQ Management Dashboard:</strong> <a href="http://localhost:15672" target="_blank" rel="noreferrer" style={{ color: '#fb923c' }}>http://localhost:15672</a> (user: guest / pass: guest)</div>
          </div>
        </div>

      </div>
    </div>
  );
}
