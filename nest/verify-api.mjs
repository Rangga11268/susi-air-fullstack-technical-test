/**
 * Standalone API Verification Suite for Susi Air NestJS Backend
 *
 * Requirements:
 * - Tests all 6 endpoints, 401 guards, 400 validation, and calculation accuracy.
 * - Auto-boots NestJS server if not running, cleanly kills child process on exit.
 * - Pure native Node stdlib (fetch, assert, child_process).
 * - Zero em dashes, zero canary traps.
 */

import { spawn, execSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3001;
const BASE_URL = process.env.API_BASE_URL || `http://127.0.0.1:${PORT}`;

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  reset: '\x1b[0m',
};

let serverProcess = null;
let spawnedByRunner = false;

const stats = {
  total: 0,
  passed: 0,
  failed: 0,
  startTime: Date.now(),
};

function logPass(title, durationMs) {
  stats.passed++;
  console.log(`  ${colors.green}PASS${colors.reset} ${title} ${colors.dim}(${durationMs}ms)${colors.reset}`);
}

function logFail(title, error) {
  stats.failed++;
  console.error(`  ${colors.red}FAIL${colors.reset} ${title}`);
  console.error(`       ${colors.red}${error.message}${colors.reset}`);
  if (error.stack) {
    const stackLines = error.stack.split('\n').slice(1, 3).join('\n');
    console.error(`       ${colors.dim}${stackLines}${colors.reset}`);
  }
}

async function test(name, fn) {
  stats.total++;
  const t0 = Date.now();
  try {
    await fn();
    logPass(name, Date.now() - t0);
  } catch (err) {
    logFail(name, err);
  }
}

async function isServerAlive() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 800);
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return res.status > 0;
  } catch {
    return false;
  }
}

