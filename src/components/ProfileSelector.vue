<script setup lang="ts">
import { ref } from 'vue';
import type { Profile } from '../types/index';
import { useProfiles } from '../composables/useProfiles';
import ProfileCard from './ProfileCard.vue';
import ProfileEditDialog from './ProfileEditDialog.vue';

const emit = defineEmits<{ profileSelected: [] }>();

const { profiles, selectProfile } = useProfiles();

const showDialog = ref(false);
const dialogMode = ref<'create' | 'edit'>('create');
const editingProfile = ref<Profile | undefined>(undefined);

function onProfileClick(id: string) {
  selectProfile(id);
  emit('profileSelected');
}

function openCreateDialog() {
  dialogMode.value = 'create';
  editingProfile.value = undefined;
  showDialog.value = true;
}

function openEditDialog(profile: Profile) {
  dialogMode.value = 'edit';
  editingProfile.value = profile;
  showDialog.value = true;
}

function closeDialog() {
  showDialog.value = false;
  editingProfile.value = undefined;
}
</script>

<template>
  <div class="selector">
    <header class="selector-header">
      <h1 class="selector-title">Wer übt heute?</h1>
    </header>

    <div class="profile-grid">
      <ProfileCard
        v-for="profile in profiles"
        :key="profile.id"
        :profile="profile"
        @click="onProfileClick(profile.id)"
        @edit="openEditDialog(profile)"
      />

      <button class="add-card" type="button" aria-label="Neues Profil anlegen" @click="openCreateDialog">
        <span class="add-icon" aria-hidden="true">+</span>
        <span class="add-label">Neues Profil</span>
      </button>
    </div>
  </div>

  <ProfileEditDialog
    v-if="showDialog"
    :mode="dialogMode"
    :profile="editingProfile"
    @close="closeDialog"
  />
</template>

<style scoped>
.selector {
  min-height: 100vh;
  padding: 32px 16px 40px;
  max-width: 900px;
  margin: 0 auto;
}

.selector-header {
  text-align: center;
  margin-bottom: 36px;
}

.selector-title {
  font-size: clamp(1.6rem, 5vw, 2.4rem);
  font-weight: 800;
  color: var(--color-text);
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(2, 140px);
  gap: 20px;
  justify-content: center;
}

@media (min-width: 600px) {
  .profile-grid {
    grid-template-columns: repeat(3, 140px);
  }
}

@media (min-width: 900px) {
  .profile-grid {
    grid-template-columns: repeat(4, 140px);
  }
}

.add-card {
  width: 140px;
  height: 140px;
  background: var(--color-surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  border: 2px dashed #c8cfe0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: border-color 0.15s, transform 0.15s;
  color: var(--color-text-muted);
}

.add-card:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  transform: translateY(-3px);
}

.add-icon {
  font-size: 2.4rem;
  line-height: 1;
  font-weight: 300;
}

.add-label {
  font-size: 0.85rem;
  font-weight: 600;
}
</style>
