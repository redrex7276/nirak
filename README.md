# SHRAMIK-QUOTE (श्रमिक-कोट)

> **"Work should reach the worker. Web for Customers. SMS for Workers."**

**Shramik-Quote** is a simplified two-sided gig platform built specifically for Indian labor dynamics. It connects construction contractors, business owners, and households with local skilled trade workers (painters, masons, carpenters, plumbers, electricians, bar benders, tile layers).

The platform eliminates the digital divide:
- **Customers** manage jobs, discover talent, review responses, and assign workers via a modern, tactile web application.
- **Workers** receive job opportunities, inspect job terms, and accept or decline work using standard **numeric cellular SMS (`1` and `0`)**, requiring **zero internet connectivity, no smartphone apps, and no complex account setups**.

---

## Architecture & System Overview

```text
┌────────────────────────────────────────────────────────┐
│                   CUSTOMER WORKSPACE                   │
│     (Web App: Create Job → Match → Send Opportunity)   │
└───────────────────────────┬────────────────────────────┘
                            │
              Carrier Dispatch (SMS Gateway)
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                    SMS WORKER FLOW                     │
│                                                        │
│  [Step 1: Opportunity SMS]                             │
│  "New work: Painting in Mapusa. ₹800/day.              │
│   Reply 1 to view details, 0 to ignore."               │
│                            │                           │
│  Worker replies: 1         │                           │
│                            ▼                           │
│  [Step 2: Details SMS]                                 │
│  "Details: 5 days, 8:00 AM start, 3 workers.           │
│   Reply 1 to ACCEPT, 0 to REJECT."                     │
│                            │                           │
│  Worker replies: 1         │                           │
│                            ▼                           │
│  [Step 3: Acceptance Notification & Assignment]        │
│  "Work accepted! Customer notified."                   │
└───────────────────────────┬────────────────────────────┘
                            │
               Live Gateway State Sync
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                   CUSTOMER DASHBOARD                   │
│  (Worker status updates to ACCEPTED → Confirm Assign)  │
└────────────────────────────────────────────────────────┘
```

---

## Core Product Roles

### 1. Customer / Contractor
- **Register & Login**: Quick account setup as individual homeowner, general contractor, or business.
- **Work Creation**: Specify trade category, job title, description, Goa location, reporting time, duration, daily rate, and number of workers required.
- **Deterministic Worker Matching**: Transparent scoring based on:
  - Skill match (40%)
  - Location / Proximity match (20%)
  - Trade experience (15%)
  - Availability status (15%)
  - Regional language preference (10%)
- **SMS Dispatch**: Dispatches personalized opportunities to selected workers in English, Hindi, or Marathi.
- **Real-Time Response Tracking**: Monitor who has received the SMS, who requested details, and who accepted.
- **Assignment & Completion**: Assign accepted workers, track work progress, mark jobs as completed, and rate performance.

### 2. Freelancer / Gig Worker
- **Profile & Skills**: Maintain trade categories, experience years, service areas, and availability (`available`, `busy`, `on_leave`).
- **Multilingual Support**: Supports English (`en`), Hindi (`hi`), and Marathi (`mr`).
- **SMS Interface**: All critical workflows function over cellular SMS.
- **Work History**: Completed contracts automatically record earnings, ratings, and customer feedback.

---

## Critical SMS State Machine

The platform implements a strict deterministic state machine:

| Current State | Worker Input | Next State | Outgoing Action |
|:---|:---:|:---|:---|
| `sent` | `1` | `details_requested` | Dispatches full job terms and reporting time over SMS |
| `sent` | `0` | `rejected` | Logs refusal; frees slot |
| `details_requested` | `1` | `accepted` | Marks worker as accepted on customer dashboard |
| `details_requested` | `0` | `rejected` | Logs rejection |
| *Any State* | `2`, `yes`, `1 1`, `00`, etc. | *State Preserved* | Dispatches safe SMS guidance: *"Please reply 1 to continue or 0 to reject."* Prevents state corruption. |

---

## Tech Stack

- **Frontend Core**: React 18 + TypeScript + Vite 5
- **Backend & Cloud**: Firebase 11 (App, Authentication, Cloud Firestore Real-Time Database)
- **Design System & Styling**: Vanilla Tailwind CSS + Custom Soft-Boxy Tactile Design (28–36px radius, deep navy, electric blue, teal, warm amber)
- **Icons**: Lucide React
- **Celebration Animations**: Canvas Confetti (zero heavy 3D or WebGL)
- **Testing**: Vitest 2.x
- **Storage**: Universal Environment-Safe LocalStorage Adapter with in-memory fallback & Firebase Cloud Sync

---

## Local Development Setup

### Prerequisites
- Node.js 18+ (tested on Node 20 / 22)
- npm 9+

### Installation

```bash
# 1. Clone repository
git clone https://github.com/redrex7276/nirak.git
cd nirak

# 2. Install dependencies
npm install

# 3. Configure environment variables (optional)
cp .env.example .env

# 4. Start local development server
npm run dev
```

The application will run at: `http://localhost:5173`

---

## Available Scripts

| Command | Description |
|:---|:---|
| `npm run dev` | Starts the Vite development server with hot module replacement |
| `npm run build` | Compiles TypeScript (`tsc -b`) and bundles production assets via Vite |
| `npm run preview` | Previews the production build locally |
| `npm test` | Runs the automated Vitest test suite |

---

## Test Automation Suite

The project includes an automated test suite covering:
1. **SMS State Machine & Input Validation** (`tests/sms.test.ts`):
   - Strict validation of `'1'` and `'0'` commands
   - Rejection of malformed/edge inputs (`'1 1'`, `'10'`, `'00'`, `'yes'`, `'no'`, `'accept'`)
   - Multilingual template output verification (EN, HI, MR)
2. **Matching Engine** (`tests/matching.test.ts`):
   - 5-factor weighted algorithm calculations
   - Candidate ranking accuracy
3. **Authentication & Role Authorization** (`tests/auth.test.ts`):
   - Login credential matching
   - Role separation between customer and freelancer
4. **End-to-End Workflow & Data Integrity** (`tests/workflow.test.ts`):
   - Opportunity dispatch, acceptance, assignment, completion, and work history persistence

Run all tests:
```bash
npm test
```

---

## Demo & Hackathon Features

- **Pre-seeded Goa Trade Workforce**: Includes 27+ pre-configured Goa-based trade workers across Mapusa, Porvorim, Assagao, Siolim, Margao, and Panaji.
- **SMS Activity Panel**: An integrated real-time carrier log at the bottom of the screen. Allows evaluators to:
  - View raw carrier outbound and inbound logs
  - Simulate worker replying `1` (details/accept)
  - Simulate worker replying `0` (declining)
  - Send custom SMS edge-case inputs (`2`, `yes`, `1 1`, `00`) to observe live carrier guidance prompts
- **One-Click Quick Logins**: Switch seamlessly between Customer (**Rajesh Sharma**) and Freelancers (**Ramesh Naik**, **Santosh Kumar**, etc.).

---

## License

MIT License — Created for Shramik-Quote.
