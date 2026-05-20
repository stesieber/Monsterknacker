<script setup lang="ts">
import { AVAILABLE_EMOJIS } from '../types/index';

const props = defineProps<{ modelValue: string }>();
const emit = defineEmits<{ 'update:modelValue': [emoji: string] }>();
</script>

<template>
  <div class="emoji-picker" role="group" aria-label="Emoji wählen">
    <button
      v-for="emoji in AVAILABLE_EMOJIS"
      :key="emoji"
      type="button"
      class="emoji-btn"
      :class="{ selected: emoji === props.modelValue }"
      :aria-pressed="emoji === props.modelValue"
      @click="emit('update:modelValue', emoji)"
    >
      {{ emoji }}
    </button>
  </div>
</template>

<style scoped>
.emoji-picker {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
}

.emoji-btn {
  font-size: 1.75rem;
  line-height: 1;
  padding: 8px;
  border-radius: 10px;
  background: transparent;
  transition: background 0.15s, transform 0.1s;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.emoji-btn:hover {
  background: var(--color-bg);
  transform: scale(1.15);
}

.emoji-btn.selected {
  background: var(--color-primary);
  outline: 3px solid var(--color-primary-dark);
}
</style>
