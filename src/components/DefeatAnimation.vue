<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import type { MonsterType } from '../types/index';
import MonsterIcon from './MonsterIcon.vue';

const props = defineProps<{
  type: MonsterType;
  newKind: 'silver' | 'gold';
  a: number;
  b: number;
}>();

const emit = defineEmits<{ done: [] }>();

const phase = ref<'wobble' | 'sparkle' | 'transform' | 'hero'>('wobble');
const heroVisible = ref(false);

const sparkles = [
  { x: 22, y: 32, dx: -28, dy: -24, delay: 0 },
  { x: 78, y: 28, dx: 24, dy: -28, delay: 80 },
  { x: 14, y: 58, dx: -32, dy: 8, delay: 40 },
  { x: 86, y: 62, dx: 30, dy: 12, delay: 120 },
  { x: 50, y: 18, dx: 0, dy: -36, delay: 60 },
  { x: 35, y: 78, dx: -20, dy: 28, delay: 160 },
  { x: 65, y: 80, dx: 22, dy: 26, delay: 100 },
];

const timeouts: ReturnType<typeof setTimeout>[] = [];

function done() {
  timeouts.forEach(clearTimeout);
  emit('done');
}

onMounted(() => {
  timeouts.push(setTimeout(() => (phase.value = 'sparkle'), 300));
  timeouts.push(setTimeout(() => (phase.value = 'transform'), 800));
  timeouts.push(
    setTimeout(() => {
      phase.value = 'hero';
      heroVisible.value = true;
    }, 1000)
  );
  timeouts.push(setTimeout(() => done(), 1400));

  document.addEventListener('keydown', onKey);
});

onUnmounted(() => {
  timeouts.forEach(clearTimeout);
  document.removeEventListener('keydown', onKey);
});

function onKey(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    done();
  }
}

const label = `${props.a} × ${props.b} ist jetzt ein ${props.newKind === 'gold' ? 'Goldheld! ✨' : 'Silberheld!'}`;
</script>

<template>
  <div class="defeat-overlay" @click="done" aria-live="polite">
    <p class="defeat-label">{{ label }}</p>

    <div class="defeat-stage">
      <!-- Monster (fades out during transform) -->
      <div
        class="defeat-creature"
        :class="{
          'creature--wobble': phase === 'wobble' || phase === 'sparkle',
          'creature--fadeout': phase === 'transform' || phase === 'hero',
        }"
      >
        <MonsterIcon :type="type" tone="monster" :size="96" :decorative="true" />
      </div>

      <!-- Hero (fades in) -->
      <div
        class="defeat-creature defeat-creature--hero"
        :class="{ 'creature--fadein': heroVisible }"
      >
        <MonsterIcon :type="type" :tone="newKind" :size="96" :decorative="true" />
      </div>

      <!-- Sparkle particles -->
      <span
        v-for="(s, i) in sparkles"
        :key="i"
        class="sparkle"
        :class="{ 'sparkle--active': phase === 'sparkle' || phase === 'transform' }"
        :style="{
          left: `${s.x}%`,
          top: `${s.y}%`,
          '--sx': `${s.dx}px`,
          '--sy': `${s.dy}px`,
          animationDelay: `${s.delay}ms`,
        }"
        aria-hidden="true"
      >
        ✦
      </span>
    </div>

    <p class="defeat-hint">Tippe zum Überspringen</p>
  </div>
</template>

<style scoped>
.defeat-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  z-index: 150;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.45);
  padding: 24px;
}

.defeat-label {
  font-size: clamp(1.1rem, 4vw, 1.5rem);
  font-weight: 800;
  color: #fff;
  text-align: center;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  z-index: 1;
}

.defeat-stage {
  position: relative;
  width: 160px;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.defeat-creature {
  position: absolute;
  transition: opacity 0.35s ease, transform 0.35s ease;
}

.defeat-creature--hero {
  opacity: 0;
}

.creature--wobble {
  animation: monster-wobble 0.6s ease-in-out;
}

.creature--fadeout {
  opacity: 0;
  transform: scale(0.8);
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.creature--fadein {
  opacity: 1;
  animation: hero-bounce 0.4s ease-out forwards;
}

.defeat-hint {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  z-index: 1;
}

.sparkle {
  position: absolute;
  font-size: 1.2rem;
  color: #f5c542;
  opacity: 0;
  pointer-events: none;
  transform-origin: center;
}

.sparkle--active {
  animation: sparkle 0.55s ease-out forwards;
}

@media (prefers-reduced-motion: reduce) {
  .creature--wobble {
    animation: none;
  }
  .creature--fadein {
    animation: hero-reveal 0.4s ease forwards;
  }
  .sparkle--active {
    animation: none;
    opacity: 0;
  }
}
</style>
