# BIZ-TECH AI-Powered Dashboard

A production-ready full-stack application designed to ingest AI-generated computer vision events from car manufacturing lines and compute real-time worker productivity metrics.

In this project, I've created a full-stack factory monitoring system taking a TATA CAR PLANT AS A USECASE, using Next.js, Node.js, PostgreSQL, and Drizzle ORM. The system is designed to monitor worker productivity in real-time using AI-generated computer vision events.

## Quick Start with Docker

The easiest way to run the entire stack usiing a single command which migrates the tables populates them with data and runs the server (Frontend, Backend, and PostgreSQL) is using Docker Compose.

```bash
# Clone the repository and navigate to the root
# Ensure you have Docker and Docker Compose installed

# Start all services

1. Set env variable accodingly by copying the .env.docker file to .env file for both forntend and backend

2. SET the admin credentails and database credentails in the .env file for admin creation at first run 

docker-compose up --build
```

- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000`
- **API Documentation**: `http://localhost:5000/api-docs`

---

## For running the project on local machine without docker

1. Set the env variable in both frontend and backend accoding to .env.local file
```bash
cd backend
npm install
npm run db:push # Create and pushes the schema into your database tables (Make sure to create postgres database by your own and updating the same in env variable)
npm run db:seed #Seed the database with initial data
npm run dev #Runs the development server


cd frontend
npm install
npm run dev
```

## Backend Architecture & Logic

### 1. API Documentation (Swagger)
Access the interactive documentation at `http://localhost:5000/api-docs`. 

**Admin Routes:**
- `POST /api/admin/login`: Authenticates and returns a `sessionToken`.
- `GET /api/admin/validatetoken`: Validates if the current session is still active.
- `GET /api/admin/sessions`: Lists all active sessions for the admin.

**Worker & Productivity Routes:**
- `GET /api/workers`: Returns all 6 workers with calculated 24h metrics (Utilization, Throughput).
- `POST /api/workers/events`: Ingests raw CV events (working, idle, absent, product_count).
- `GET /api/workers/{id}/history`: Returns the last 100 raw events for a specific worker.
- `POST /api/workers/seed`: Wipes the database and generates a fresh 24h simulation of production data.

### 2. Admin Logic & Security
-   **Automated Provisioning**: The system automatically creates a root administrator on the first launch using credentials defined in your `.env` file (`ADMIN_USERNAME` & `ADMIN_PASSWORD`).
-   **No-Signup Architecture**: There is no public signup route. Access is strictly controlled via the auto-provisioned admin account to ensure maximum industrial security.
-   **JWT Lifecycle**: The system uses secure JWT tokens for session management, with automatic token validation on every dashboard mount.

### 3. Manufacturing Logic & Seeding
- **Workstations**: 6 hardcoded stations (Chassis, Engine, Paint Shop, Interior, Electronics, Final QC).
- **Workers**: 6 workers assigned to these specific stations.
- **Data Seeding**:
    - **Script (`scripts/seed-admin.ts`)**: Used for seeding admin credentials.
    - **Script (`scripts/seed-workers.ts`)**: Used for seeding worker events.
    - **Route (`/api/workers/seed`)**: A special route Used for on-the-fly evaluation. Both use an identical algorithm to generate 24 hours of state-change events.

### 4. Productivity Calculation
Metrics are computed using time-series analysis of raw events:
- **Active Time**: Duration between a `working` event and the next state change (`idle`/`absent`).
- **Utilization %**: `(Total Active Minutes / 1440 Shift Minutes) * 100`.
- **Throughput**: `Total Units Produced / Total Active Hours`.
- **Sorting**: Events are sorted by timestamp to handle out-of-order data from edge cameras.

### 5. Database Schema
#### **Admins**
- `id`: UUID (Primary Key)
- `username`: String (Unique)
- `passwordHash`: String
- `createdAt`: Timestamp

#### **Workstations**
- `id`: Integer (Primary Key)
- `name`: String (e.g., "Chassis Assembly")
- `description`: String

#### **Workers**
- `id`: Integer (Primary Key)
- `name`: String
- `workstationId`: Integer (Foreign Key)
- `imageUrl`: String

#### **Events**
- `id`: UUID (Primary Key)
- `workerId`: Integer (Foreign Key)
- `workstationId`: Integer (Foreign Key)
- `eventType`: Enum ('working', 'idle', 'absent', 'product_count')
- `count`: Integer (Optional, for product_count)
- `confidence`: Float (0.0 - 1.0)
- `timestamp`: Timestamp

---

## Frontend Architecture

The frontend is a high-performance dashboard built with **Next.js 15**.

### Folder Structure
```text
frontend/
├── app/                  # Next.js App Router
│   ├── admin/            # Auth & Login pages
│   ├── LayoutClient.tsx  # Global providers (Motion, Query)
│   └── layout.tsx        # Root layout & Fonts
├── components/           # Reusable UI
│   └── admin/
│       ├── Dashboard.tsx # Main Command Center
│       └── workers/      # Specialized components (Cards, Graphs, Feeds)
├── hooks/                # Zustand Stores (authStore, workerStore)
├── transitions/          # Framer Motion orchestration
└── lib/                  # Utilities (Tailwind merge, etc.)
```

