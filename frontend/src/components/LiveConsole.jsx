import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Trash2, Filter } from 'lucide-react';

export default function LiveConsole({ logs, onClear }) {
  const [filter, setFilter] = useState('ALL');
  const scrollRef = useRef(null);

  const filteredLogs = logs.filter(log => {
    if (filter === 'ALL') return true;
    return log.stage === filter;
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getStageColor = (stage) => {
    switch (stage) {
      case 'KAFKA': return '#c084fc';
      case 'RABBITMQ': return '#fb923c';
      case 'CLOUD_DB': return '#34d399';
      case 'SYSTEM': return '#60a5fa';
      default: return '#94a3b8';
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', marginTop: '24px' }}>
      
      {/* Console Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={18} color="#60a5fa" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Real-Time Pipeline Telemetry & Execution Stream</h3>
          <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', fontSize: '0.65rem' }}>
            WebSocket Live
          </span>
        </div>

        {/* Filter Chips & Clear */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {['ALL', 'KAFKA', 'RABBITMQ', 'CLOUD_DB', 'SYSTEM'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                color: filter === f ? '#ffffff' : 'var(--text-muted)',
                border: `1px solid ${filter === f ? 'var(--border-highlight)' : 'var(--border-color)'}`,
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '0.7rem',
                cursor: 'pointer',
                fontWeight: filter === f ? 600 : 400
              }}
            >
              {f}
            </button>
          ))}
          {onClear && (
            <button
              onClick={onClear}
              className="btn-secondary"
              style={{ padding: '4px 8px', fontSize: '0.7rem', marginLeft: '6px' }}
              title="Clear logs"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Terminal Viewport */}
      <div
        ref={scrollRef}
        style={{
          height: '200px',
          overflowY: 'auto',
          background: '#06090f',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '12px 16px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.72rem',
          lineHeight: '1.6'
        }}
      >
        {filteredLogs.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', padding: '16px 0', textAlign: 'center' }}>
            Awaiting pipeline events... Dispatch an order to watch the live streaming telemetry!
          </div>
        ) : (
          filteredLogs.map((log) => {
            const timeStr = log.timestamp ? log.timestamp.split('T')[1]?.slice(0, 8) : '--:--:--';
            const stageColor = getStageColor(log.stage);
            return (
              <div key={log.id} style={{ display: 'flex', gap: '10px', alignItems: 'baseline', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>[{timeStr}]</span>
                <span style={{ color: stageColor, fontWeight: 700, width: '90px', flexShrink: 0 }}>[{log.stage}]</span>
                <span style={{ color: '#e2e8f0', wordBreak: 'break-word' }}>{log.message}</span>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
