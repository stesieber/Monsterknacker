<script setup lang="ts">
import { ref, onMounted } from 'vue';

defineProps<{ disabled?: boolean }>();
const emit = defineEmits<{ submit: [value: number] }>();

const inputRef = ref<HTMLInputElement | null>(null);
const rawValue = ref('');

onMounted(() => {
  inputRef.value?.focus({ preventScroll: true });
});

function onInput(e: Event) {
  const target = e.target as HTMLInputElement;
  const filtered = target.value.replace(/\D/g, '').slice(0, 4);
  rawValue.value = filtered;
  target.value = filtered;
}

function submit() {
  if (!rawValue.value) return;
  emit('submit', parseInt(rawValue.value, 10));
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') submit();
}
</script>

<template>
  <div class="answer-input">
    <input
      ref="inputRef"
      class="answer-field"
      type="text"
      inputmode="numeric"
      pattern="[0-9]*"
      maxlength="4"
      :disabled="disabled"
      placeholder="?"
      autocomplete="off"
      @input="onInput"
      @keydown="onKeydown"
    />
    <button
      class="ok-btn"
      type="button"
      :disabled="!rawValue || disabled"
      @click="submit"
    >
      OK
    </button>
  </div>
</template>

<style scoped>
.answer-input {
  display: flex;
  gap: 12px;
  align-items: stretch;
  width: 100%;
  max-width: 340px;
}

.answer-field {
  flex: 1;
  min-width: 0; /* prevents input from overflowing flex container */
  min-height: 56px;
  padding: 0 12px;
  border: 2px solid #d1d5db;
  border-radius: 12px;
  font-size: 1.6rem;
  font-weight: 700;
  text-align: center;
  background: var(--color-surface);
  color: var(--color-text);
  outline: none;
  transition: border-color 0.15s;
}

.answer-field:focus {
  border-color: var(--color-primary);
}

.answer-field:disabled {
  opacity: 0.5;
}

.ok-btn {
  flex-shrink: 0;
  width: 72px;
  min-height: 56px;
  padding: 0;
  border-radius: 12px;
  background: var(--color-primary);
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  transition: background 0.15s, opacity 0.15s;
}

.ok-btn:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.ok-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
