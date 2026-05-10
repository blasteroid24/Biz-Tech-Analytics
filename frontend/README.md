# BIZ-TECH Analytics Frontend (Supervisor Dashboard)

Industrial-grade supervisor dashboard for monitoring car manufacturing productivity in real-time.

## Tech Stack
- **Framework:** Next.js 15 (App Router)
- **State Management:** Zustand (Persisted)
- **Animations:** Framer Motion & GSAP
- **Charts:** Recharts
- **Icons:** React Icons
- **Styling:** Tailwind CSS (Modern Industrial Dark Theme)

## Project Structure
- `app/`: Next.js routes and layouts.
- `components/admin/workers/`: Specialized worker productivity components.
- `hooks/`: Zustand stores for Admin and Worker data.
- `transitions/`: Global transition effects.

## Key Features
- **Neural Overview:** Factory-wide health bar showing average utilization.
- **Worker Cards:** Real-time status pulse indicators and production metrics.
- **Data Visualization:**
  - Shift Distribution (Pie Charts)
  - Units Produced tracking
  - Event History logs with confidence scoring.
- **Responsive Navigation:** Sleek sidebar with smooth state transitions.

## Logic Used
1. **Hydration Guard:** Ensures client-side state is synchronized with localStorage before rendering to prevent Next.js hydration mismatches.
2. **Polling System:** Automatically refreshes worker data every 30 seconds to provide a "live" feel.
3. **Protected Layout:** Validates tokens on every mount; if a session is invalid, the user is automatically redirected to the terminal login.

## Getting Started

### 1. Environment Setup
Create a `.env` file in the frontend root:
```env
NEXT_PUBLIC_BACKEND=http://localhost:5000
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Visit `http://localhost:3000` to view the dashboard.
