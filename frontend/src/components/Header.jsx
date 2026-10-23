import React from 'react';
import { Layers, Database, Radio, BookOpen, Settings, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';

export default function Header({ status, onOpenDbModal, onOpenGuideModal }) {
  const isDbConnected = status.database?.isConnected;
  const dbProvider = status.database?.provider || 'In-Memory';
  const isKafkaReal = status.kafka?.mode === 'REAL_BROKER';
  const isRabbitReal = status.rabbitmq?.mode === 'REAL_BROKER';

  return (
    <header className="glass-panel" style={{ padding: '16px 24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #8b5cf6, #f97316)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)'
          }}>
            <Layers size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #ffffff, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Kafka & RabbitMQ Integration Studio
              </h1>
              <span className="badge badge-kafka" style={{ fontSize: '0.65rem' }}>Distributed Architecture</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Dual-Broker Architecture • Event Streaming + Message Queues + Cloud Database
            </p>
          </div>
        </div>

        {/* Live Service Status Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          
          {/* Kafka Status */}
          <div style={{
            background: 'rgba(168, 85, 247, 0.1)',
            border: '1px solid rgba(168, 85, 247, 0.25)',
            borderRadius: '10px',
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#a855f7',
              boxShadow: '0 0 8px #a855f7'
            }} />
            <div style={{ fontSize: '0.75rem' }}>
              <span style={{ color: '#a855f7', fontWeight: 700 }}>KAFKA: </span>
              <span style={{ color: 'var(--text-secondary)' }}>
                {isKafkaReal ? 'Live Docker (9092)' : 'Interactive Simulator'}
              </span>
            </div>
          </div>

          {/* RabbitMQ Status */}
          <div style={{
            background: 'rgba(249, 115, 22, 0.1)',
            border: '1px solid rgba(249, 115, 22, 0.25)',
            borderRadius: '10px',
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#f97316',
              boxShadow: '0 0 8px #f97316'
            }} />
            <div style={{ fontSize: '0.75rem' }}>
              <span style={{ color: '#f97316', fontWeight: 700 }}>RABBITMQ: </span>
              <span style={{ color: 'var(--text-secondary)' }}>
                {isRabbitReal ? 'Live Docker (5672)' : 'Interactive Simulator'}
              </span>
            </div>
          </div>

          {/* Cloud DB Status */}
          <div 
            onClick={onOpenDbModal}
            style={{
              background: isDbConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
              border: `1px solid ${isDbConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
              borderRadius: '10px',
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
            title="Click to configure Cloud Database (Supabase / Neon)"
          >
            <Database size={14} color={isDbConnected ? '#10b981' : '#f59e0b'} />
            <div style={{ fontSize: '0.75rem' }}>
              <span style={{ color: isDbConnected ? '#10b981' : '#f59e0b', fontWeight: 700 }}>CLOUD DB: </span>
              <span style={{ color: 'var(--text-secondary)' }}>
                {isDbConnected ? dbProvider : 'In-Memory (Click to Connect)'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <button 
            id="btn-cloud-db-modal"
            className="btn-secondary" 
            onClick={onOpenDbModal}
            style={{ padding: '7px 12px', fontSize: '0.78rem' }}
          >
            <Settings size={14} /> Connect Cloud DB
          </button>

          <button 
            id="btn-learning-guide"
            className="btn-primary" 
            onClick={onOpenGuideModal}
            style={{ padding: '7px 14px', fontSize: '0.78rem' }}
          >
            <BookOpen size={14} /> Architecture Guide
          </button>
        </div>
      </div>
    </header>
  );
}
