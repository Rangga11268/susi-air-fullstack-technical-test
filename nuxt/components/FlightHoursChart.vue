<template>
  <div class="chart-container card">
    <div class="chart-head">
      <div class="title-wrap">
        <h3 class="chart-title">Flight Hours Trend</h3>
        <span class="chart-subtitle">15-day rolling sum duty curve</span>
      </div>

      <!-- Range Selector Pills -->
      <div class="range-selector" role="tablist" aria-label="Select timeframe range">
        <button
          v-for="r in ranges"
          :key="r"
          type="button"
          role="tab"
          :aria-selected="currentRange === r"
          class="range-btn"
          :class="{ active: currentRange === r }"
          @click="selectRange(r)"
        >
          {{ r }}
        </button>
      </div>
    </div>

    <!-- Chart Canvas / Loading State -->
    <div class="svg-wrapper" @mouseleave="activePoint = null">
      <div v-if="isLoading" class="chart-loading-overlay">
        <span class="spinner" />
        <span class="loading-text">Updating trend data...</span>
      </div>

      <svg
        v-if="chartData && chartData.series.length > 0"
        class="trend-svg"
        viewBox="0 0 380 200"
        preserveAspectRatio="xMidYMid meet"
        aria-label="Flight hours rolling sum chart"
      >
        <defs>
          <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#22C5E8" stop-opacity="0.28" />
            <stop offset="100%" stop-color="#22C5E8" stop-opacity="0.0" />
          </linearGradient>
        </defs>

        <!-- Y-Axis Grid Lines & Labels -->
        <g class="grid-lines">
          <!-- Top Grid line -->
          <line :x1="margin.left" :y1="margin.top" :x2="width - margin.right" :y2="margin.top" stroke="rgba(14,33,56,0.06)" stroke-width="1" />
          <text :x="margin.left - 6" :y="margin.top + 4" class="axis-label" text-anchor="end">{{ Math.round(effectiveYMax) }}h</text>

          <!-- Middle Grid line -->
          <line :x1="margin.left" :y1="midY" :x2="width - margin.right" :y2="midY" stroke="rgba(14,33,56,0.06)" stroke-width="1" />
          <text :x="margin.left - 6" :y="midY + 4" class="axis-label" text-anchor="end">{{ Math.round(effectiveYMax / 2) }}h</text>

          <!-- Baseline -->
          <line :x1="margin.left" :y1="bottomY" :x2="width - margin.right" :y2="bottomY" stroke="rgba(14,33,56,0.12)" stroke-width="1" />
          <text :x="margin.left - 6" :y="bottomY + 4" class="axis-label" text-anchor="end">0h</text>
        </g>

        <!-- Red Dashed Regulatory Limit Line -->
        <g v-if="limitY !== null" class="limit-line-group">
          <line
            :x1="margin.left"
            :y1="limitY"
            :x2="width - margin.right"
            :y2="limitY"
            stroke="#E63757"
            stroke-dasharray="5,4"
            stroke-width="1.5"
          />
        </g>

        <!-- Today Centered Vertical Indicator -->
        <g v-if="todayX !== null" class="today-marker-group">
          <line
            :x1="todayX"
            :y1="margin.top"
            :x2="todayX"
            :y2="bottomY"
            stroke="rgba(14, 33, 56, 0.25)"
            stroke-dasharray="3,3"
            stroke-width="1.5"
          />
          <!-- Today Badge at Top -->
          <rect
            :x="todayX - 22"
            :y="4"
            width="44"
            height="14"
            rx="7"
            fill="#0E2138"
          />
          <text
            :x="todayX"
            :y="14"
            class="today-badge-text"
            text-anchor="middle"
          >
            TODAY
          </text>
        </g>

        <!-- Area Gradient Fill -->
        <path :d="areaPath" fill="url(#curveGradient)" />

        <!-- Main Trend Line Curve -->
        <path
          :d="pastLinePath"
          fill="none"
          stroke="#22C5E8"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <!-- Future Projected Line Segment -->
        <path
          v-if="futureLinePath"
          :d="futureLinePath"
          fill="none"
          stroke="#22C5E8"
          stroke-width="2"
          stroke-dasharray="4,3"
          stroke-linecap="round"
        />

        <!-- Limit Label Tag (Positioned in highest-clearance slot to avoid node collision) -->
        <g v-if="limitY !== null && limitBadgePos" class="limit-badge-layer">
          <rect
            :x="limitBadgePos.rectX"
            :y="limitBadgePos.rectY"
            width="62"
            height="14"
            rx="4"
            fill="#E63757"
          />
          <text
            :x="limitBadgePos.textX"
            :y="limitBadgePos.textY"
            class="limit-tag-text"
            text-anchor="middle"
          >
            Limit: {{ chartData.limit }}h
          </text>
        </g>

        <!-- Data Points Nodes -->
        <g
          v-for="(pt, idx) in plottedPoints"
          :key="pt.date"
          class="data-node"
          tabindex="0"
          :aria-label="`${pt.date}: ${pt.rollingHours}h rolling`"
          @mouseenter="activePoint = pt"
          @click="activePoint = pt"
        >
          <!-- Hover / Tap Target Circle -->
          <circle
            :cx="pt.x"
            :cy="pt.y"
            r="12"
            fill="transparent"
            class="hit-area"
          />

          <!-- Over-limit Alert Node -->
          <circle
            v-if="pt.isOverLimit"
            :cx="pt.x"
            :cy="pt.y"
            r="5"
            fill="#E63757"
            stroke="#FFFFFF"
            stroke-width="2"
          />

          <!-- Today Node -->
          <circle
            v-else-if="pt.isToday"
            :cx="pt.x"
            :cy="pt.y"
            r="5"
            fill="#22C5E8"
            stroke="#0E2138"
            stroke-width="2"
          />

          <!-- Regular Past Node -->
          <circle
            v-else-if="!pt.isFuture"
            :cx="pt.x"
            :cy="pt.y"
            r="3.5"
            fill="#FFFFFF"
            stroke="#22C5E8"
            stroke-width="2"
          />

          <!-- Projected Future Node -->
          <circle
            v-else
            :cx="pt.x"
            :cy="pt.y"
            r="3"
            fill="#FFFFFF"
            stroke="rgba(34, 197, 232, 0.6)"
            stroke-width="1.5"
          />

          <!-- Symmetric X-Axis Date Ticks (8 May, 11 May, 15 May, 19 May, 22 May) -->
          <text
            v-if="shouldShowTick(idx, pt.isToday)"
            :x="pt.x"
            :y="bottomY + 15"
            class="date-tick-text"
            :class="{ 'bold-tick': pt.isToday }"
            text-anchor="middle"
          >
            {{ formatShortDate(pt.date) }}
          </text>
        </g>
      </svg>

      <!-- Interactive Point Tooltip Card -->
      <div v-if="activePoint" class="chart-tooltip" :style="tooltipStyle">
        <div class="tooltip-head">
          <span class="tooltip-date">{{ formatFullDate(activePoint.date) }}</span>
          <span
            v-if="activePoint.isOverLimit"
            class="tooltip-badge badge-over"
          >
            Over Limit
          </span>
          <span
            v-else-if="activePoint.isToday"
            class="tooltip-badge badge-today"
          >
            Today
          </span>
          <span
            v-else-if="activePoint.isFuture"
            class="tooltip-badge badge-proj"
          >
            Projected
          </span>
        </div>
        <div class="tooltip-row">
          <span class="tooltip-label">Rolling Sum:</span>
          <strong class="tooltip-val tabular-nums">{{ activePoint.rollingHours }} hrs</strong>
        </div>
        <div class="tooltip-row">
          <span class="tooltip-label">Daily Duty:</span>
          <span class="tooltip-val-sub tabular-nums">{{ activePoint.dailyHours }} hrs</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { TimeframeRange, ChartSeriesPoint, ChartData } from '~/stores/pilot';
