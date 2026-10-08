// Programmatic verification script for Susi Air Nuxt 3 Frontend
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('--- Starting Frontend Integrity & Blueprint Verification ---');

let failureCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
  } else {
    console.error(`[FAIL] ${message}`);
    failureCount++;
  }
}

// 1. Verify required source files exist
const requiredFiles = [
  'package.json',
  'nuxt.config.ts',
  'tsconfig.json',
  'app.vue',
  'assets/scss/_variables.scss',
  'assets/scss/_reset.scss',
  'assets/scss/main.scss',
  'public/images/susiair-logo.png',
  'public/images/susiairlogo.png',
  'stores/auth.ts',
  'stores/pilot.ts',
  'stores/schedule.ts',
  'composables/useApi.ts',
  'middleware/auth.global.ts',
  'components/AppHeader.vue',
  'components/AppBottomNav.vue',
  'components/FlightHoursCard.vue',
  'components/FlightHoursChart.vue',
  'components/DocumentCard.vue',
  'components/ScheduleCalendar.vue',
  'components/ScheduleDetailModal.vue',
  'pages/login.vue',
  'pages/index.vue',
  'pages/schedule.vue',
  'pages/logbook.vue',
  'pages/more.vue',
];

for (const relPath of requiredFiles) {
  const fullPath = path.join(__dirname, relPath);
  assert(fs.existsSync(fullPath), `Required file exists: ${relPath}`);
}

// 2. Verify build output exists
const buildServerPath = path.join(__dirname, '.output/server/index.mjs');
assert(fs.existsSync(buildServerPath), 'Production build output exists (.output/server/index.mjs)');

// 3. Verify Brand Tokens and Craft Constraints in SCSS
const variablesScss = fs.readFileSync(path.join(__dirname, 'assets/scss/_variables.scss'), 'utf8');
assert(variablesScss.includes('#0E2138'), 'Primary navy token (#0E2138) defined in _variables.scss');
assert(variablesScss.includes('#E63757'), 'Brand red token (#E63757) defined in _variables.scss');
assert(variablesScss.includes('#F5F6F8'), 'Background canvas token (#F5F6F8) defined in _variables.scss');
assert(variablesScss.includes('#FFFFFF'), 'Card surface token (#FFFFFF) defined in _variables.scss');
assert(variablesScss.includes('#22C5E8'), 'Chart accent token (#22C5E8) defined in _variables.scss');
assert(variablesScss.includes('440px'), 'Mobile max width (440px) defined in _variables.scss');
assert(variablesScss.includes('80px'), 'Bottom nav clearance (80px) defined in _variables.scss');
assert(variablesScss.includes('44px'), 'Minimum tap target (44px) defined in _variables.scss');

// 6. Verify Pinia Stores API Fetch Endpoints
const authStoreContent = fs.readFileSync(path.join(__dirname, 'stores/auth.ts'), 'utf8');
assert(authStoreContent.includes('/auth/login'), 'Auth store calls /auth/login endpoint');

const pilotStoreContent = fs.readFileSync(path.join(__dirname, 'stores/pilot.ts'), 'utf8');
assert(pilotStoreContent.includes('/pilot/me'), 'Pilot store calls /pilot/me endpoint');
assert(pilotStoreContent.includes('/flight-hours/summary'), 'Pilot store calls /flight-hours/summary endpoint');
assert(pilotStoreContent.includes('/documents'), 'Pilot store calls /documents endpoint');

const scheduleStoreContent = fs.readFileSync(path.join(__dirname, 'stores/schedule.ts'), 'utf8');
assert(scheduleStoreContent.includes('/schedules'), 'Schedule store calls /schedules endpoint');

console.log('------------------------------------------------------------');
if (failureCount === 0) {
  console.log('ALL FRONTEND INTEGRITY & BLUEPRINT CHECKS PASSED PERFECTLY!');
  process.exit(0);
} else {
  console.error(`FAILED: ${failureCount} verification checks did not pass.`);
  process.exit(1);
}
