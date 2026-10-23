# KAFKA-TEST
# 🚀 Apache Kafka & RabbitMQ Integration System

An enterprise-grade, interactive full-stack learning platform demonstrating the dual-broker architecture:
- **Apache Kafka (KRaft mode)**: Distributed commit log for event streaming, order audit logs, and partition parallelism.
- **RabbitMQ (AMQP 0-9-1)**: Task queue with topic exchange routing, worker microservices with ACK/NACK, and Dead Letter Queue (DLQ) handling.
- **Cloud PostgreSQL (Supabase / Neon)**: Cloud database persistence with live schema migration.
- **React.js Dashboard**: Real-time architecture visualizer with WebSocket telemetry, interactive order dispatcher, batch stream load simulator, and orders ledger.

---

## 🏗️ Architecture Blueprint

```
[React Frontend] (http://localhost:3000)
       │
       ▼ (REST API: POST /api/orders)
[Node.js Express Backend] (http://localhost:5000)
       │
       ▼ (Produce Event with Key: order.id)
┌────────────────────────────────────────────────────────┐
│               APACHE KAFKA CLUSTER                     │
│  Topic: orders.stream [Partitions: 0, 1, 2]            │
│  High-Throughput Immutable Commit Log / Event Sourcing │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼ (Consumer Group: order-processing-group)
┌────────────────────────────────────────────────────────┐
│           STREAM-TO-TASK BRIDGE SERVICE                │
│  Ingests Kafka event -> Validates & saves to Cloud DB  │
│  Fans out specialized tasks to RabbitMQ with routes    │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼ (Publish to Topic Exchange: order.exchange)
┌────────────────────────────────────────────────────────┐
│                   RABBITMQ BROKER                      │
│  Routes: order.payment.#, order.inventory.#, etc.      │
├─────────────────┬──────────────────┬───────────────────┤
│  order.payment  │ order.inventory  │order.notification │
│  (Payment Task) │ (Inventory Task) │ (Email Task)      │
│  [ACK/NACK]     │ [ACK/NACK]       │ [ACK/NACK]        │
└────────┬────────┴────────┬─────────┴─────────┬─────────┘
         │                 │                   │
         └────────┬────────┴───────────────────┘
                  │ (NACK Failure Route to order.dlx)
                  ▼
         ┌──────────────────┐
         │    order.dlq     │ (Dead Letter Queue for poisoned/failed messages)
         └──────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────────────────┐
│       CLOUD POSTGRESQL (Supabase / Neon DB)            │
│  Tables: `orders` and `audit_logs`                     │
│  Status: KAFKA_INGESTED -> PROCESSING -> COMPLETED/DLQ │
└────────────────────────────────────────────────────────┘
```

---

## ⚡ Quick Start

### 1. Services Overview
Both backend and frontend are already running and configured:
- **Frontend UI:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **WebSocket Telemetry:** `ws://localhost:5000`

### 2. Running Real Kafka & RabbitMQ via Docker (Optional)
The system includes an automatic high-fidelity simulator that works out-of-the-box. Whenever Docker Desktop is running, you can boot real Kafka & RabbitMQ with a single command:

```powershell
docker compose up -d
```
- **Kafka KRaft Broker:** `localhost:9092`
- **RabbitMQ AMQP Broker:** `localhost:5672`
- **RabbitMQ Management Dashboard:** [http://localhost:15672](http://localhost:15672) (User: `guest` / Pass: `guest`)

### 3. Connecting Your Cloud Database (Supabase / Neon)
Click the **"Connect Cloud DB"** button in the dashboard header or update `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
```
*(SSL mode `rejectUnauthorized: false` is pre-configured for instant zero-friction connectivity).*

---

## 🧪 Interactive Learning Experiments

1. **Single Order Flow:**
   - Select a product preset (e.g. *MacBook Pro $2499*) and click **Dispatch to Kafka**.
   - Watch the order register in Kafka partition #0/1/2, trigger the bridge, fan out to RabbitMQ workers, and persist as `COMPLETED` in the Cloud DB.
2. **High-Throughput Partition Streaming:**
   - Click **⚡ Stream 5 Orders** or **🚀 Stream 15 Orders**.
   - Observe concurrent partition ingestion in Kafka and concurrent queue worker execution in RabbitMQ.
3. **Dead Letter Queue (DLQ) Resilience:**
   - Toggle **Simulate Payment Failure & DLQ** (or click *🚨 High-Value* preset).
   - Watch the Payment Worker reject the order with a `NACK`, routing the poisoned message into `order.dlq`.
4. **Inspect Raw Records:**
   - Click **View** on any row in the **Cloud Database Orders Ledger** to inspect the full PostgreSQL JSON record, Kafka metadata (offset, partition), and RabbitMQ task statuses.