import { usePilotStore } from '~/stores/pilot';

const pilotStore = usePilotStore();
const ranges: TimeframeRange[] = ['1w', '1m', '3m', '6m', '1y'];

const currentRange = computed(() => pilotStore.selectedRange);
const chartData = computed<ChartData | null>(() => pilotStore.chartData);
const isLoading = computed(() => pilotStore.isLoadingSummary);

const activePoint = ref<(ChartSeriesPoint & { x: number; y: number }) | null>(null);

const width = 380;
const height = 200;
const margin = { top: 24, right: 16, bottom: 36, left: 36 };
const plotWidth = width - margin.left - margin.right; // 328
const plotHeight = height - margin.top - margin.bottom; // 140
const bottomY = height - margin.bottom; // 164
const midY = margin.top + plotHeight / 2; // 94

// Dynamic Y Max scaling to guarantee over-limit points never clip
const effectiveYMax = computed(() => {
  if (!chartData.value) return 45;
  const maxInSeries = Math.max(
    ...chartData.value.series.map((p) => p.rollingHours),
    0,
  );
  return Math.max(chartData.value.yMax, maxInSeries * 1.08, chartData.value.limit * 1.05);
});

// Regulatory limit line Y coordinate
const limitY = computed(() => {
  if (!chartData.value) return null;
  const ratio = chartData.value.limit / effectiveYMax.value;
  return bottomY - ratio * plotHeight;
});