### Core Technologies Used
- **Logic**: `Next.js`, `Zustand` (State Management), `React Hook Form`.
- **Styling**: `Tailwind CSS` (Modern industrial theme), `Lucide/Fi Icons`.
- **Visuals**: `Recharts` (Productivity trends), `Motion/React` (Premium animations).
- **Data**: `TanStack Query` (Real-time polling & caching), `Axios`.

---

## Project Structure Map

### Backend
```text
backend/
├── src/
│   ├── config/       # DB & Env configuration
│   ├── middleware/   # Auth & Validation middleware
│   ├── models/       # Drizzle Schema definitions
│   ├── routes/       # API Route handlers
│   ├── service/      # Business logic & DB queries
│   ├── utils/        # Productivity algorithms
│   └── index.ts      # Server entry point
├── Dockerfile        # Production build
└── drizzle.config.ts # DB migration config
```
---

## Assignment Q&A

### 1. Edge → Backend → Dashboard Architecture
-   **Edge (The Source)**: CCTV cameras on the factory floor run local AI models. When a worker is detected or a product is finished, the edge device sends a JSON payload to the backend. This minimizes bandwidth by only sending metadata, not raw video.
    The events can be sent and tested using the POST - 
    /api/workers/events
    Example:
    {
        "events":[
            {"workerId":1, "eventType":"working", "confidence":1.0},
            {"workerId":2, "eventType":"idle", "confidence":1.0},
            {"workerId":3, "eventType":"absent", "confidence":1.0},
            {"workerId":4, "eventType":"product_count", "count":100, "confidence":1.0}
        ]
    }
-   **Backend (The Brain)**: An Express.js API validates and stores these events. It calculates productivity metrics on-the-fly or through scheduled aggregations, ensuring the data is ready for the supervisor.
-   **Dashboard (The Interface)**: A Next.js application that visualizes the data using real-time polling. It allows supervisors to see the "Neural Pulse" of the factory and identify bottlenecks instantly.

### 2. Handling Data Challenges
-   **Intermittent Connectivity**: Edge devices implement a **Store and Forward** mechanism. Events are stored in a local SQLite buffer or persistent queue (like MQTT with persistence) and uploaded once the connection is restored.

-   **Duplicate Events**: We use **idempotency keys** or unique constraints in the database on `(timestamp, worker_id, event_type)`. If the same event is sent twice due to a retry, the database rejects the duplicate.

-   **Out-of-Order Timestamps**: The processing engine explicitly **sorts events by timestamp** before calculating durations. This ensures that a "Working" event followed by an "Idle" event is calculated correctly, even if the "Idle" event arrived at the server first.


### 3. AI Model Management
-   **Model Versioning**: Every event includes a `model_version` tag. We store model metadata in a dedicated table, allowing us to compare the productivity output of `v1.0` vs `v2.0` to ensure new models are performing better.

-   **Detecting Model Drift**: We monitor the distribution of `confidence` scores. If the average confidence drops from 0.95 to 0.70 over a week, it indicates "drift" (e.g., due to lighting changes or new worker uniforms), and an alert is triggered.

-   **Triggering Retraining**: Once drift is detected, the system triggers a **Data Sampling Job** to collect high-entropy images for human labeling (Active Learning), which then feeds into an automated retraining pipeline (MLOps).

### 4. Scaling the System

-   **5 Cameras**: Current architecture with a single Node.js instance and PostgreSQL is sufficient.

-   **100+ Cameras**: We introduce a message broker like **Apache Kafka** or **RabbitMQ** to buffer ingestion. We would also move the productivity calculations to a background worker process to keep the API responsive.

-   **Multi-Site**: 
    -   Deploy regional ingestion hubs to minimize latency.
    -   Use a **Data Lake** (like Snowflake or BigQuery) to aggregate metrics from all sites for global management dashboards.
    -   Implement a multi-tenant database strategy to isolate data between different factory locations.

---

## Metric Definitions

| Metric | Definition | Importance |
| :--- | :--- | :--- |
| **Utilization %** | `(Total Active Minutes / Total Shift Minutes) * 100` | Measures how much of the worker's time was spent on-task. |
| **Throughput** | `Total Units Produced / Total Active Hours` | Measures the efficiency/speed of production during active periods. |
| **Active Time** | Cumulative duration of all events marked as `working`. | Identifies actual labor contribution. |

---

## Assumptions and Tradeoffs

1.  **24-Hour Observation Window**: For the purpose of this demonstration, we use a fixed 24-hour window for utilization. In a live factory, this would be dynamically adjusted based on the worker's assigned 8, 9, or 12-hour shift schedule.
2.  **Edge Trust**: We assume the Edge AI cameras have a "Store and Forward" mechanism. The backend trust the timestamps provided by the edge to ensure temporal accuracy even during network outages.
3.  **Real-time vs. Eventual Consistency**: We chose a **Real-time Pull** model for this dashboard. While this ensures data is always fresh, it adds load to the database. For 1000+ workers, we would transition to a **Materialized View** or a **Cached Aggregation** strategy (e.g., Redis).
4.  **Hardware-Agnostic Design**: The schema is designed to work with any AI model (YOLO, MediaPipe, etc.) as long as they emit the standard `eventType` and `confidence` payload.
