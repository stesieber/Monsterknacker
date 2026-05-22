<script setup lang="ts">
defineProps<{
  label: string;
  value: string | number;
  icon?: string;
}>();
</script>

<template>
  <div class="stat-tile">
    <span v-if="icon" class="stat-tile-icon" aria-hidden="true">{{ icon }}</span>
    <span class="stat-tile-value">{{ value }}</span>
    <span class="stat-tile-label">{{ label }}</span>
  </div>
</template>

<style scoped>
.stat-tile {
  background: var(--color-surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-height: 88px;
  justify-content: center;
}

.stat-tile-icon {
  font-size: 1.4rem;
  line-height: 1;
}

.stat-tile-value {
  font-size: clamp(1.4rem, 5vw, 2rem);
  font-weight: 800;
  color: var(--color-text);
  line-height: 1.1;
  word-break: break-all;
}

.stat-tile-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-align: center;
}
</style>
