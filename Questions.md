# Backend Interview Q&A: BizTech Analytics

This document contains deep-dive questions an interviewer might ask about the backend architecture and business logic of this system.

---


The Problem: "The Invisible Bias"
Imagine you update your AI model from v1.0 to v2.0.

v1.0 was conservative—it only marked a worker as "Working" if they were moving a lot.
v2.0 is more sensitive—it counts subtle hand movements as "Working."
If you look at the dashboard and see a 10% increase in productivity, is the worker actually working harder, or is the new model just more generous? Without versioning, you can't tell.

The Solution: Model Versioning
By tagging every event with a model_version (e.g., yolo-v8-factory-v2.1), we can do three things:

Performance Auditing: We can run an "Audit Report" that compares the output of different models. If v2.0 suddenly shows everyone is 20% more productive, we can investigate if the model is "hallucinating" work.
A/B Testing: In a large plant like TATA, you might deploy v2.0 to only one assembly line first. By comparing the productivity data of that line against the others (still on v1.0), you can validate the model's accuracy in a real-world setting before a full rollout.
Accountability: If a worker's productivity score drops and they complain, the supervisor can check the logs. If the drop happened exactly when the model was updated, they can "roll back" the worker's metrics or investigate the model's bias.


### 1. "Why did you choose this specific schema for Workers and Workstations?"
**Answer:** In a real factory (like TATA Motors), stations are fixed assets (e.g., "Paint Shop"). Workers move or are assigned to these stations. By keeping them separate:
- We can track **Station Efficiency** independent of who is working there.
- We can track **Worker Performance** across different shifts or stations.
- The 1-to-Many relation allows us to reassign workers easily without changing the historical event data.

### 2. "Explain the Productivity Logic. How do you calculate 'Utilization'?"
**Answer:** The calculation is **time-series based**. 
1. We fetch all events for a worker within a 24-hour window.
2. We sort them by timestamp.
3. We calculate the duration between state changes (e.g., from `working` at 08:00 to `idle` at 08:45).
4. **Formula**: `(Sum of all 'working' durations / Total Shift Time) * 100`.
- *Why not just count events?* Because events are point-in-time observations. A worker might be "working" for 40 minutes but only trigger 2 AI events. Time-series sorting ensures we capture the *duration* of the state.

### 3. "How does the system handle 'Product Count' events compared to 'Status' events?"
**Answer:** They are handled as different event types in the same table for simplicity, but processed differently in the logic:
- **Status Events** (`working`, `idle`): Used for **Utilization %** (Time-based).
- **Product Count Events**: Used for **Throughput** (Volume-based).
- **Throughput Formula**: `Total Units Produced / Total Working Hours`. This tells us not just *if* they were working, but how *effective* they were.

### 4. "Why use Drizzle ORM instead of Prisma or raw SQL?"
**Answer:** 
- **Type Safety**: Drizzle provides "TypeScript-first" schemas. If I change a column in the DB, my TypeScript code errors immediately.
- **Performance**: Unlike Prisma, Drizzle doesn't have a heavy Rust binary "Query Engine." It's just a thin wrapper over the `pg` driver, making it much faster in serverless or containerized environments.
- **Schema Control**: `db:push` allows for rapid iteration during development, while `migrations` provide a clean audit trail for production.

### 5. "How would you handle a scenario where an Edge camera sends data from 10 minutes ago due to a network delay?"
**Answer:** The system is **Event-Time consistent**, not **Processing-Time consistent**.
- We use the `timestamp` provided by the Edge device, not the time the server received the request.
- Our calculation logic explicitly sorts the array by `timestamp` before processing. This ensures that a delayed "Idle" event doesn't get calculated as happening *after* a "Working" event that was received earlier.

### 6. "How is the Admin creation secured if there is no Signup page?"
**Answer:** We implemented **Environment-Based Provisioning**. 
- The system checks if any admin exists during startup (`seed-admin.ts`).
- If none exists, it creates one using the `ADMIN_USERNAME` and `ADMIN_PASSWORD` from the `.env` file.
- This is more secure for internal industrial tools because it prevents random users from finding a signup page and creating an account on a private network.

### 7. "What happens if 10,000 events hit the API at the same second?"
**Answer:** 
- **Current State**: The Node.js Event Loop handles them asynchronously, but the Postgres connection pool would become a bottleneck.
- **Scaling Plan**: I would introduce a **Message Queue (e.g., BullMQ or RabbitMQ)**. The API would simply "acknowledge" the event and put it in the queue. A separate "Worker Process" would then consume the queue and write to the database at a controlled pace.
