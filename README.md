# OneMetric Time Tracking Tool

> A high-converting internal time tracking and resource management platform built with **Next.js**, **Prisma**, and **Vanilla CSS**.

---

## 🚀 What Was Built

Designed to answer the questions that matter most:

- *Where are we losing hours vs quoted hours?*
- *Which team members are over/under-utilized?*
- *Which projects are profitable vs at risk?*

This MVP focuses on **Project Management**, **Time Tracking**, **Dashboards**, and a **HubSpot Sync Simulator** — with an AI-first architecture ready for Phase 2 Gemini integration.

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router, Server Components) |
| Styling | Vanilla CSS (glassmorphism + dark mode + micro-animations) |
| Database ORM | Prisma 5 (SQLite for MVP → PostgreSQL ready) |
| Icons | Lucide React |
| AI Layer (Phase 2) | Google Gemini 3.1 Pro |

---

## 📁 Application Structure

```
src/
├── app/
│   ├── page.tsx              # Individual Dashboard (/)
│   ├── projects/
│   │   ├── page.tsx          # Project Portfolio (/projects)
│   │   └── [id]/page.tsx     # Project Insights (/projects/:id)
│   ├── time/page.tsx         # Time Logs (/time)
│   ├── manager/page.tsx      # Manager Dashboard (/manager)
│   └── integrations/page.tsx # HubSpot Sync Hub (/integrations)
├── components/
│   ├── Sidebar.tsx           # Navigation sidebar
│   └── Header.tsx            # Global header with 1-click timer
└── lib/
    └── prisma.ts             # Prisma singleton client

prisma/
├── schema.prisma             # DB models: User, Project, Task, TimeLog, Alert
└── seed.ts                   # Mock data seed script
```

---

## 🖥️ Core Views

### Individual Dashboard (`/`)
- Today's tasks with 1-click timer start
- Logged time today, efficiency %, and weekly trends
- Quick navigation to pending logs

### Manager Dashboard (`/manager`)
- Team utilization bars (booked hours vs daily capacity)
- Over-budget project flags with risk details
- Active project count and team overview

### Project Portfolio (`/projects`)
- Quoted Hours vs Actual Hours progress bars
- Status badges: Active / At Risk / Completed
- Quick navigation to individual project drill-downs

### Project Insights (`/projects/[id]`)
- Budget "Burn Rate" dial
- Remaining hours calculation
- Task list with milestone grouping and per-task timer actions

### Time Logs (`/time`)
- Personal time log history per task/project
- Billable vs Non-Billable indicators
- Duration in `Xh Ym` format

### Integrations Hub (`/integrations`)
- HubSpot CRM sync simulator UI
- Slack and ClickUp migration placeholders for future phases

---

## 🗄️ Database Schema

| Model | Key Fields |
|-------|-----------|
| `User` | name, email, role, capacityHours, costPerHour |
| `Project` | name, clientName, dealId (HubSpot), quotedHours, status |
| `Milestone` | projectId, name, dueDate, status |
| `Task` | projectId, milestoneId, assignedToId, estimatedHours, status |
| `TimeLog` | taskId, userId, timeSpentMinutes, billable, date |
| `Alert` | type, message, readStatus |

---

## ⚡ Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Initialize the database
```bash
npx prisma db push
npx prisma generate
npx tsx prisma/seed.ts
```

### 3. Start the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to explore the tool.

---

## 🧩 Roadmap

### Phase 2 — Deep Integrations
- [ ] Live HubSpot API deal sync (`Closed Won` → auto-create Project)
- [ ] Pull Quoted Hours from HubSpot line items
- [ ] Push project status back to CRM
- [ ] Slack alert notifications

### Phase 3 — AI Features (Gemini)
- [ ] **Smart Time Logging**: Describe work in plain English, AI assigns task + suggests time split
- [ ] **Daily Summary Generator**: Automated summaries of what team worked on
- [ ] **Effort Prediction**: AI predicts delay risk and estimated completion
- [ ] **Anomaly Detection**: Flags over-logging, under-logging, sudden spikes

---

## 💡 Design Principles

> *Don't overbuild like ClickUp — people hate complexity. Focus on clarity over features.*

- **1-click timer start** from any page via the persistent header
- **Minimal mandatory fields** to reduce friction
- **AI-assisted logging** so users spend less time tracking, more time working
- **Dashboards as the USP** — clear, beautiful data over feature sprawl
