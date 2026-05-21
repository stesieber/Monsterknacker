<script setup lang="ts">
const props = defineProps<{ modelValue: boolean; id?: string }>();
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();
</script>

<template>
  <button
    :id="id"
    class="toggle"
    :class="{ 'toggle--on': modelValue }"
    role="switch"
    :aria-checked="modelValue"
    type="button"
    @click="emit('update:modelValue', !props.modelValue)"
  >
    <span class="toggle-thumb" />
  </button>
</template>

<style scoped>
.toggle {
  display: inline-flex;
  align-items: center;
  width: 48px;
  height: 28px;
  border-radius: 14px;
  background: #d1d5db;
  padding: 3px;
  transition: background 0.2s;
  flex-shrink: 0;
}

.toggle--on {
  background: var(--color-primary);
}

.toggle-thumb {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.18);
  transition: transform 0.2s;
}

.toggle--on .toggle-thumb {
  transform: translateX(20px);
}
</style>