// Plotted points mapping
const plottedPoints = computed(() => {
  if (!chartData.value || chartData.value.series.length === 0) return [];
  const series = chartData.value.series;
  const count = series.length;
  const step = count > 1 ? plotWidth / (count - 1) : 0;

  return series.map((pt, idx) => {
    const x = margin.left + idx * step;
    const ratio = Math.max(0, pt.rollingHours) / effectiveYMax.value;
    const y = bottomY - ratio * plotHeight;
    return {
      ...pt,
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
    };
  });
});

// Today X coordinate
const todayX = computed(() => {
  const todayPt = plottedPoints.value.find((p) => p.isToday);
  return todayPt ? todayPt.x : null;
});

// Choose the highest-clearance quadrant along the limit line so the badge never collides with data nodes
const limitBadgePos = computed(() => {
  if (limitY.value === null) return null;
  const ly = limitY.value;
  const bw = 62;
  const bh = 14;

  const candidates = [
    { rectX: margin.left + 4, rectY: ly - bh - 3 },
    { rectX: margin.left + 4, rectY: ly + 4 },
    { rectX: width - margin.right - bw - 4, rectY: ly - bh - 3 },
    { rectX: width - margin.right - bw - 4, rectY: ly + 4 },
  ];

  let best = candidates[0];
  let bestMinDist = -1;

  for (const c of candidates) {
    if (c.rectY < 4) continue;
    let minDist = Infinity;
    for (const pt of plottedPoints.value) {
      const dx = Math.max(c.rectX - pt.x, 0, pt.x - (c.rectX + bw));
      const dy = Math.max(c.rectY - pt.y, 0, pt.y - (c.rectY + bh));
      const dist = Math.hypot(dx, dy);
      if (dist < minDist) minDist = dist;
    }

    if (minDist > bestMinDist) {
      bestMinDist = minDist;
      best = c;
    }
  }

  return {
    rectX: best.rectX,
    rectY: best.rectY,
    textX: best.rectX + bw / 2,
    textY: best.rectY + 10,
  };
});

function shouldShowTick(idx: number, isToday: boolean): boolean {
  if (isToday) return true;
  return idx === 0 || idx === 3 || idx === 11 || idx === 14;
}

// Line paths
const areaPath = computed(() => {
  const pts = plottedPoints.value;
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x} ${bottomY} L ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    d += ` L ${pts[i].x} ${pts[i].y}`;
  }
  const last = pts[pts.length - 1];
  d += ` L ${last.x} ${bottomY} Z`;
  return d;
});

const pastLinePath = computed(() => {
  const pts = plottedPoints.value;
  if (pts.length < 2) return '';
  // Past points include all points up to and including today
  const pastPts = pts.filter((p) => !p.isFuture || p.isToday);
  if (pastPts.length < 1) return '';
  let d = `M ${pastPts[0].x} ${pastPts[0].y}`;
  for (let i = 1; i < pastPts.length; i++) {
    d += ` L ${pastPts[i].x} ${pastPts[i].y}`;
  }
  return d;
});

const futureLinePath = computed(() => {
  const pts = plottedPoints.value;
  // Future points start from today to the end
  const futurePts = pts.filter((p) => p.isFuture || p.isToday);
  if (futurePts.length < 2) return '';
  let d = `M ${futurePts[0].x} ${futurePts[0].y}`;
  for (let i = 1; i < futurePts.length; i++) {
    d += ` L ${futurePts[i].x} ${futurePts[i].y}`;
  }
  return d;
});

