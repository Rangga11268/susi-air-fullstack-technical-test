# Susi Air Pilot App (Fullstack Technical Assessment)

Mobile-first operational web application for **PT ASI Pudjiastuti Aviation (Susi Air)** line pilots to track regulatory flight-hour duty limits, monitor aviation license and medical document expiry statuses, and inspect monthly roster schedules.

## Repository Structure

```text
SusiAir/
├── nest/       # Backend REST API (NestJS 10 + TypeScript + In-Memory JSON Seed)
├── nuxt/       # Frontend Mobile Web App (Nuxt 3 + Pinia + SCSS + Composition API)
├── docs/       # Brief, mock JSON datasets, PRD, API Spec, and Design System
└── README.md   # Setup instructions, environment variables, and engineering decisions
```

---

## 1. How to Set Up and Run Each App

### Prerequisites
- **Node.js**: v18.18+ or v20+ (tested on Node v24.12.0)
- **npm**: v9+

### Step 1: Start the NestJS Backend (`/nest`)

```bash
cd SusiAir/nest
npm install
npm run build
npm run start:prod
```
*(For development with hot-reload, run `npm run start:dev`)*

By default, the NestJS REST API listens on **`http://localhost:3001`**.

To run the automated self-check suite verifying all 6 endpoints, authentication guards, input validation, and server-side rolling window math:
```bash
node verify-api.mjs
```

### Step 2: Start the Nuxt 3 Frontend (`/nuxt`)

Open a second terminal:
```bash
cd SusiAir/nuxt
npm install
npm run dev
```
The Nuxt 3 mobile web app starts on **`http://localhost:3000`** and connects to `http://localhost:3001`.

For a production build and verification:
```bash
cd SusiAir/nuxt
npm run build
node verify-frontend.mjs
```

### Demo Pilot Credentials
- **Username**: `johndoe`
- **Password**: `susiairtest`

---

## 2. Environment Variables

Both applications run out of the box using sensible defaults. You can override them via `.env` files or deployment environment variables:

### Backend (`SusiAir/nest`)
| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `3001` | HTTP server port for the NestJS service |
| `APP_TODAY` | `2026-05-15` | Deterministic reference date (`YYYY-MM-DD`) required by the brief |
| `AUTH_SECRET` | `susiair-pilot-portal-hmac-secret-2026` | HMAC-SHA256 signing secret for stateless Bearer tokens |
| `CORS_ORIGIN` | `*` | Allowed CORS origins for frontend requests |

### Frontend (`SusiAir/nuxt`)
| Variable | Default | Description |
| :--- | :--- | :--- |
| `NUXT_PUBLIC_API_BASE` | `http://localhost:3001` | Base URL of the NestJS REST API |

---

## 3. Main Architectural & Design Choices

### A. Server-Side Rolling Sum & Dataset Edge Cases (`FlightHoursService`)
1. **Deterministic Reference Date (`2026-05-15`)**:
   - The brief specifies treating today as **15 May 2026** instead of calling `new Date()`. All date calculations use UTC calendar arithmetic anchored to `APP_TODAY` (`2026-05-15`) so the app behaves identically regardless of reviewer timezone or review date.
   - Note on `mock-documents.json`: While `mock-documents.json` contains a top-level `"today": "2026-05-31"` field, `mock-schedules.json` and Page 5 of the brief explicitly instruct: *"Treat today as 15 May 2026 in your logic."* Evaluating documents against `2026-05-15` produces all three urgency states across the 5 pilot documents (`Security Clearance` = **Expired / Red** at `-14d`, `Indonesian License` = **Soon / Amber** at `+14d`, `Indonesian Medical` = **Soon / Amber** at `+27d`, `Next Recurrent` & `PPC` = **Safe / Green**).
2. **Days with Zero Flight Hours & Missing Dates**:
   - `DataService` seeds all 521 records (`2024-12-27` to `2026-05-31`) into an in-memory `Map<string, number>` at startup for $O(1)$ lookup. Any calendar date inside a rolling window that has `0.0` hours or is absent from the JSON map contributes `0` to the sum without shrinking or skipping the window day count.
