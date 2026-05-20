<script setup lang="ts">
defineProps<{
  title: string;
  message: string;
  confirmText: string;
}>();

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();

function onOverlayClick(e: MouseEvent) {
  if (e.target === e.currentTarget) emit('cancel');
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('cancel');
}
</script>

<template>
  <div class="overlay" @click="onOverlayClick" @keydown="onKeydown" tabindex="-1">
    <div class="dialog" role="alertdialog" aria-modal="true" :aria-label="title">
      <h2 class="dialog-title">{{ title }}</h2>
      <p class="dialog-message">{{ message }}</p>
      <div class="dialog-actions">
        <button class="btn btn-ghost" type="button" @click="emit('cancel')">Abbrechen</button>
        <button class="btn btn-danger" type="button" @click="emit('confirm')">
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 16px;
}

.dialog {
  background: var(--color-surface);
  border-radius: var(--radius);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  padding: 28px 24px 24px;
  max-width: 360px;
  width: 100%;
}

.dialog-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--color-text);
}

.dialog-message {
  color: var(--color-text-muted);
  margin-bottom: 24px;
  line-height: 1.6;
}

.dialog-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn {
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  min-height: 44px;
}

.btn-ghost {
  background: var(--color-bg);
  color: var(--color-text);
}

.btn-ghost:hover {
  background: #e8eaf0;
}

.btn-danger {
  background: var(--color-danger);
  color: #fff;
}

.btn-danger:hover {
  background: #dc2626;
}
</style>