// Tooltip positioning
const tooltipStyle = computed(() => {
  if (!activePoint.value) return {};
  const pt = activePoint.value;
  // Clamp tooltip inside container
  const leftPct = (pt.x / width) * 100;
  const isRightSide = pt.x > width * 0.6;
  return {
    left: `${leftPct}%`,
    top: `${Math.max(10, (pt.y / height) * 100 - 32)}%`,
    transform: isRightSide ? 'translate(-105%, 0)' : 'translate(10%, 0)',
  };
});

function selectRange(r: TimeframeRange) {
  pilotStore.setRange(r);
}

function formatShortDate(dateStr: string): string {
  try {
    const [, month, day] = dateStr.split('-').map(Number);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${months[month - 1]}`;
  } catch {
    return dateStr;
  }
}

function formatFullDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${dayNames[date.getUTCDay()]}, ${date.getUTCDate()} ${monthNames[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
  } catch {
    return dateStr;
  }
}
</script>

<style scoped lang="scss">
@use '~/assets/scss/variables' as *;

.chart-container {
  padding: 16px;
  position: relative;
}

.chart-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
}

.title-wrap {
  .chart-title {
    font-size: 15px;
    font-weight: 700;
    color: $color-text-primary;
    line-height: 1.2;
    margin: 0;
  }

  .chart-subtitle {
    font-size: 11px;
    color: $color-text-secondary;
    margin-top: 2px;
  }
}

.range-selector {
  display: inline-flex;
  background-color: rgba(14, 33, 56, 0.06);
  border-radius: $radius-pill;
  padding: 2px;
  gap: 2px;
}

.range-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  padding: 8px 12px;
  min-height: 44px;
  min-width: 44px;
  border-radius: $radius-pill;
  color: $color-text-secondary;
  transition: all 0.15s ease;

  &.active {
    background-color: $color-primary-navy;
    color: #FFFFFF;
    box-shadow: 0 1px 4px rgba(14, 33, 56, 0.15);
  }

  &:hover:not(.active) {
    color: $color-text-primary;
    background-color: rgba(14, 33, 56, 0.04);
  }

  &:focus-visible {
    outline: 2px solid $color-chart-accent;
    outline-offset: 2px;
  }
}

.svg-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 380 / 200;
  overflow: visible;
}

.trend-svg {
  width: 100%;
  height: 100%;
  display: block;
  overflow: visible;
}

.chart-loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.7);
  z-index: 10;
  border-radius: $radius-card;
  gap: 8px;

  .loading-text {
    font-size: 11px;
    font-weight: 600;
    color: $color-text-secondary;
  }
}

.axis-label {
  font-size: 9px;
  fill: $color-text-muted;
  font-family: inherit;
  font-variant-numeric: tabular-nums;
}

.date-tick-text {
  font-size: 9px;
  fill: $color-text-secondary;
  font-family: inherit;

  &.bold-tick {
    font-weight: 700;
    fill: $color-primary-navy;
  }
}

.limit-tag-text {
  font-size: 8.5px;
  font-weight: 700;
  fill: #FFFFFF;
  font-family: inherit;
}

.today-badge-text {
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.05em;
  fill: $color-chart-accent;
  font-family: inherit;
}

.data-node {
  cursor: pointer;

  &:hover circle:not(.hit-area) {
    transform: scale(1.2);
    transform-origin: center;
  }
}

.chart-tooltip {
  position: absolute;
  background-color: #0E2138;
  color: #FFFFFF;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 11px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  pointer-events: none;
  z-index: 20;
  white-space: nowrap;
  min-width: 130px;

  .tooltip-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    margin-bottom: 4px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
    padding-bottom: 3px;
  }

  .tooltip-date {
    font-size: 10px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.85);
  }

  .tooltip-badge {
    font-size: 9px;
    font-weight: 700;
    padding: 1px 4px;
    border-radius: 3px;

    &.badge-over {
      background-color: $color-brand-red;
      color: #FFFFFF;
    }

    &.badge-today {
      background-color: $color-chart-accent;
      color: $color-primary-navy;
    }

    &.badge-proj {
      background-color: rgba(255, 255, 255, 0.2);
      color: #FFFFFF;
    }
  }

  .tooltip-row {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    margin-top: 2px;
  }

  .tooltip-label {
    color: rgba(255, 255, 255, 0.65);
    font-size: 10px;
  }

  .tooltip-val {
    color: $color-chart-accent;
    font-weight: 700;
  }

  .tooltip-val-sub {
    color: #FFFFFF;
  }
}
</style>
