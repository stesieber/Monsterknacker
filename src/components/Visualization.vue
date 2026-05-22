<script setup lang="ts">
import { computed } from 'vue';
import { partition, decompose } from '../utils/visualization';
import type { ColorSlot } from '../types/index';

const props = defineProps<{ a: number; b: number }>();

const UNIT = 30;
const PAD_LEFT = 32;
const PAD_TOP = 32;
const PAD_RIGHT = 8;
const PAD_BOTTOM = 8;

const blocks = computed(() => partition(props.a, props.b));

const viewBox = computed(
  () => `0 0 ${PAD_LEFT + props.a * UNIT + PAD_RIGHT} ${PAD_TOP + props.b * UNIT + PAD_BOTTOM}`
);

const COLOR_MAP: Record<ColorSlot, string> = {
  FF: 'var(--viz-color-ff)',
  FR: 'var(--viz-color-fr)',
  RF: 'var(--viz-color-rf)',
  RR: 'var(--viz-color-rr)',
  FT: 'var(--viz-color-ft)',
  RT: 'var(--viz-color-rt)',
};

/** Axis label segments for the horizontal (a) axis. */
const axisLabelsA = computed(() => {
  const segs: Array<{ value: number; x: number; width: number }> = [];
  let offset = 0;
  for (const s of decompose(props.a)) {
    segs.push({ value: s, x: offset, width: s });
    offset += s;
  }
  return segs;
});

/** Axis label segments for the vertical (b) axis. */
const axisLabelsB = computed(() => {
  const segs: Array<{ value: number; y: number; height: number }> = [];
  let offset = 0;
  for (const s of decompose(props.b)) {
    segs.push({ value: s, y: offset, height: s });
    offset += s;
  }
  return segs;
});

function blockFontSize(w: number, h: number): number {
  return w < 2 || h < 2 ? 12 : 18;
}

const gridLines = computed(() => {
  const lines: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
  for (const bl of blocks.value) {
    for (let i = 1; i < bl.width; i++) {
      const x = PAD_LEFT + (bl.x + i) * UNIT;
      lines.push({ x1: x, y1: PAD_TOP + bl.y * UNIT, x2: x, y2: PAD_TOP + (bl.y + bl.height) * UNIT });
    }
    for (let j = 1; j < bl.height; j++) {
      const y = PAD_TOP + (bl.y + j) * UNIT;
      lines.push({ x1: PAD_LEFT + bl.x * UNIT, y1: y, x2: PAD_LEFT + (bl.x + bl.width) * UNIT, y2: y });
    }
  }
  return lines;
});

const isTall = computed(() => props.b > 10);
</script>

<template>
  <div class="viz-container" :class="{ 'viz-container--tall': isTall }">
    <svg
      :viewBox="viewBox"
      role="img"
      :aria-label="`Rechteck-Visualisierung von ${a} mal ${b}`"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- Colored blocks -->
      <rect
        v-for="(bl, i) in blocks"
        :key="`bl-${i}`"
        :x="PAD_LEFT + bl.x * UNIT"
        :y="PAD_TOP + bl.y * UNIT"
        :width="bl.width * UNIT"
        :height="bl.height * UNIT"
        :fill="COLOR_MAP[bl.colorSlot]"
        stroke="var(--viz-stroke)"
        stroke-width="2"
        rx="2"
      />

      <!-- Inner grid lines showing individual cells -->
      <line
        v-for="(ln, i) in gridLines"
        :key="`grid-${i}`"
        :x1="ln.x1"
        :y1="ln.y1"
        :x2="ln.x2"
        :y2="ln.y2"
        stroke="var(--viz-stroke)"
        stroke-width="1"
        stroke-opacity="0.6"
      />

      <!-- Sub-product labels centered in each block -->
      <text
        v-for="(bl, i) in blocks"
        :key="`lbl-${i}`"
        :x="PAD_LEFT + bl.x * UNIT + (bl.width * UNIT) / 2"
        :y="PAD_TOP + bl.y * UNIT + (bl.height * UNIT) / 2"
        text-anchor="middle"
        dominant-baseline="central"
        :font-size="blockFontSize(bl.width, bl.height)"
        font-weight="600"
        fill="var(--viz-text)"
      >{{ bl.label }}</text>

      <!-- Axis labels top (a-axis) -->
      <text
        v-for="seg in axisLabelsA"
        :key="`ax-a-${seg.x}`"
        :x="PAD_LEFT + seg.x * UNIT + (seg.width * UNIT) / 2"
        :y="PAD_TOP - 10"
        text-anchor="middle"
        dominant-baseline="central"
        font-size="14"
        font-weight="500"
        fill="var(--viz-axis)"
      >{{ seg.value }}</text>

      <!-- Axis labels left (b-axis) -->
      <text
        v-for="seg in axisLabelsB"
        :key="`ax-b-${seg.y}`"
        :x="PAD_LEFT - 10"
        :y="PAD_TOP + seg.y * UNIT + (seg.height * UNIT) / 2"
        text-anchor="middle"
        dominant-baseline="central"
        font-size="14"
        font-weight="500"
        fill="var(--viz-axis)"
      >{{ seg.value }}</text>
    </svg>
  </div>
</template>

<style scoped>
.viz-container {
  width: 100%;
  max-width: 360px;
  margin: 1rem auto;
  animation: viz-fade-in 0.2s ease;
  display: flex;
  justify-content: center;
}

/* Bei grossen Faktoren (b > 10) das SVG begrenzen,
   damit es auf einem 375×667-Viewport ohne Overflow passt.
   preserveAspectRatio sorgt für proportionale Skalierung ohne Verzerrung. */
.viz-container--tall {
  max-width: 320px;
}

.viz-container svg {
  width: 100%;
  height: auto;
  max-height: 60vh;
  display: block;
}

.viz-container--tall svg {
  max-height: min(60vh, 360px);
}

@keyframes viz-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
</style>
