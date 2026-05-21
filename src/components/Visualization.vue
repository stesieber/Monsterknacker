<script setup lang="ts">
import { computed } from 'vue';
import { useVisualization } from '../composables/useVisualization';

const props = defineProps<{ a: number; b: number }>();

const { partition } = useVisualization();

const UNIT = 30;
const PAD_LEFT = 32;
const PAD_TOP = 32;
const PAD_RIGHT = 8;
const PAD_BOTTOM = 8;

const blocks = computed(() => partition(props.a, props.b));

const viewBox = computed(
  () => `0 0 ${PAD_LEFT + props.a * UNIT + PAD_RIGHT} ${PAD_TOP + props.b * UNIT + PAD_BOTTOM}`
);

const COLOR_MAP: Record<string, string> = {
  A: 'var(--viz-color-a)',
  B: 'var(--viz-color-b)',
  C: 'var(--viz-color-c)',
  D: 'var(--viz-color-d)',
};

/** Axis label segments for the horizontal (a) axis. */
const axisLabelsA = computed(() => {
  const segs: Array<{ value: number; x: number; width: number }> = [];
  const aFives = props.a >= 5 ? 5 : 0;
  const aRest = props.a >= 5 ? props.a - 5 : props.a;
  if (aFives > 0) segs.push({ value: aFives, x: 0, width: aFives });
  if (aRest > 0) segs.push({ value: aRest, x: aFives, width: aRest });
  return segs;
});

/** Axis label segments for the vertical (b) axis. */
const axisLabelsB = computed(() => {
  const segs: Array<{ value: number; y: number; height: number }> = [];
  const bFives = props.b >= 5 ? 5 : 0;
  const bRest = props.b >= 5 ? props.b - 5 : props.b;
  if (bFives > 0) segs.push({ value: bFives, y: 0, height: bFives });
  if (bRest > 0) segs.push({ value: bRest, y: bFives, height: bRest });
  return segs;
});

function blockFontSize(w: number, h: number): number {
  return w < 2 || h < 2 ? 12 : 18;
}
</script>

<template>
  <div class="viz-container">
    <svg
      :viewBox="viewBox"
      role="img"
      :aria-label="`Rechteck-Visualisierung von ${a} mal ${b}`"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- Colored blocks -->
      <rect
        v-for="bl in blocks"
        :key="bl.colorSlot"
        :x="PAD_LEFT + bl.x * UNIT"
        :y="PAD_TOP + bl.y * UNIT"
        :width="bl.width * UNIT"
        :height="bl.height * UNIT"
        :fill="COLOR_MAP[bl.colorSlot]"
        stroke="var(--viz-stroke)"
        stroke-width="2"
        rx="2"
      />

      <!-- Sub-product labels centered in each block -->
      <text
        v-for="bl in blocks"
        :key="`lbl-${bl.colorSlot}`"
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
}

.viz-container svg {
  width: 100%;
  height: auto;
  display: block;
}

@keyframes viz-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
</style>
