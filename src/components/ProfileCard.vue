<script setup lang="ts">
import type { Profile } from '../types/index';

defineProps<{
  profile: Profile;
}>();

const emit = defineEmits<{
  click: [];
  edit: [];
}>();
</script>

<template>
  <div class="profile-card" @click="emit('click')" role="button" tabindex="0"
    @keydown.enter="emit('click')" @keydown.space.prevent="emit('click')">
    <button
      class="edit-btn"
      type="button"
      aria-label="Profil bearbeiten"
      @click.stop="emit('edit')"
    >
      ✎
    </button>
    <span class="profile-emoji" aria-hidden="true">{{ profile.emoji }}</span>
    <span class="profile-name">{{ profile.name }}</span>
  </div>
</template>

<style scoped>
.profile-card {
  position: relative;
  width: 140px;
  height: 140px;
  background: var(--color-surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  user-select: none;
}

.profile-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
}

.profile-card:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

.profile-emoji {
  font-size: 3rem;
  line-height: 1;
}

.profile-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text);
  text-align: center;
  padding: 0 8px;
  word-break: break-word;
}

.edit-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: var(--color-bg);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  transition: background 0.15s, color 0.15s;
  min-width: 44px;
  min-height: 44px;
  width: 44px;
  height: 44px;
  top: -4px;
  right: -4px;
}

.edit-btn:hover {
  background: var(--color-primary);
  color: #fff;
}
</style>
