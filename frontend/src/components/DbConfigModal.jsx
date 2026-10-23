import React, { useState } from 'react';
import { Database, Key, CheckCircle2, AlertCircle, Copy, HelpCircle } from 'lucide-react';

export default function DbConfigModal({ isOpen, onClose, currentStatus, onConfigSaved }) {
  const [databaseUrl, setDatabaseUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/config/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ databaseUrl })
      });
      const data = await res.json();
      setResult(data);
      if (onConfigSaved) onConfigSaved(data.status);
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const sampleSupabase = 'postgresql://postgres:your-password@db.xxxx.supabase.co:5432/postgres?sslmode=require';
  const sampleNeon = 'postgresql://user:your-password@ep-xxxx.neon.tech/neondb?sslmode=require';

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '620px', padding: '28px', background: 'rgba(15, 23, 42, 0.95)' }}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '10px' }}>
              <Database size={22} color="#10b981" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Connect Cloud PostgreSQL Database</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Directly connect Supabase, Neon, or AWS RDS PostgreSQL
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '6px 12px' }}>
            ✕
          </button>
        </div>

        {/* Current Status Banner */}
        <div style={{
          background: currentStatus?.isConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
          border: `1px solid ${currentStatus?.isConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
          borderRadius: '10px',
          padding: '10px 14px',
          marginBottom: '20px',
          fontSize: '0.78rem'
        }}>
          <div style={{ fontWeight: 600, color: currentStatus?.isConnected ? '#34d399' : '#f59e0b' }}>
            Active Provider: {currentStatus?.provider || 'In-Memory (Fallback)'}
          </div>
          <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
            Connection String: <code className="mono">{currentStatus?.activeUrlMasked || 'None'}</code>
          </div>
        </div>

        {/* Connection Form */}
        <form onSubmit={handleSave}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
              PostgreSQL URI (<code className="mono">DATABASE_URL</code>)
            </label>
            <input
              type="text"
              className="input-field mono"
              placeholder="postgresql://user:password@endpoint.neon.tech/neondb?sslmode=require"
              value={databaseUrl}
              onChange={(e) => setDatabaseUrl(e.target.value)}
              required
              style={{ fontSize: '0.8rem' }}
            />
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              SSL is automatically enabled with <code className="mono">rejectUnauthorized: false</code> for cloud providers.
            </p>
          </div>

          {/* Quick Copy Templates */}
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '10px', marginBottom: '20px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Supported Free Cloud PostgreSQL Providers:
            </div>
            
            {/* Supabase */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.72rem' }}>
              <div>
                <strong style={{ color: '#10b981' }}>Supabase: </strong>
                <span className="mono" style={{ color: 'var(--text-muted)' }}>postgresql://postgres:[PWD]@db.[REF].supabase.co:5432/postgres</span>
              </div>
              <button
                type="button"
                onClick={() => setDatabaseUrl(sampleSupabase)}
                className="btn-secondary"
                style={{ padding: '3px 8px', fontSize: '0.68rem' }}
              >
                Use Template
              </button>
            </div>

            {/* Neon */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem' }}>
              <div>
                <strong style={{ color: '#38bdf8' }}>Neon Tech: </strong>
                <span className="mono" style={{ color: 'var(--text-muted)' }}>postgresql://[USER]:[PWD]@[HOST].neon.tech/neondb?sslmode=require</span>
              </div>
              <button
                type="button"
                onClick={() => setDatabaseUrl(sampleNeon)}
                className="btn-secondary"
                style={{ padding: '3px 8px', fontSize: '0.68rem' }}
              >
                Use Template
              </button>
            </div>
          </div>

          {result && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '0.78rem',
              background: result.status?.isConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: result.status?.isConnected ? '#34d399' : '#f87171'
            }}>
              {result.status?.isConnected
                ? `✓ Connected successfully to ${result.status?.provider}! Schema tables verified.`
                : `✗ ${result.error || result.status?.provider || 'Connection failed'}`}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Verifying...' : 'Save & Connect'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
