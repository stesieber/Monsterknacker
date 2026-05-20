<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import type { Profile } from '../types/index';
import { AVAILABLE_EMOJIS } from '../types/index';
import EmojiPicker from './EmojiPicker.vue';
import ConfirmDialog from './ConfirmDialog.vue';
import { useProfiles } from '../composables/useProfiles';

const props = defineProps<{
  mode: 'create' | 'edit';
  profile?: Profile;
}>();

const emit = defineEmits<{
  close: [];
}>();

const { createProfile, renameProfile, updateEmoji, deleteProfile } = useProfiles();

const name = ref(props.profile?.name ?? '');
const emoji = ref(props.profile?.emoji ?? AVAILABLE_EMOJIS[0]);
const nameError = ref('');
const showConfirmDelete = ref(false);

function validateName(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) return 'Name darf nicht leer sein.';
  if (trimmed.length > 20) return 'Name darf maximal 20 Zeichen lang sein.';
  return '';
}

function save() {
  nameError.value = validateName(name.value);
  if (nameError.value) return;

  if (props.mode === 'create') {
    createProfile(name.value, emoji.value);
  } else if (props.profile) {
    renameProfile(props.profile.id, name.value);
    updateEmoji(props.profile.id, emoji.value);
  }
  emit('close');
}

function onDeleteConfirm() {
  if (props.profile) {
    deleteProfile(props.profile.id);
  }
  emit('close');
}

function onOverlayClick(e: MouseEvent) {
  if (e.target === e.currentTarget) emit('close');
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close');
}

onMounted(() => document.addEventListener('keydown', onKeydown));
onUnmounted(() => document.removeEventListener('keydown', onKeydown));
</script>

<template>
  <div class="overlay" @click="onOverlayClick">
    <div class="dialog" role="dialog" aria-modal="true"
      :aria-label="mode === 'create' ? 'Neues Profil' : 'Profil bearbeiten'">
      <h2 class="dialog-title">
        {{ mode === 'create' ? 'Neues Profil' : 'Profil bearbeiten' }}
      </h2>

      <div class="field">
        <label class="field-label" for="profile-name">Name</label>
        <input
          id="profile-name"
          v-model="name"
          class="field-input"
          :class="{ error: nameError }"
          type="text"
          maxlength="20"
          placeholder="z.B. Lena"
          autocomplete="off"
          @input="nameError = ''"
        />
        <span v-if="nameError" class="field-error" role="alert">{{ nameError }}</span>
      </div>

      <div class="field">
        <label class="field-label">Emoji</label>
        <EmojiPicker v-model="emoji" />
      </div>

      <div class="dialog-actions">
        <button
          v-if="mode === 'edit'"
          class="btn btn-danger"
          type="button"
          @click="showConfirmDelete = true"
        >
          Löschen
        </button>
        <div class="spacer" />
        <button class="btn btn-ghost" type="button" @click="emit('close')">Abbrechen</button>
        <button class="btn btn-primary" type="button" @click="save">Speichern</button>
      </div>
    </div>
  </div>

  <ConfirmDialog
    v-if="showConfirmDelete && profile"
    title="Profil löschen?"
    :message="`Profil von ${profile.name} wirklich löschen? Alle Lernfortschritte gehen verloren.`"
    confirmText="Löschen"
    @confirm="onDeleteConfirm"
    @cancel="showConfirmDelete = false"
  />
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 16px;
}

.dialog {
  background: var(--color-surface);
  border-radius: var(--radius);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  padding: 28px 24px 24px;
  max-width: 440px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.dialog-title {
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 20px;
  color: var(--color-text);
}

.field {
  margin-bottom: 20px;
}

.field-label {
  display: block;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 6px;
  color: var(--color-text);
}

.field-input {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #e2e6f0;
  border-radius: 10px;
  font-size: 1rem;
  color: var(--color-text);
  background: var(--color-bg);
  outline: none;
  transition: border-color 0.15s;
  min-height: 44px;
}

.field-input:focus {
  border-color: var(--color-primary);
}

.field-input.error {
  border-color: var(--color-danger);
}

.field-error {
  display: block;
  color: var(--color-danger);
  font-size: 0.85rem;
  margin-top: 4px;
}

.dialog-actions {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 8px;
}

.spacer {
  flex: 1;
}

.btn {
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  min-height: 44px;
  white-space: nowrap;
}

.btn-ghost {
  background: var(--color-bg);
  color: var(--color-text);
}

.btn-ghost:hover {
  background: #e8eaf0;
}

.btn-primary {
  background: var(--color-primary);
  color: #fff;
}

.btn-primary:hover {
  background: var(--color-primary-dark);
}

.btn-danger {
  background: var(--color-danger);
  color: #fff;
}

.btn-danger:hover {
  background: #dc2626;
}
</style>
