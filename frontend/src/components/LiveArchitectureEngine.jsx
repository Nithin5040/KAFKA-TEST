import React, { useState } from 'react';
import { Server, Database, Cpu, Radio, CheckCircle2, Clock, XCircle, Zap, Terminal, RefreshCw, Layers, ArrowRight, ShieldCheck, Mail, PackageCheck, CreditCard, AlertOctagon } from 'lucide-react';

export default function LiveArchitectureEngine({ status, stats, rabbitMetrics, latestOrder, latestEvent, orders, logs, onRefresh, onBatchStream }) {
  const [activeEngineTab, setActiveEngineTab] = useState('pipeline'); // 'pipeline' | 'ledger' | 'terminal'
  const tasks = latestOrder?.rabbit_tasks || {};

  // Determine which stage is currently active
  const isCompleted = latestOrder?.status === 'COMPLETED';
  const isFailed = latestOrder?.status === 'FAILED_PROCESSING';
  const isProcessing = latestOrder?.status === 'PROCESSING';
  const isKafkaIngested = latestOrder?.status === 'KAFKA_INGESTED';

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#090d16',
      color: '#f8fafc',
      overflowY: 'auto',
      borderLeft: '2px solid rgba(255,255,255,0.12)',
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
    }}>
      
      {/* 1. Header with Real Containers Status */}
      <div style={{
        background: 'rgba(13, 19, 34, 0.95)',
        padding: '12px 18px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.98rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Cpu size={18} color="#8b5cf6" /> Live Backend Architecture Visualizer
              </span>
              <span className="badge badge-kafka" style={{ fontSize: '0.65rem' }}>100% Real Engine</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              Real Docker Kafka (9092) ➔ Real RabbitMQ (5672) ➔ Supabase Cloud DB
            </div>
          </div>

          {/* Real Service Indicators */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <span className="badge badge-kafka" style={{ fontSize: '0.7rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#c084fc', display: 'inline-block' }} />
              Kafka: 9092 (Live)
            </span>
            <span className="badge badge-rabbit" style={{ fontSize: '0.7rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fb923c', display: 'inline-block' }} />
              RabbitMQ: 5672 (Live)
            </span>
            <span className="badge badge-supabase" style={{ fontSize: '0.7rem' }}>
              <Database size={11} />
              Supabase Cloud (Live)
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
          <button
            onClick={() => setActiveEngineTab('pipeline')}
            style={{
              background: activeEngineTab === 'pipeline' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255, 255, 255, 0.03)',
              color: activeEngineTab === 'pipeline' ? '#c084fc' : '#94a3b8',
              border: `1px solid ${activeEngineTab === 'pipeline' ? 'rgba(168, 85, 247, 0.5)' : 'rgba(255, 255, 255, 0.08)'}`,
              borderRadius: '6px',
              padding: '5px 14px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            ⚡ Architecture Canvas
          </button>
          <button
            onClick={() => setActiveEngineTab('ledger')}
            style={{
              background: activeEngineTab === 'ledger' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.03)',
              color: activeEngineTab === 'ledger' ? '#34d399' : '#94a3b8',
              border: `1px solid ${activeEngineTab === 'ledger' ? 'rgba(16, 185, 129, 0.5)' : 'rgba(255, 255, 255, 0.08)'}`,
              borderRadius: '6px',
              padding: '5px 14px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            🗄️ Supabase Cloud Rows ({orders.length})
          </button>
          <button
            onClick={() => setActiveEngineTab('terminal')}
            style={{
              background: activeEngineTab === 'terminal' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.03)',
              color: activeEngineTab === 'terminal' ? '#60a5fa' : '#94a3b8',
              border: `1px solid ${activeEngineTab === 'terminal' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(255, 255, 255, 0.08)'}`,
              borderRadius: '6px',
              padding: '5px 14px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            📡 Real-Time Console
          </button>
        </div>
      </div>

      {/* 2. Visual Architecture Canvas */}
      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        {activeEngineTab === 'pipeline' && (
          <>
            {/* Active Order Banner with Dynamic Progression */}
            <div style={{
              background: isCompleted 
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(168, 85, 247, 0.08))'
                : isFailed 
                ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.18), rgba(249, 115, 22, 0.08))'
                : 'linear-gradient(135deg, rgba(168, 85, 247, 0.12), rgba(249, 115, 22, 0.12))',
              border: `1px solid ${isCompleted ? '#10b981' : isFailed ? '#ef4444' : 'rgba(255, 255, 255, 0.15)'}`,
              borderRadius: '12px',
              padding: '14px 18px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              transition: 'all 0.3s'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="badge badge-kafka">Active Pipeline Order</span>
                {latestOrder && (
                  isCompleted ? (
                    <span className="badge badge-success" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                      <CheckCircle2 size={13} /> ✓ COMPLETED in Supabase
                    </span>
                  ) : isFailed ? (
                    <span className="badge badge-failed" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                      <AlertOctagon size={13} /> ✗ Poisoned / Declined (In RabbitMQ DLQ)
                    </span>
                  ) : (
                    <span className="badge badge-pending" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                      <Clock size={13} /> ⋯ Processing in Real-Time
                    </span>
                  )
                )}
              </div>

              {latestOrder ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                    <span className="mono" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                      {latestOrder.id}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                      Customer: <strong>{latestOrder.customer_name || latestOrder.customerName}</strong>
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                    Product: <strong style={{ color: '#e2e8f0' }}>{latestOrder.item}</strong> (₹{parseFloat(latestOrder.amount || 0).toLocaleString('en-IN')})
                  </div>

                  {/* 4 Steps Stepper with Real-Time Glowing Animation */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '12px' }}>
                    
                    {/* Step 1: Kafka */}
                    <div style={{
                      background: 'rgba(0,0,0,0.4)',
                      padding: '8px',
                      borderRadius: '8px',
                      borderLeft: '3px solid #a855f7',
                      boxShadow: isKafkaIngested ? '0 0 12px rgba(168, 85, 247, 0.4)' : 'none'
                    }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#c084fc' }}>1. Kafka Stream</div>
                      <div style={{ fontSize: '0.65rem', color: '#94a3b8' }} className="mono">
                        Partition #{latestOrder.kafka_partition ?? 0}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: '#a855f7' }} className="mono">
                        Offset: {latestOrder.kafka_offset ?? 0}
                      </div>
                    </div>

                    {/* Step 2: Bridge */}
                    <div style={{
                      background: 'rgba(0,0,0,0.4)',
                      padding: '8px',
                      borderRadius: '8px',
                      borderLeft: '3px solid #facc15'
                    }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#facc15' }}>2. Bridge</div>
                      <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>order.exchange</div>
                      <div style={{ fontSize: '0.65rem', color: '#facc15' }}>Fanout: 3 Queues</div>
                    </div>

                    {/* Step 3: RabbitMQ */}
                    <div style={{
                      background: 'rgba(0,0,0,0.4)',
                      padding: '8px',
                      borderRadius: '8px',
                      borderLeft: '3px solid #fb923c',
                      boxShadow: isProcessing ? '0 0 12px rgba(249, 115, 22, 0.4)' : 'none'
                    }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#fb923c' }}>3. RabbitMQ</div>
                      <div style={{ fontSize: '0.62rem', color: tasks.payment === 'CONFIRMED' ? '#34d399' : tasks.payment === 'FAILED' ? '#f87171' : '#facc15' }}>
                        Pay: {tasks.payment || 'Queued'}
                      </div>
                      <div style={{ fontSize: '0.62rem', color: tasks.inventory === 'RESERVED' ? '#34d399' : '#facc15' }}>
                        Inv: {tasks.inventory || 'Queued'}
                      </div>
                      <div style={{ fontSize: '0.62rem', color: tasks.notification === 'SENT' ? '#34d399' : '#facc15' }}>
                        Email: {tasks.notification || 'Queued'}
                      </div>
                    </div>

                    {/* Step 4: Supabase */}
                    <div style={{
                      background: 'rgba(0,0,0,0.4)',
                      padding: '8px',
                      borderRadius: '8px',
                      borderLeft: `3px solid ${isFailed ? '#ef4444' : '#10b981'}`,
                      boxShadow: isCompleted ? '0 0 12px rgba(16, 185, 129, 0.4)' : 'none'
                    }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: isFailed ? '#f87171' : '#34d399' }}>
                        4. Supabase DB
                      </div>
                      <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>PostgreSQL Cloud</div>
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, color: isFailed ? '#f87171' : isCompleted ? '#34d399' : '#facc15' }}>
                        {latestOrder.status}
                      </div>
                    </div>

                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', padding: '10px 0' }}>
                  Click <strong>"BUY NOW"</strong> on any product in Flipkart (left half) to see it stream live!
                </div>
              )}
            </div>

            {/* 3. The Animated Flowchart Visualization */}
            <div style={{
              background: '#0d1322',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '16px',
              position: 'relative'
            }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#e2e8f0', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={16} color="#8b5cf6" /> Live Animated Data Flow
              </div>

              {/* FLOW DIAGRAM CONTAINER */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                {/* NODE 1: Apache Kafka */}
                <div style={{
                  background: 'rgba(168, 85, 247, 0.08)',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: isKafkaIngested ? '0 0 16px rgba(168, 85, 247, 0.5)' : 'none',
                  transition: 'all 0.3s'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Server size={18} color="#c084fc" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f3e8ff' }}>
                        Apache Kafka (KRaft Broker)
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#c084fc' }} className="mono">
                        Topic: orders.stream [Partitions: 0, 1, 2]
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }} className="mono">
                    <span className="badge badge-kafka" style={{ fontSize: '0.7rem' }}>
                      {stats.kafkaProduced || 0} Events Ingested
                    </span>
                    <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '2px' }}>
                      Port: 9092 (Docker)
                    </div>
                  </div>
                </div>

                {/* Animated Flow Arrow 1 */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '14px' }}>
                  <svg width="24" height="14" viewBox="0 0 24 14">
                    <line x1="12" y1="0" x2="12" y2="10" stroke="#a855f7" strokeWidth="2" className="flow-active" />
                    <polygon points="8,8 12,14 16,8" fill="#a855f7" />
                  </svg>
                </div>

                {/* NODE 2: Stream-to-Task Bridge */}
                <div style={{
                  background: 'rgba(234, 179, 8, 0.08)',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(234, 179, 8, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ArrowRight size={18} color="#facc15" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fef08a' }}>
                        Kafka Bridge Consumer
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#facc15' }}>
                        Translates Stream Events ➔ RabbitMQ Work Tasks
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }} className="mono">
                    <span className="badge" style={{ background: 'rgba(234, 179, 8, 0.2)', color: '#facc15' }}>
                      Exchange: order.exchange
                    </span>
                  </div>
                </div>

                {/* Animated Flow Arrow 2 */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '14px' }}>
                  <svg width="24" height="14" viewBox="0 0 24 14">
                    <line x1="12" y1="0" x2="12" y2="10" stroke="#fb923c" strokeWidth="2" className="flow-active" />
                    <polygon points="8,8 12,14 16,8" fill="#fb923c" />
                  </svg>
                </div>

                {/* NODE 3: RabbitMQ Work Queues & 3 Parallel Microservice Workers */}
                <div style={{
                  background: 'rgba(249, 115, 22, 0.08)',
                  border: '1px solid rgba(249, 115, 22, 0.3)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  boxShadow: isProcessing ? '0 0 16px rgba(249, 115, 22, 0.5)' : 'none'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Cpu size={16} color="#fb923c" />
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ffedd5' }}>
                        RabbitMQ Broker (Port: 5672)
                      </span>
                    </div>
                    <span className="badge badge-rabbit">
                      {stats.rabbitAcked || 0} Total ACKs
                    </span>
                  </div>

                  {/* 3 WORKER QUEUES GRID */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr) 1fr', gap: '6px' }}>
                    
                    {/* Worker 1: Payment */}
                    <div style={{
                      background: 'rgba(0,0,0,0.4)',
                      border: `1px solid ${tasks.payment === 'CONFIRMED' ? '#10b981' : tasks.payment === 'FAILED' ? '#ef4444' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: '6px',
                      padding: '8px',
                      textAlign: 'center'
                    }}>
                      <CreditCard size={14} color="#fb923c" style={{ margin: '0 auto 4px auto' }} />
                      <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#ffffff' }}>order.payment</div>
                      <div style={{ fontSize: '0.65rem', color: tasks.payment === 'CONFIRMED' ? '#34d399' : tasks.payment === 'FAILED' ? '#f87171' : '#facc15', fontWeight: 600 }}>
                        {tasks.payment === 'CONFIRMED' ? '✓ ACK Paid' : tasks.payment === 'FAILED' ? '✗ NACK (DLQ)' : 'Processing..'}
                      </div>
                    </div>

                    {/* Worker 2: Inventory */}
                    <div style={{
                      background: 'rgba(0,0,0,0.4)',
                      border: `1px solid ${tasks.inventory === 'RESERVED' ? '#10b981' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: '6px',
                      padding: '8px',
                      textAlign: 'center'
                    }}>
                      <PackageCheck size={14} color="#fb923c" style={{ margin: '0 auto 4px auto' }} />
                      <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#ffffff' }}>order.inventory</div>
                      <div style={{ fontSize: '0.65rem', color: tasks.inventory === 'RESERVED' ? '#34d399' : '#facc15', fontWeight: 600 }}>
                        {tasks.inventory === 'RESERVED' ? '✓ Stock Locked' : 'Allocating..'}
                      </div>
                    </div>

                    {/* Worker 3: Notification */}
                    <div style={{
                      background: 'rgba(0,0,0,0.4)',
                      border: `1px solid ${tasks.notification === 'SENT' ? '#10b981' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: '6px',
                      padding: '8px',
                      textAlign: 'center'
                    }}>
                      <Mail size={14} color="#fb923c" style={{ margin: '0 auto 4px auto' }} />
                      <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#ffffff' }}>order.notification</div>
                      <div style={{ fontSize: '0.65rem', color: tasks.notification === 'SENT' ? '#34d399' : '#facc15', fontWeight: 600 }}>
                        {tasks.notification === 'SENT' ? '✓ Email Sent' : 'Queued..'}
                      </div>
                    </div>

                    {/* DLQ Dead Letter Queue */}
                    <div style={{
                      background: 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.3)',
                      borderRadius: '6px',
                      padding: '8px',
                      textAlign: 'center'
                    }}>
                      <AlertOctagon size={14} color="#f87171" style={{ margin: '0 auto 4px auto' }} />
                      <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#f87171' }}>order.dlq</div>
                      <div style={{ fontSize: '0.65rem', color: '#f87171', fontWeight: 600 }}>
                        {rabbitMetrics['order.dlq']?.count || 0} Poisoned
                      </div>
                    </div>

                  </div>
                </div>

                {/* Animated Flow Arrow 3 */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '14px' }}>
                  <svg width="24" height="14" viewBox="0 0 24 14">
                    <line x1="12" y1="0" x2="12" y2="10" stroke="#10b981" strokeWidth="2" className="flow-active" />
                    <polygon points="8,8 12,14 16,8" fill="#10b981" />
                  </svg>
                </div>

                {/* NODE 4: Supabase Cloud PostgreSQL */}
                <div style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: isCompleted ? '0 0 16px rgba(16, 185, 129, 0.5)' : 'none',
                  transition: 'all 0.3s'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Database size={18} color="#34d399" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#d1fae5' }}>
                        Supabase PostgreSQL (Cloud Database)
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#34d399' }} className="mono">
                        Table: orders (AWS Sydney Cluster)
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }} className="mono">
                    <span className="badge badge-supabase" style={{ fontSize: '0.7rem' }}>
                      {stats.dbWrites || 0} Cloud Commits
                    </span>
                    <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '2px' }}>
                      SSL Encrypted
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Flash Sale High Throughput Load Burst */}
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#facc15', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Zap size={14} color="#facc15" /> Flipkart Big Billion Day Flash Sale Simulation
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                  Simulate concurrent customer purchases streaming into Kafka in parallel:
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => onBatchStream(5)}
                  className="btn-ghost"
                  style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                >
                  ⚡ Stream 5 Orders
                </button>
                <button
                  onClick={() => onBatchStream(15)}
                  className="btn-ghost"
                  style={{ fontSize: '0.75rem', padding: '6px 12px', borderColor: 'rgba(234, 179, 8, 0.4)', color: '#facc15' }}
                >
                  🚀 Stream 15 Orders
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
                  Real PostgreSQL rows hosted in Supabase Cloud
                </div>
              </div>
              <button onClick={onRefresh} className="btn-ghost" style={{ padding: '4px 8px', fontSize: '0.72rem' }}>
                <RefreshCw size={12} /> Refresh
              </button>
            </div>

            <div style={{ overflowY: 'auto', maxHeight: '520px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                      <span className="badge badge-failed">✗ DLQ Poisoned</span>
                    ) : (
                      <span className="badge badge-pending">⋯ In Flight</span>
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