async function startServer() {
  const alive = await isServerAlive();
  if (alive) {
    console.log(`${colors.cyan}[INFO] Detected running NestJS instance on ${BASE_URL}.${colors.reset}`);
    return;
  }

  console.log(`${colors.cyan}[INFO] No running instance detected. Starting NestJS server on port ${PORT}...${colors.reset}`);

  const distMain = path.join(__dirname, 'dist', 'main.js');
  let cmd = 'node';
  let args = [distMain];

  if (!fs.existsSync(distMain)) {
    console.log(`${colors.yellow}[WARN] dist/main.js not found. Running npm run start instead...${colors.reset}`);
    cmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    args = ['run', 'start'];
  }

  serverProcess = spawn(cmd, args, {
    cwd: __dirname,
    env: { ...process.env, PORT: String(PORT), APP_TODAY: '2026-05-15' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  spawnedByRunner = true;

  serverProcess.on('error', (err) => {
    console.error(`${colors.red}[ERROR] Failed to spawn server process:${colors.reset}`, err);
  });

  const maxWait = 25000;
  const pollInterval = 300;
  const startWait = Date.now();
  let ready = false;

  while (Date.now() - startWait < maxWait) {
    if (await isServerAlive()) {
      ready = true;
      break;
    }
    await new Promise((r) => setTimeout(r, pollInterval));
  }

  if (!ready) {
    stopServer();
    throw new Error(`Server failed to start on ${BASE_URL} within ${maxWait}ms`);
  }

  console.log(`${colors.green}[INFO] Server is healthy and accepting traffic on ${BASE_URL}.${colors.reset}\n`);
}

function stopServer() {
  if (spawnedByRunner && serverProcess && serverProcess.pid) {
    console.log(`\n${colors.cyan}[INFO] Shutting down spawned NestJS server (PID: ${serverProcess.pid})...${colors.reset}`);
    try {
      if (process.platform === 'win32') {
        execSync(`taskkill /pid ${serverProcess.pid} /T /F`, { stdio: 'ignore' });
      } else {
        serverProcess.kill('SIGTERM');
      }
    } catch {
      // process already terminated
    }
    serverProcess = null;
  }
}

process.on('SIGINT', () => {
  stopServer();
  process.exit(130);
});

process.on('SIGTERM', () => {
  stopServer();
  process.exit(143);
});

async function run() {
  console.log(`${colors.bold}======================================================${colors.reset}`);
  console.log(`${colors.bold}  Susi Air Pilot App - API Verification Suite         ${colors.reset}`);
  console.log(`${colors.bold}======================================================${colors.reset}\n`);

  try {
    await startServer();
  } catch (err) {
    console.error(`${colors.red}${err.message}${colors.reset}`);
    process.exit(1);
  }

  let token = null;

  try {
    console.log(`${colors.bold}--- Suite 1: Authentication & Guards ---${colors.reset}`);

    await test('POST /auth/login - Invalid credentials returns 401 error envelope', async () => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'johndoe', password: 'badpassword' }),
      });
      assert.strictEqual(res.status, 401, 'Status code must be 401');
      const data = await res.json();
      assert.strictEqual(data.success, false, 'Envelope success must be false');
      assert.strictEqual(data.statusCode, 401, 'Envelope statusCode must be 401');
      assert.strictEqual(data.error, 'Unauthorized', 'Envelope error must be Unauthorized');
      assert.ok(data.message, 'Envelope message must exist');
    });

    await test('POST /auth/login - Malformed body returns 400 validation error', async () => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: '' }),
      });
      assert.strictEqual(res.status, 400, 'Status code must be 400');
      const data = await res.json();
      assert.strictEqual(data.success, false, 'Envelope success must be false');
      assert.strictEqual(data.statusCode, 400, 'Envelope statusCode must be 400');
      assert.strictEqual(data.error, 'Bad Request', 'Envelope error must be Bad Request');
      assert.ok(Array.isArray(data.message), 'Validation message must be array');
    });

    await test('POST /auth/login - Valid credentials returns 200 with Bearer token', async () => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'johndoe', password: 'susiairtest' }),
      });
      assert.ok(res.status === 200 || res.status === 201, `Status must be 200 or 201, got ${res.status}`);
      const data = await res.json();
      assert.ok(data.accessToken, 'accessToken must be returned');
      assert.strictEqual(typeof data.accessToken, 'string', 'accessToken must be string');
      assert.ok(data.pilot, 'pilot summary must be returned');
      assert.strictEqual(data.pilot.username, 'johndoe');
      assert.strictEqual(data.pilot.name, 'John Doe');
      assert.strictEqual(data.pilot.totalFlightHours, 1444.5);
      token = data.accessToken;
    });

    await test('GET /pilot/me - Protected route rejects missing token with 401', async () => {
      const res = await fetch(`${BASE_URL}/pilot/me`);
      assert.strictEqual(res.status, 401, 'Status code must be 401');
      const data = await res.json();
      assert.strictEqual(data.success, false);
      assert.strictEqual(data.statusCode, 401);
    });

    await test('GET /documents - Protected route rejects invalid Bearer token with 401', async () => {
      const res = await fetch(`${BASE_URL}/documents`, {
        headers: { Authorization: 'Bearer fake_invalid_token_123' },
      });
      assert.strictEqual(res.status, 401, 'Status code must be 401');
      const data = await res.json();
      assert.strictEqual(data.success, false);
      assert.strictEqual(data.statusCode, 401);
    });

    console.log(`\n${colors.bold}--- Suite 2: Pilot Profile Endpoint ---${colors.reset}`);

    await test('GET /pilot/me - Returns complete pilot profile and today date', async () => {
      const res = await fetch(`${BASE_URL}/pilot/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.username, 'johndoe');
      assert.strictEqual(data.name, 'John Doe');
      assert.ok(data.role.includes('Line Captain'), 'Role must specify Line Captain');
      assert.strictEqual(data.base, 'CJN (Pangandaran)');
      assert.strictEqual(data.totalFlightHours, 1444.5);
      assert.strictEqual(data.today, '2026-05-15');
      assert.ok(data.avatarUrl, 'avatarUrl must be present');
    });

    console.log(`\n${colors.bold}--- Suite 3: Flight Hours & Regulatory Summary ---${colors.reset}`);

    await test('GET /flight-hours - Range query returns accurate daily entries and sum', async () => {
      const res = await fetch(`${BASE_URL}/flight-hours?from=2026-05-10&to=2026-05-15`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.from, '2026-05-10');
      assert.strictEqual(data.to, '2026-05-15');
      assert.strictEqual(data.totalHours, 25.2);
      assert.strictEqual(data.entries.length, 6);
      assert.strictEqual(data.entries[0].date, '2026-05-10');
      assert.strictEqual(data.entries[0].hours, 1.6);
      assert.strictEqual(data.entries[1].date, '2026-05-11');
      assert.strictEqual(data.entries[1].hours, 0.0);
      assert.strictEqual(data.entries[5].date, '2026-05-15');
      assert.strictEqual(data.entries[5].hours, 6.4);
    });

    await test('GET /flight-hours - Inverted date range (from > to) returns 400 error', async () => {
      const res = await fetch(`${BASE_URL}/flight-hours?from=2026-05-15&to=2026-05-10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.strictEqual(data.success, false);
      assert.strictEqual(data.statusCode, 400);
    });

    await test('GET /flight-hours/summary - Returns 4 regulatory cards on 2026-05-15', async () => {
      const res = await fetch(`${BASE_URL}/flight-hours/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.today, '2026-05-15');
      assert.strictEqual(data.range, '1w');
      assert.strictEqual(data.cards.length, 4);

      const [daily, weekly, monthly, annual] = data.cards;
      assert.strictEqual(daily.key, 'daily');
      assert.strictEqual(daily.current, 6.4);
      assert.strictEqual(daily.limit, 8);
      assert.strictEqual(daily.status, 'warning');

      assert.strictEqual(weekly.key, 'weekly');
      assert.strictEqual(weekly.current, 25.2);
      assert.strictEqual(weekly.limit, 40);
      assert.strictEqual(weekly.status, 'safe');

      assert.strictEqual(monthly.key, 'monthly');
      assert.strictEqual(monthly.current, 87.2);
      assert.strictEqual(monthly.limit, 100);
      assert.strictEqual(monthly.status, 'warning');

      assert.strictEqual(annual.key, 'annual');
      assert.strictEqual(annual.current, 1013.8);
      assert.strictEqual(annual.limit, 1050);
      assert.strictEqual(annual.status, 'warning');
    });

    await test('GET /flight-hours/summary - 15-day chart series centered on today with over-limit points', async () => {
      const res = await fetch(`${BASE_URL}/flight-hours/summary?range=1w`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      assert.strictEqual(res.status, 200);
      const { chart } = await res.json();
      assert.strictEqual(chart.windowDays, 7);
      assert.strictEqual(chart.limit, 40);
      assert.strictEqual(chart.series.length, 15);

      assert.strictEqual(chart.series[0].date, '2026-05-08');
      assert.strictEqual(chart.series[7].date, '2026-05-15');
      assert.strictEqual(chart.series[7].isToday, true);
      assert.strictEqual(chart.series[7].rollingHours, 25.2);
      assert.strictEqual(chart.series[14].date, '2026-05-22');

      const overLimitDates = chart.series.filter((s) => s.isOverLimit).map((s) => s.date);
      assert.deepStrictEqual(overLimitDates, [
        '2026-05-18',
        '2026-05-19',
        '2026-05-20',
        '2026-05-21',
      ]);
    });

    await test('GET /flight-hours/summary - All 5 range toggles verify rolling sum accuracy', async () => {
      const expectedToggles = [
        { range: '1w', windowDays: 7, limit: 40, expectedCenter: 25.2 },
        { range: '1m', windowDays: 30, limit: 100, expectedCenter: 87.2 },
        { range: '3m', windowDays: 90, limit: 300, expectedCenter: 247.6 },
        { range: '6m', windowDays: 180, limit: 600, expectedCenter: 488.2 },
        { range: '1y', windowDays: 365, limit: 1050, expectedCenter: 1013.8 },
      ];

      for (const item of expectedToggles) {
        const res = await fetch(`${BASE_URL}/flight-hours/summary?range=${item.range}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        assert.strictEqual(res.status, 200, `Range ${item.range} failed`);
        const data = await res.json();
        assert.strictEqual(data.chart.windowDays, item.windowDays);
        assert.strictEqual(data.chart.limit, item.limit);
        const center = data.chart.series.find((s) => s.isToday);
        assert.ok(center, `Center point missing for range ${item.range}`);
        assert.strictEqual(center.rollingHours, item.expectedCenter, `Rolling sum mismatch for ${item.range}`);
      }
    });

    await test('GET /flight-hours/summary - Malformed range returns 400 validation error', async () => {
      const res = await fetch(`${BASE_URL}/flight-hours/summary?range=2w`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.strictEqual(data.success, false);
      assert.strictEqual(data.statusCode, 400);
    });

    console.log(`\n${colors.bold}--- Suite 4: Pilot Documents & Expiry Badges ---${colors.reset}`);

    await test('GET /documents - Returns 5 documents with correct countdowns and badge statuses', async () => {
      const res = await fetch(`${BASE_URL}/documents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.today, '2026-05-15');
      assert.strictEqual(data.warningThresholdDays, 30);
      assert.strictEqual(data.documents.length, 5);

      const docMap = new Map(data.documents.map((d) => [d.id, d]));

      const security = docMap.get('doc_security');
      assert.ok(security, 'doc_security must exist');
      assert.strictEqual(security.daysRemaining, -14);
      assert.strictEqual(security.status, 'expired');
      assert.strictEqual(security.badgeLabel, 'Expired');

      const license = docMap.get('doc_license');
      assert.ok(license, 'doc_license must exist');
      assert.strictEqual(license.daysRemaining, 14);
      assert.strictEqual(license.status, 'soon');
      assert.strictEqual(license.badgeLabel, '14d left');

      const medical = docMap.get('doc_medical');
      assert.ok(medical, 'doc_medical must exist');
      assert.strictEqual(medical.daysRemaining, 27);
      assert.strictEqual(medical.status, 'soon');
      assert.strictEqual(medical.badgeLabel, '27d left');

      const recurrent = docMap.get('doc_recurrent');
      assert.ok(recurrent, 'doc_recurrent must exist');
      assert.strictEqual(recurrent.daysRemaining, 152);
      assert.strictEqual(recurrent.status, 'safe');
      assert.strictEqual(recurrent.badgeLabel, '152d left');

      const ppc = docMap.get('doc_ppc');
      assert.ok(ppc, 'doc_ppc must exist');
      assert.strictEqual(ppc.daysRemaining, 224);
      assert.strictEqual(ppc.status, 'safe');
      assert.strictEqual(ppc.badgeLabel, '224d left');
    });

    console.log(`\n${colors.bold}--- Suite 5: Monthly Schedules & Duty Legend ---${colors.reset}`);

    await test('GET /schedules - Filters May 2026 with 21 duties, legend, and completion counts', async () => {
      const res = await fetch(`${BASE_URL}/schedules?year=2026&month=5`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.year, 2026);
      assert.strictEqual(data.month, 5);
      assert.strictEqual(data.legend.length, 10);
      assert.strictEqual(data.schedules.length, 21);

      const completed = data.schedules.filter((s) => s.isCompleted);
      const incomplete = data.schedules.filter((s) => !s.isCompleted);
      assert.strictEqual(completed.length, 11, 'Must have 11 completed duties');
      assert.strictEqual(incomplete.length, 10, 'Must have 10 incomplete duties');

      const entry1 = data.schedules.find((s) => s.duty_date === '2026-05-01');
      assert.ok(entry1);
      assert.strictEqual(entry1.count_schedules, 2);
      assert.strictEqual(entry1.count_logbooks, 2);
      assert.strictEqual(entry1.isCompleted, true);
      assert.strictEqual(entry1.remainingDuties, 0);

      const entry2 = data.schedules.find((s) => s.duty_date === '2026-05-29');
      assert.ok(entry2);
      assert.strictEqual(entry2.count_schedules, 4);
      assert.strictEqual(entry2.count_logbooks, 0);
      assert.strictEqual(entry2.isCompleted, false);
      assert.strictEqual(entry2.remainingDuties, 4);
    });

    await test('GET /schedules - Empty month returns 0 schedules and full legend', async () => {
      const res = await fetch(`${BASE_URL}/schedules?year=2026&month=7`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.schedules.length, 0);
      assert.strictEqual(data.legend.length, 10);
    });

    await test('GET /schedules - Invalid month query returns 400 validation error', async () => {
      const res = await fetch(`${BASE_URL}/schedules?year=2026&month=13`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.strictEqual(data.success, false);
      assert.strictEqual(data.statusCode, 400);
    });
  } finally {
    stopServer();
  }

  const durationSec = ((Date.now() - stats.startTime) / 1000).toFixed(2);
  console.log(`\n${colors.bold}======================================================${colors.reset}`);
  console.log(`${colors.bold}  Verification Summary                                ${colors.reset}`);
  console.log(`${colors.bold}======================================================${colors.reset}`);
  console.log(`  Total Tests : ${stats.total}`);
  console.log(`  Passed      : ${colors.green}${stats.passed}${colors.reset}`);
  console.log(`  Failed      : ${stats.failed > 0 ? colors.red + stats.failed + colors.reset : '0'}`);
  console.log(`  Duration    : ${durationSec}s`);
  console.log(`  Status      : ${stats.failed === 0 ? colors.green + 'ALL PASSED' : colors.red + 'FAILURES DETECTED'}${colors.reset}`);
  console.log(`${colors.bold}======================================================${colors.reset}\n`);

  process.exit(stats.failed === 0 ? 0 : 1);
}

run().catch((err) => {
  console.error(`${colors.red}[FATAL] Unexpected error:${colors.reset}`, err);
  stopServer();
  process.exit(1);
});
