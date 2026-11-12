# API Contract Migration Engine (ACME) Web Dashboard

**The Frontend UI control center for triggering, monitoring, and reviewing autonomous AI-driven API contract migrations.**

The ACME Web Dashboard acts as the Frontend User interface for the ACME ecosystem. While the [ACME Backend](https://github.com/Kartiksood10/acme-migration-backend) manages state and the [ACME Worker](https://github.com/Kartiksood10/acme-migration-worker) handles autonomous code generation, this React-based frontend provides engineers with a seamless, zero-refresh experience to oversee the entire lifecycle of an API migration.

Built with performance and UX in mind, the dashboard utilizes aggressive client-side caching and background polling to ensure that users always see live, up-to-the-second migration statuses without jarring page reloads.

## 🚀 Key Features

- **Instant Zero-Refresh Navigation:** Powered by TanStack Query, the UI caches active data in memory, allowing instant transitions between the Dashboard, History, and Settings screens using a stale-while-revalidate architecture.
- **Real-Time Migration Telemetry:** Actively polls the Spring Boot backend when jobs are `IN_PROGRESS`, driving live UI updates for progress steppers, execution timers, and endpoint logs.
- **Global Notification System:** A persistent bell notification center monitors active jobs in the background across all screens, alerting users instantly when a Python worker successfully generates a Pull Request or encounters a failure.
- **Complex Multipart Triggers:** An intuitive modal interface that seamlessly merges user inputs (Git repository URLs) with dynamic file uploads (OpenAPI YAML/JSON) or remote schema URLs into a single `multipart/form-data` payload.
- **Persistent Global Preferences:** A dedicated settings engine utilizing `localStorage` to sync System/Light/Dark themes and pre-fill default Git repositories across the application for a streamlined developer experience.
- **Responsive & Accessible Design:** Built completely with Tailwind CSS, featuring meticulously crafted dark mode support, animated state transitions, and accessible form controls.

## 🏗️ Architecture & Data Flow

The frontend is specifically designed to handle the asynchronous nature of agentic LLM workflows, which can take several minutes to complete.

### 1. Trigger & Cache Invalidation

When a user submits a new migration, the UI fires a `POST` mutation to the backend. Upon receiving a `202 Accepted`, TanStack Query instantly invalidates the local cache and navigates the user to the live Details screen.

### 2. Smart Background Polling

To conserve browser resources and network bandwidth, the polling engine is highly conditional:

- It pings the backend every **3-4 seconds** _only_ if there is at least one active job.
- Once all jobs hit a terminal state (`COMPLETED` or `FAILED`), background polling halts entirely.

### 3. State Decoupling

The UI strictly separates visual layout components (`AppLayout.tsx`) from the data layer (`useMigrations.ts`, `useMigrationDetails.ts`). Notifications are tracked using a lightweight `useRef` state map to detect status transitions without triggering cascading DOM re-renders.

## 💻 Tech Stack

| Component             | Technology                   |
| --------------------- | ---------------------------- |
| Framework             | React 18                     |
| Build Tool            | Vite                         |
| Language              | TypeScript                   |
| Styling               | Tailwind CSS                 |
| Data Fetching & State | TanStack Query (React Query) |
| HTTP Client           | Axios                        |
| Routing               | React Router DOM             |
| Iconography           | Lucide React                 |

## 🗺️ User Experience (UX) Breakdown

### 1. Dashboard (`/`)

The high-level command center. Displays aggregate metrics, active running jobs, and a quick-access table of recent migrations. A new migration can be started by clicking the **"New Migration"** button, which opens a configuration modal to input the target Git repository URL (automatically pre-filled from your saved Settings), select source and target formats (OpenAPI/Swagger or URL/File), and upload API contract specifications.

### 2. Migration Details (`/migrations/:jobId`)

The deep-dive view for a specific run. Features a dynamic stepper tracking the Python worker's current stage (e.g., `CONTRACT_ANALYSIS` -> `CODE_GENERATION`), live execution timers, endpoint-specific success/failure logs, and one-click links to generated GitHub Pull Requests.

### 3. Migration History (`/history`)

A comprehensive, paginated archive of all past migration runs, filterable by status and sortable by execution time.

### 4. Settings (`/settings`)

User-specific configurations. Allows overriding the OS-level color scheme and setting a "Default Repository" to eliminate repetitive typing when triggering frequent migrations for the same microservice.

## 🛠️ Local Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- [ACME Spring Boot Backend](https://github.com/Kartiksood10/acme-migration-backend) running on `localhost:8081`
- [ACME Migration Worker](https://github.com/Kartiksood10/acme-migration-worker) running on `localhost:8000`

### 1. Clone the repository

```
git clone https://github.com/Kartiksood10/acme-migration-ui.git
cd acme-migration-ui
```

### 2. Install Dependencies

```
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory to point the frontend to your Spring Boot control plane:

```
VITE_API_BASE_URL=http://localhost:8081/api/v1
```

### 4. Start the Development Server

```
npm run dev
```

Vite will start the application locally, typically accessible at `http://localhost:5173`.
