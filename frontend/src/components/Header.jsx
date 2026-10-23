import React from 'react';
import { Layers, Database, BookOpen, Settings, CheckCircle2, ArrowRight } from 'lucide-react';

export default function Header({ status, onOpenDbModal, onOpenGuideModal, activeTab, setActiveTab }) {
  const isDbConnected = status.database?.isConnected;
  const dbProvider = status.database?.provider || 'In-Memory';

  return (
    <header style={{ marginBottom: '20px' }}>
      {/* Top Navbar */}
      <div className="card-clean" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #8b5cf6, #f97316)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
          }}>
            <Layers size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
                Kafka + RabbitMQ Pipeline
              </h1>
              <span className="badge badge-kafka">Live System</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              From Event Stream to Worker Queues to Cloud PostgreSQL
            </p>
          </div>
        </div>

        {/* Live Service Indicators & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          
          {/* Kafka Badge */}
          <div className="badge badge-kafka" style={{ padding: '5px 10px', fontSize: '0.75rem' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#c084fc', display: 'inline-block' }} />
            Kafka: <strong>orders.stream</strong>
          </div>

          {/* RabbitMQ Badge */}
          <div className="badge badge-rabbit" style={{ padding: '5px 10px', fontSize: '0.75rem' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fb923c', display: 'inline-block' }} />
            RabbitMQ: <strong>3 Workers</strong>
          </div>

          {/* Supabase Cloud Badge */}
          <div 
            onClick={onOpenDbModal}
            className="badge badge-supabase" 
            style={{ padding: '5px 10px', fontSize: '0.75rem', cursor: 'pointer' }}
            title="Click to view database settings"
          >
            <Database size={12} />
            Supabase: <strong>{isDbConnected ? 'Connected (Cloud)' : 'In-Memory'}</strong>
          </div>

          <button
            onClick={onOpenGuideModal}
            className="btn-ghost"
            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
          >
            <BookOpen size={14} /> How it Works
          </button>
        </div>
      </div>

      {/* Clean Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
        <button
          onClick={() => setActiveTab('pipeline')}
          style={{
            background: activeTab === 'pipeline' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)',
            color: activeTab === 'pipeline' ? '#c084fc' : 'var(--text-secondary)',
            border: `1px solid ${activeTab === 'pipeline' ? 'rgba(139, 92, 246, 0.4)' : 'var(--border-color)'}`,
            borderRadius: '10px',
            padding: '8px 16px',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          🚀 1. Interactive Pipeline & Dispatcher
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          style={{
            background: activeTab === 'orders' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)',
            color: activeTab === 'orders' ? '#34d399' : 'var(--text-secondary)',
            border: `1px solid ${activeTab === 'orders' ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-color)'}`,
            borderRadius: '10px',
            padding: '8px 16px',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          🗄️ 2. Supabase Cloud Ledger (Orders)
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          style={{
            background: activeTab === 'logs' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)',
            color: activeTab === 'logs' ? '#60a5fa' : 'var(--text-secondary)',
            border: `1px solid ${activeTab === 'logs' ? 'rgba(59, 130, 246, 0.4)' : 'var(--border-color)'}`,
            borderRadius: '10px',
            padding: '8px 16px',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          📡 3. Live Logs Stream
        </button>
      </div>
    </header>
  );
}
