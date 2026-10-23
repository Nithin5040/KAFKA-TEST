import React, { useState } from 'react';
import { Server, Database, Cpu, Radio, CheckCircle2, Clock, XCircle, Zap, Terminal, RefreshCw, Layers, ArrowRight } from 'lucide-react';

export default function LiveArchitectureEngine({ status, stats, rabbitMetrics, latestOrder, latestEvent, orders, logs, onRefresh, onBatchStream }) {
  const [activeEngineTab, setActiveEngineTab] = useState('pipeline'); // 'pipeline' | 'ledger' | 'terminal'
  const tasks = latestOrder?.rabbit_tasks || {};

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#0d1322',
      color: '#f8fafc',
      overflowY: 'auto',
      borderLeft: '2px solid rgba(255,255,255,0.1)',
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
    }}>
      
      {/* 1. Header with Live Real Infrastructure Status */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.95)',
        padding: '12px 18px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 40
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.98rem', fontWeight: 800, color: '#ffffff' }}>
                ⚙️ Backend Architecture (Live)
              </span>
              <span className="badge badge-kafka" style={{ fontSize: '0.65rem' }}>Real Containers</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              Kafka KRaft + RabbitMQ Queues + Supabase Cloud PostgreSQL
            </div>
          </div>

          {/* Service Pills */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <span className="badge badge-kafka" style={{ fontSize: '0.7rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#c084fc', display: 'inline-block' }} />
              Kafka: 9092
            </span>
            <span className="badge badge-rabbit" style={{ fontSize: '0.7rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fb923c', display: 'inline-block' }} />
              RabbitMQ: 5672
            </span>
            <span className="badge badge-supabase" style={{ fontSize: '0.7rem' }}>
              <Database size={11} />
              Supabase DB
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
          <button
            onClick={() => setActiveEngineTab('pipeline')}
            style={{
              background: activeEngineTab === 'pipeline' ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
              color: activeEngineTab === 'pipeline' ? '#c084fc' : '#94a3b8',
              border: `1px solid ${activeEngineTab === 'pipeline' ? 'rgba(168, 85, 247, 0.4)' : 'transparent'}`,
              borderRadius: '6px',
              padding: '5px 12px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            🔄 Live Order Pipeline
          </button>
          <button
            onClick={() => setActiveEngineTab('ledger')}
            style={{
              background: activeEngineTab === 'ledger' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
              color: activeEngineTab === 'ledger' ? '#34d399' : '#94a3b8',
              border: `1px solid ${activeEngineTab === 'ledger' ? 'rgba(16, 185, 129, 0.4)' : 'transparent'}`,
              borderRadius: '6px',
              padding: '5px 12px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            🗄️ Supabase DB Ledger ({orders.length})
          </button>
          <button
            onClick={() => setActiveEngineTab('terminal')}
            style={{
              background: activeEngineTab === 'terminal' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              color: activeEngineTab === 'terminal' ? '#60a5fa' : '#94a3b8',
              border: `1px solid ${activeEngineTab === 'terminal' ? 'rgba(59, 130, 246, 0.4)' : 'transparent'}`,
              borderRadius: '6px',
              padding: '5px 12px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            📡 Real-Time Console
          </button>
        </div>
      </div>

      {/* 2. Main Content Body */}
      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        {/* TAB 1: Live Pipeline */}
        {activeEngineTab === 'pipeline' && (
          <>
            {/* Active Order Spotlight */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(249, 115, 22, 0.1), rgba(16, 185, 129, 0.1))',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              padding: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span className="badge badge-kafka">Active Flipkart Order</span>
                {latestOrder ? (
                  latestOrder.status === 'COMPLETED' ? (
                    <span className="badge badge-success">✓ COMPLETED in Supabase</span>
                  ) : latestOrder.status === 'FAILED_PROCESSING' ? (
                    <span className="badge badge-failed">✗ DLQ Poisoned / Declined</span>
                  ) : (
                    <span className="badge badge-pending">⋯ In Flight</span>
                  )
                ) : (
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Awaiting first purchase...</span>
                )}
              </div>

              {latestOrder ? (
                <div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }} className="mono">
                    {latestOrder.id}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '2px' }}>
                    Item: <strong>{latestOrder.item}</strong> (₹{parseFloat(latestOrder.amount || 0).toLocaleString('en-IN')})
                  </div>

                  {/* 4 Steps Stepper */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '12px' }}>
                    
                    {/* Step 1: Kafka */}
                    <div style={{ background: 'rgba(0,0,0,0.4)', padding: '8px', borderRadius: '6px', borderLeft: '3px solid #a855f7' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#c084fc' }}>1. Kafka Stream</div>
                      <div style={{ fontSize: '0.65rem', color: '#94a3b8' }} className="mono">
                        Partition #{latestOrder.kafka_partition ?? 0}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: '#a855f7' }} className="mono">
                        Offset: {latestOrder.kafka_offset ?? 0}
                      </div>
                    </div>

                    {/* Step 2: Bridge */}
                    <div style={{ background: 'rgba(0,0,0,0.4)', padding: '8px', borderRadius: '6px', borderLeft: '3px solid #facc15' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#facc15' }}>2. Bridge</div>
                      <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>order.exchange</div>
                      <div style={{ fontSize: '0.65rem', color: '#facc15' }}>3 Tasks Fanout</div>
                    </div>

                    {/* Step 3: RabbitMQ */}
                    <div style={{ background: 'rgba(0,0,0,0.4)', padding: '8px', borderRadius: '6px', borderLeft: '3px solid #fb923c' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fb923c' }}>3. RabbitMQ</div>
                      <div style={{ fontSize: '0.62rem', color: '#cbd5e1' }}>
                        Pay: {tasks.payment || '..'}
                      </div>
                      <div style={{ fontSize: '0.62rem', color: '#cbd5e1' }}>
                        Inv: {tasks.inventory || '..'}
                      </div>
                    </div>

                    {/* Step 4: Supabase */}
                    <div style={{ background: 'rgba(0,0,0,0.4)', padding: '8px', borderRadius: '6px', borderLeft: `3px solid ${latestOrder.status === 'FAILED_PROCESSING' ? '#ef4444' : '#10b981'}` }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: latestOrder.status === 'FAILED_PROCESSING' ? '#f87171' : '#34d399' }}>
                        4. Supabase DB
                      </div>
                      <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>PostgreSQL</div>
                      <div style={{ fontSize: '0.65rem', color: latestOrder.status === 'FAILED_PROCESSING' ? '#f87171' : '#34d399' }}>
                        {latestOrder.status}
                      </div>
                    </div>

                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', padding: '10px 0' }}>
                  Click <strong>"BUY NOW"</strong> on any product in the Flipkart store (left side) to see it stream through Kafka, RabbitMQ, and Supabase!
                </div>
              )}
            </div>

            {/* The 4 Architectural Blocks */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              
              {/* Box 1: Kafka Cluster */}
              <div style={{ background: 'rgba(168, 85, 247, 0.06)', border: '1px solid rgba(168, 85, 247, 0.25)', borderRadius: '10px', padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e9d5ff' }}>Apache Kafka Broker</span>
                  <Server size={14} color="#c084fc" />
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '8px' }}>
                  Topic: <code className="mono" style={{ color: '#c084fc' }}>orders.stream</code> (KRaft mode)
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 8px', borderRadius: '6px', fontSize: '0.68rem' }} className="mono">
                  <div>Ingested: <strong style={{ color: '#c084fc' }}>{stats.kafkaProduced || 0} events</strong></div>
                  <div style={{ color: '#64748b', marginTop: '2px' }}>Port: 9092 (Docker Container)</div>
                </div>
              </div>

              {/* Box 2: RabbitMQ Queues */}
              <div style={{ background: 'rgba(249, 115, 22, 0.06)', border: '1px solid rgba(249, 115, 22, 0.25)', borderRadius: '10px', padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffedd5' }}>RabbitMQ Work Queues</span>
                  <Cpu size={14} color="#fb923c" />
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '8px' }}>
                  Exchange: <code className="mono" style={{ color: '#fb923c' }}>order.exchange</code>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 8px', borderRadius: '6px', fontSize: '0.68rem' }} className="mono">
                  <div>Total Acked: <strong style={{ color: '#fb923c' }}>{stats.rabbitAcked || 0} tasks</strong></div>
                  <div style={{ color: '#64748b', marginTop: '2px' }}>Port: 5672 (Docker Container)</div>
                </div>
              </div>

            </div>

            {/* RabbitMQ Queues Breakdown */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '8px' }}>
                Active RabbitMQ Worker Queues:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', fontSize: '0.7rem' }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ color: '#fb923c', fontWeight: 700 }}>order.payment</div>
                  <div style={{ color: '#34d399', fontSize: '0.65rem' }}>{rabbitMetrics['order.payment']?.acked || 0} ACK</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ color: '#fb923c', fontWeight: 700 }}>order.inventory</div>
                  <div style={{ color: '#34d399', fontSize: '0.65rem' }}>{rabbitMetrics['order.inventory']?.acked || 0} ACK</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ color: '#fb923c', fontWeight: 700 }}>order.notif</div>
                  <div style={{ color: '#34d399', fontSize: '0.65rem' }}>{rabbitMetrics['order.notification']?.acked || 0} ACK</div>
                </div>
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', padding: '6px', borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ color: '#f87171', fontWeight: 700 }}>order.dlq</div>
                  <div style={{ color: '#f87171', fontSize: '0.65rem' }}>{rabbitMetrics['order.dlq']?.count || 0} Poisoned</div>
                </div>
              </div>
            </div>

            {/* High-Volume Big Billion Days Flash Sale Burst Simulator */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#facc15', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Zap size={14} color="#facc15" /> Flipkart Flash Sale Load Burst
                </span>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Load Testing</span>
              </div>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '8px' }}>
                Simulate 5 or 15 concurrent customers placing orders simultaneously across Kafka partitions:
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => onBatchStream(5)}
                  className="btn-ghost"
                  style={{ flex: 1, fontSize: '0.75rem', justifyContent: 'center', padding: '6px 10px' }}
                >
                  ⚡ Burst 5 Orders
                </button>
                <button
                  onClick={() => onBatchStream(15)}
                  className="btn-ghost"
                  style={{ flex: 1, fontSize: '0.75rem', justifyContent: 'center', borderColor: 'rgba(234, 179, 8, 0.4)', color: '#facc15', padding: '6px 10px' }}
                >
                  🚀 Burst 15 Orders
                </button>
              </div>
            </div>
          </>
        )}

        {/* TAB 2: Supabase Cloud Ledger */}
        {activeEngineTab === 'ledger' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                  Supabase Cloud Database (<code className="mono" style={{ color: '#34d399' }}>orders</code> table)
                </span>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  Direct live records saved in AWS Sydney cluster
                </div>
              </div>
              <button onClick={onRefresh} className="btn-ghost" style={{ padding: '4px 8px', fontSize: '0.72rem' }}>
                <RefreshCw size={12} /> Refresh
              </button>
            </div>

            <div style={{ overflowY: 'auto', maxHeight: '480px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="mono" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ffffff' }}>{ord.id}</span>
                      <span className="badge badge-kafka" style={{ fontSize: '0.62rem' }}>P#{ord.kafka_partition ?? 0}</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                      {ord.customer_name} • <span style={{ color: '#38bdf8' }}>₹{parseFloat(ord.amount || 0).toLocaleString('en-IN')}</span> ({ord.item})
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    {ord.status === 'COMPLETED' ? (
                      <span className="badge badge-success">✓ Completed</span>
                    ) : ord.status === 'FAILED_PROCESSING' ? (
                      <span className="badge badge-failed">✗ DLQ Routed</span>
                    ) : (
                      <span className="badge badge-pending">⋯ Processing</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Real-Time Console */}
        {activeEngineTab === 'terminal' && (
          <div style={{
            flex: 1,
            background: '#06090f',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px',
            padding: '12px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            lineHeight: 1.6,
            overflowY: 'auto',
            maxHeight: '520px'
          }}>
            {logs.slice(-50).map((l, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                <span style={{ color: '#64748b' }}>[{l.timestamp ? l.timestamp.split('T')[1]?.slice(0, 8) : '--:--:--'}]</span>
                <span style={{
                  color: l.stage === 'KAFKA' ? '#c084fc' : l.stage === 'RABBITMQ' ? '#fb923c' : l.stage === 'CLOUD_DB' ? '#34d399' : '#60a5fa',
                  fontWeight: 700
                }}>
                  [{l.stage}]
                </span>
                <span style={{ color: '#cbd5e1' }}>{l.message}</span>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}
