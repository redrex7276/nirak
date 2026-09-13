# SHRAMIK-QUOTE (श्रमिक-कोट)
### Asymmetric Two-Sided Digital Gig Work Platform for Indian Trade Labor

> **"Work should reach the worker. Web for Customers. Zero-Data SMS for Workers."**

[![Live Demo](https://img.shields.io/badge/Live_Demo-shramik--quote.web.app-0052CC?style=for-the-badge&logo=firebase)](https://shramik-quote.web.app)
[![Tests Passing](https://img.shields.io/badge/Tests-85%2F85_Passed-22C55E?style=for-the-badge&logo=vitest)](https://github.com/redrex7276/nirak)
[![React 18](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Express & SQLite](https://img.shields.io/badge/Backend-Express_+_SQLite-003B57?style=for-the-badge&logo=sqlite)](https://expressjs.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge)](LICENSE)

---

## 📌 Live Deployment & Quick Links

- **🌐 Live Production Web Application**: [https://shramik-quote.web.app](https://shramik-quote.web.app)
- **📁 Source Code Repository**: [https://github.com/redrex7276/nirak](https://github.com/redrex7276/nirak)
- **🧪 Test Suite**: `npm test` — **11 test suites, 85 tests passing (100%)**
- **⚡ Local Dev Port**: Frontend on `http://localhost:5173`, Backend API on `http://localhost:3001`

---

## 💡 The Problem & The Solution

### The Reality of Informal Labor in India
Over 400 million informal trade workers across India (painters, plumbers, masons, carpenters, electricians, welders) are systematically excluded from mainstream gig economy platforms:
- **No Smartphones or Reliable 4G/5G Data**: Most trade craftsmen carry basic feature phones or rely on prepaid connections with intermittent internet.
- **Complex UI Friction**: Traditional platforms require installing 100MB apps, navigating English-heavy screens, verifying complex OTPs, and maintaining digital bank accounts.
- **Contractor Inefficiency**: Civil contractors and homeowners waste hours at roadside labor stands (*nakas*) negotiating with volatile daily pricing, zero skill verification, and zero worker history.

### The Shramik-Quote Solution
Shramik-Quote bridges this digital divide through an **asymmetric architecture**:
1. **For Customers & Contractors**: A modern, high-performance web dashboard to post jobs, calculate transparent matching scores, dispatch opportunities, and manage crew assignments.
2. **For Trade Workers**: A **Zero-Data Cellular SMS Gateway** where workers receive opportunities, review wages, and accept or decline work using standard **numeric SMS replies (`1` and `0`)** in their regional language (**English, Hindi, or Marathi**). **No app download, no internet connection, and no password required.**

---

## 🏗️ Architecture & Interaction Flow

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                             CUSTOMER WORKSPACE                              │
│         (React 18 + Vite Web App: Create Job → Match Algorithm → Dispatch)  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                         POST /api/sms/dispatch
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    NODE.JS / EXPRESS BACKEND SERVER                         │
│   (Port 3001: SQLite Relational Database + Deterministic SMS State Machine) │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                      Zero-Data Cellular SMS Dispatch
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          BASIC FEATURE PHONE (WORKER)                       │
│                                                                             │
│  [Step 1: Localized Opportunity SMS]                                        │
│  "New work: Painting in Mapusa. ₹800/day for 5 days.                        │
│   Reply 1 to view details, 0 to pass."                                      │
│                                                                             │
│  Worker replies: 1                                                          │
│                                      │                                      │
│                                      ▼                                      │
│  [Step 2: Terms & Reporting SMS]                                            │
│  "Details: Start 18 Sept, 8:00 AM reporting, Mapusa market.                 │
│   Reply 1 to ACCEPT & CONFIRM, 0 to DECLINE."                               │
│                                                                             │
│  Worker replies: 1                                                          │
│                                      │                                      │
│                                      ▼                                      │
│  [Step 3: Acceptance Notification & Assignment Confirmation]                │
│  "Work accepted! You are registered on the crew. Customer notified."        │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                           State Machine Evaluation
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    LIVE CUSTOMER DASHBOARD & MESSAGES                       │
│  (Worker status updates to ACCEPTED → 1-Click "Assign to Crew" → Complete)  │
│  (Cloud Firestore Real-Time Mirroring + LocalStorage Offline Persistence)   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ⚡ Critical SMS State Machine

The platform enforces a deterministic state machine to prevent race conditions or state corruption:

| Current State | Worker Input | Next State | Outgoing Carrier SMS Action |
|:---|:---:|:---|:---|
| `sent` | **`1`** | `details_requested` | Dispatches localized job terms, reporting time, and rate |
| `sent` | **`0`** | `rejected` | Logs decline; removes candidate from shortlist |
| `details_requested` | **`1`** | `accepted` | Marks worker as accepted; unlocks 1-click crew assignment |
| `details_requested` | **`0`** | `rejected` | Logs decline |
| `accepted` | *(Customer Assigns)* | `assigned` | Dispatches reporting instructions and supervisor phone |
| `assigned` | *(Work Done)* | `completed` | Records earnings, increments job counter, logs 5★ review |
| *Any State* | `2`, `yes`, `1 1`, `00`, `help` | *State Preserved* | Dispatches safe SMS help prompt without corrupting state |

---

## ✨ Key Platform Features

### 1. 💬 Re-imagined Messages & SMS Center
- **Threaded Contact Conversations**: Grouped by candidate worker with trade badge (*Painter*, *Plumber*, *Mason*), mobile number, and current status.
- **One-Click Action Chips**: Evaluators and users can simulate worker SMS replies with single clicks (`👍 Reply: 1 (Accept)`, `❌ Reply: 0 (Decline)`, `❓ Reply: 2 (Help)`) or type custom SMS text.
- **1-Click Direct Crew Assignment**: When a worker accepts via SMS, an **"Assign to Crew"** button appears directly inside the conversation header.
- **Delivery Receipts**: Outgoing messages show `✓ Delivered` with timestamp; incoming worker SMS shows `✓ SMS Received`.

### 2. 🎯 Transparent 5-Factor Matching Algorithm
Deterministic candidate ranking based on:
$$\text{Score} = (0.40 \times \text{Skill}) + (0.20 \times \text{Location}) + (0.15 \times \text{Experience}) + (0.15 \times \text{Availability}) + (0.10 \times \text{Language})$$
- Evaluates trade specialty against job requirements.
- Calculates proximity across North & South Goa hubs (Mapusa, Porvorim, Assagao, Siolim, Panaji, Margao).
- Ranks verified craft experience and active availability status.

### 5. 💡 Semantic Quotes AI & Wage Guide
- Market wage benchmarking and pricing estimation engine for Goa's construction and hospitality ecosystem.
- Category benchmarks for Painters, Plumbers, Carpenters, Masons, Electricians, Welders, and Deep Cleaners.

### 6. 🏢 Customer Directory & Gigs Marketplace
- Interactive directory of registered customer categories: Civil Contractors, Interior Design Studios, Commercial Facilities, Heritage Villa Owners, and Beach Resorts.
- Search and filter open gigs and submit customized service proposals with daily rates.

### 7. 🤖 Shramik AI Assistant Chatbot
- Floating AI assistant with 2D knowledge retrieval explaining zero-data SMS workflows, local wage rates, and hiring guidelines.

### 8. 🔒 Dual Relational & Cloud Persistence
- **Primary Backend**: Node.js + Express with an SQLite relational database (`better-sqlite3`) for strict transactions, foreign key integrity, and ACID guarantees.
- **Cloud Database**: Cloud Firestore mirroring for real-time client sync and multi-client updates.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|:---|:---|
| **Frontend** | React 18.3, TypeScript 5.6, Vite 8.3, Tailwind CSS 3.4, Lucide React Icons |
| **3D Graphics** | Three.js (Interactive Robot Mascot with WebGL 3D rendering) |
| **Backend API** | Node.js, Express 5.2, TypeScript (`tsx`), CORS, JSON Web Tokens |
| **Database** | SQLite 3 via `better-sqlite3` (foreign keys, migrations, transactions) |
| **Cloud & Hosting** | Google Firebase (Hosting CDN, Cloud Firestore, Firebase Authentication) |
| **Testing** | Vitest 5.0 (Automated unit, integration, and E2E lifecycle tests) |
| **Internationalization** | English (`en`), Hindi (`hi`), Marathi (`mr`) |

---

## 📋 Hackathon Judge Evaluation Walkthrough (Step-by-Step)

Follow this scripted 5-minute evaluation flow to test all core functionality:

### Step 1: Landing Page
1. Open `https://shramik-quote.web.app`.
2. Switch platform languages between **ENG**, **हिंदी**, and **मराठी** in the top navbar.

### Step 2: 1-Click Persona Login
1. Click the **"Demo Persona"** dropdown in the top navbar.
2. Select **"Rajesh Sharma (Customer / Contractor)"** to log in instantly without typing passwords.
3. You will be redirected to the **Customer Workspace**.

### Step 3: Create a Job
1. Click **"+ Create Work"** in the navigation bar.
2. Fill in the job form (e.g., *Trade*: Painter, *Location*: Mapusa, *Workers Needed*: 2, *Daily Rate*: ₹850).
3. Click **"Publish & Find Workers"**.

### Step 4: Deterministic Matching & SMS Dispatch
1. On the Job Details page, view the **Matching Freelancers** list ranked by the 5-factor scoring engine.
2. Click **"Select Top 15 Freelancers"** (or check individual candidate boxes).
3. Click **"Dispatch SMS Opportunities"**.

### Step 5: Test the Messages & SMS Messenger
1. The **Messages** panel will automatically open in the bottom-left corner (or click **"Messages"** in the top navbar).
2. Select **Ramesh Naik** from the conversation list.
3. Click the green **`Reply: 1 (Interested / Accept)`** chip.
   - *Observe the instant simulated worker SMS response, status transition to `ACCEPTED`, and automatic dispatch of detailed terms.*
4. Click the **"Assign to Crew"** button right inside the chat header.
   - *The worker is assigned, the crew quota updates, and an assignment confirmation SMS is dispatched.*

### Step 6: Mark Complete & Verify Ledger
1. Click **"Mark Work Completed"** on the job page.
2. Observe the celebratory confetti animation and verify the earnings logged to official work history.
3. Navigate to **"History"** to view the tamper-evident completion records.

---

## 🔑 Demo Persona Credentials

All accounts are pre-seeded in the SQLite database and Firebase with password `password123`:

| Role | Name | Email / Mobile | Trade / Details | One-Click Switcher |
|:---|:---|:---|:---|:---:|
| **Customer** | Rajesh Sharma | `rajesh@sharmaconstruction.com` | Goa Civil & Infra Projects Ltd | Available in Navbar |
| **Customer** | Anita Desai | `anita@desaiinteriors.com` | Desai Interiors & Luxury Living | Available in Navbar |
| **Customer** | Dr. Sneha Patil | `sneha.patil@heritagevilla.org` | Assagao Heritage Villa Estates | Manual Login |
| **Freelancer** | Ramesh Naik | `+91 98201 44521` (`SQ-F-1042`) | Lead Painter (Mapusa, 8 yrs exp) | Available in Navbar |
| **Freelancer** | Sunil Gaonkar | `+91 94220 55112` (`SQ-F-1052`) | Plumber (Porvorim, 9 yrs exp) | Manual Login |
| **Freelancer** | Santosh Parab | `+91 98230 11994` (`SQ-F-1062`) | Mason (Assagao, 12 yrs exp) | Manual Login |

*Note: You can also use the **"Demo Persona"** dropdown in the top navbar to switch between roles instantly without logging in.*

---

## 🧪 Automated Test Suite (100% Passing)

Run the test suite using Vitest:
```bash
npm test
```

### Test Suite Coverage (85 Tests in 11 Suites):
```text
 ✓ tests/matching.test.ts (3 tests)         — 5-factor weighted algorithm calculations
 ✓ tests/role_protection.test.ts (4 tests)  — Route guard & unauthorized role redirection
 ✓ tests/sms.test.ts (15 tests)             — Strict '1'/'0' validation & multilingual SMS output
 ✓ tests/assignment_quota.test.ts (4 tests) — Crew cap enforcement & duplicate prevention
 ✓ tests/auth.test.ts (5 tests)             — Password hashing, salt verification, JWT auth
 ✓ tests/validation.test.ts (10 tests)      — Form sanitization & boundary checks
 ✓ tests/workflow.test.ts (6 tests)         — End-to-end opportunity dispatch & response flow
 ✓ tests/e2e_flow.test.ts (9 tests)         — Master lifecycle integration test
 ✓ tests/backend.test.ts (20 tests)         — Express route & SQLite CRUD transactions
 ✓ tests/firebase.test.ts (3 tests)         — Firestore data structure verification
 ✓ tests/chatbot.test.ts (6 tests)          — AI Chatbot service & knowledge retrieval

Test Files:  11 passed (11)
Tests:       85 passed (85)
```

---

## 📂 Project Structure

```text
nirak/
├── public/                       # Static public assets (icons, manifest)
├── scripts/
│   ├── dev.ts                    # Cross-platform concurrent dev runner (Server + Vite)
│   └── seedFirestore.ts          # Cloud Firestore database seeder
├── server/                       # Node.js + Express Backend
│   ├── db/
│   │   ├── database.ts           # SQLite connection & WAL mode configuration
│   │   ├── migrations.ts         # Relational schema migrations (7 tables)
│   │   └── seed.ts               # Seed data for Goa trades, customers, and jobs
│   ├── routes/
│   │   ├── authRoutes.ts         # User registration, login, session validation
│   │   ├── jobRoutes.ts          # Job creation, assignment, status transitions
│   │   ├── freelancerRoutes.ts   # Worker profile, skills, availability, history
│   │   ├── smsRoutes.ts          # SMS dispatch, reply simulation, activity logs
│   │   └── dashboardRoutes.ts    # Analytics and metrics endpoints
│   └── index.ts                  # Server entry point (port 3001)
├── src/
│   ├── components/
│   │   ├── chat/                 # Shramik AI Chatbot component
│   │   ├── layout/               # Navbar, Footer, and responsive wrappers
│   │   ├── mascot/               # Three.js 3D Construction Robot Mascot
│   │   ├── sms/                  # Redesigned Messages & SMS Carrier Panel
│   │   └── ui/                   # Toast notifications, modal dialogs, buttons
│   ├── context/
│   │   ├── AppContext.tsx        # Global job state, SMS logs, and history state
│   │   └── AuthContext.tsx       # User authentication, personas, and session state
│   ├── data/
│   │   └── seedData.ts           # Offline seed data fallback
│   ├── locales/
│   │   └── translations.ts       # Multilingual dictionary (English, Hindi, Marathi)
│   ├── pages/
│   │   ├── auth/                 # Login & Registration pages for both roles
│   │   ├── customer/             # Customer Dashboard, Create Work, Job Details
│   │   ├── freelancer/           # Freelancer Dashboard, History, Profile
│   │   ├── CustomerDirectoryPage.tsx # Customer Segments & Gigs Marketplace
│   │   ├── HowItWorksPage.tsx    # Interactive architecture guide
│   │   ├── LandingPage.tsx       # Main marketing page with 3D mascot
│   │   └── QuotesPage.tsx        # Semantic Quotes & Wage Estimator
│   ├── services/
│   │   ├── apiClient.ts          # Resilient HTTP client for Express backend
│   │   ├── authService.ts        # Firebase Auth & JWT session management
│   │   ├── chatbotService.ts     # AI assistant response generator
│   │   ├── firebaseService.ts    # Cloud Firestore real-time synchronization
│   │   ├── matchingService.ts    # 5-factor deterministic matching algorithm
│   │   ├── quoteService.ts       # Market wage estimation logic
│   │   ├── smsService.ts         # SMS state machine & multilingual text generator
│   │   └── storageService.ts     # LocalStorage persistence adapter
│   ├── types/
│   │   └── index.ts              # Core TypeScript interfaces and types
│   ├── App.tsx                   # Client-side routing & route guards
│   ├── index.css                 # Custom tactile styling & design system
│   └── main.tsx                  # React application entry point
├── tests/                        # 11 Vitest automated test suites (85 tests)
├── .env.example                  # Environment configuration template
├── firebase.json                 # Firebase Hosting & Firestore rules configuration
├── firestore.rules               # Cloud Firestore security rules
├── package.json                  # NPM dependencies and scripts
├── tailwind.config.js            # Custom tactile theme (palette, shadows, radiuses)
├── tsconfig.json                 # TypeScript compiler configuration
└── vite.config.ts                # Vite build config with proxy error interception
```

---

## 📦 Available NPM Scripts

| Command | Purpose |
|:---|:---|
| `npm run dev` | **Runs both** Express backend (`:3001`) and Vite frontend (`:5173`) concurrently |
| `npm run dev:client` | Runs the Vite frontend development server only |
| `npm run dev:server` | Runs the Express backend server only |
| `npm test` | Executes the complete Vitest automated test suite (85 tests) |
| `npm run build` | Compiles TypeScript (`tsc -b`) and produces production assets in `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm run deploy` | Builds the project and deploys both Hosting and Firestore rules to Firebase |
| `npm run deploy:hosting` | Deploys static build to Firebase Hosting only |
| `npm run deploy:firestore`| Deploys `firestore.rules` security rules only |

---

## 🔮 Roadmap & Future Scope

1. **Telecom SMS Gateway Integration**: Connect mock provider to commercial SMS gateways (Twilio, MSG91, or Fast2SMS) for production cellular dispatch.
2. **Interactive Voice Response (IVR)**: Automated regional voice calls for workers who prefer spoken language over text SMS.
3. **UPI / AePS Escrow Payouts**: Automated wage disbursement to worker Aadhaar-linked accounts upon contractor completion sign-off.
4. **Offline PWA Support**: Service Worker caching for contractors operating in low-connectivity construction basements.

---

## 📄 License

This project is open-source under the **MIT License**.
Built with ❤️ for Indian skilled trade labor.