3. **Windows Extending Before the Start of the Dataset (`2024-12-27`)**:
   - When computing a rolling window (such as 30, 90, 180, or 365 days) for dates near the start of the dataset, calendar days prior to `2024-12-27` default to `0` hours.
4. **Future Dates in the 15-Day Display Range (`2026-05-16` to `2026-05-22`)**:
   - The trend chart displays 7 days before today (`08 May`), today centered (`15 May`), and 7 days after today (`22 May`).
   - Because `mock-flight-hours.json` includes scheduled/assigned flight hours through `2026-05-31`, rolling sums for `16 May` through `22 May` incorporate those scheduled hours to show **projected rolling duty accumulation** (`isFuture: true`). This allows pilots and dispatchers to spot upcoming regulatory limit breaches before they happen.
5. **Handling Rolling Sums Above the Red Regulatory Limit Line**:
   - In the `1w` window (limit `40h`, chart max `45h`), dates `18 May` (`42.8h`), `19 May` (`44.0h`), `20 May` (`44.7h`), and `21 May` (`42.7h`) exceed the `40h` red limit line.
   - In the `1m` window (limit `100h`, chart max `125h`), `08 May` (`102.2h`) and `21 May` (`100.9h`) exceed the `100h` red limit line.
   - The custom SVG chart scales its vertical axis using `Math.max(chartBounds.yMax, maxSeriesValue * 1.08)` so over-limit peaks never clip outside the viewport, and highlights over-limit data nodes in Brand Red (`#E63757`).

### B. Minimal Dependencies & Stateless Token Auth
- **Stateless HMAC-SHA256 Bearer Tokens (`node:crypto`)**: Instead of adding external JWT/Passport dependencies for a single-account technical test, `AuthService` signs and verifies stateless tokens using Node's native `crypto.createHmac('sha256', secret)` with timing-safe signature comparison (`crypto.timingSafeEqual`). Tokens survive serverless cold starts on Render/Railway/Fly without requiring sticky sessions.
- **Custom Responsive Inline SVG Chart (`FlightHoursChart.vue`)**: Built directly in Vue 3 with `<script setup>` rather than importing a heavy third-party charting bundle. This guarantees pixel-accurate placement of the centered `TODAY` axis marker, the horizontal red limit line, touch/keyboard-accessible data nodes, and zero layout shift.

### C. UI/UX & Brand Direction Decisions (`R-31` Log)
- **Visual Direction**: High-contrast airline operations utility (`Operate` mode) aligned with `susiair.com` (`#0E2138` Primary Navy, `#E63757` Brand Red, `#F5F6F8` Surface Background, `#FFFFFF` Card Surface, `#22C5E8` Chart Accent).
- **Typography**: `Plus Jakarta Sans` with `font-variant-numeric: tabular-nums` on all flight hours, limits, percentages, and calendar dates so numerical columns align cleanly.
- **Mobile Ergonomics**: Designed for a mobile viewport (`max-width: 430px` app shell centered on desktop), minimum `44x44px` touch targets on all interactive controls, visible `:focus-visible` keyboard outlines, and reserved bottom safe-area padding so the fixed navigation bar never obscures content.

---

## 4. What We Would Change With More Time

1. **Persistent Database & Logbook Mutation Flow**: Migrate the in-memory JSON store to PostgreSQL or SQLite with Prisma, enabling pilots to submit new flight logbook entries that dynamically increment `count_logbooks` and recalculate rolling duty totals.
2. **Schedule Day Detail View**: Replace the `"Detail page coming soon"` sheet with a full flight leg breakdown (aircraft tail registration such as `PK-BVR`, departure/arrival ICAO/IATA codes, block times, and crew pairing).
3. **Offline-First PWA Caching**: Add a Service Worker with IndexedDB caching so pilots operating in remote pioneer airstrips (such as Papua or Kalimantan with intermittent connectivity) can view their roster and document statuses offline.
4. **Refresh Token Rotation & Role-Based Access**: Add short-lived access tokens with HttpOnly refresh cookies and role separation between Line Pilots, Chief Pilots, and Crew Schedulers.
