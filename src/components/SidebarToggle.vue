<template>
  <div class="sidebar-toggle">
    <button 
      class="toggle-button"
      @click="toggleSidebar"
    >
      <span
        class="toggle-text"
        :class="{ 'active': isChapters }"
      >目录</span>
      <span class="divider">/</span>
      <span
        class="toggle-text"
        :class="{ 'active': !isChapters }"
      >片段</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  initialTab?: 'chapters' | 'fragments'
}>()

const emit = defineEmits(['toggle'])

const isChapters = ref(props.initialTab !== 'fragments')

const toggleSidebar = () => {
  isChapters.value = !isChapters.value
  emit('toggle', isChapters.value ? 'chapters' : 'fragments')
}
</script>

<style scoped>
.sidebar-toggle {
  @apply flex justify-center items-center;
  min-height: 40px;
  padding: 0.75rem 0.5rem;
  margin: 0.25rem 0.5rem;
}

.toggle-button {
  @apply flex items-center justify-center px-6 py-3 bg-white border border-gray-200 rounded-2xl cursor-pointer transition-all duration-200;
  min-width: 140px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04);
  transform: translateY(0);
  transition: all 0.2s ease;
  user-select: none;
  position: relative;
  overflow: hidden;
}

.toggle-button:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(147, 197, 253, 0.05));
  opacity: 0;
  transition: opacity 0.2s ease;
  border-radius: inherit;
}

.toggle-button:hover {
  @apply transform scale-105 shadow-xl;
  border-color: rgba(59, 130, 246, 0.2);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.08);
}

.toggle-button:hover:before {
  opacity: 1;
}

.toggle-text {
  @apply text-sm font-medium transition-all duration-200;
  letter-spacing: -0.01em;
  position: relative;
  z-index: 1;
}

.toggle-text.active {
  @apply text-blue-600 font-semibold scale-105;
  text-shadow: 0 1px 2px rgba(59, 130, 246, 0.1);
}

.divider {
  @apply mx-3 text-gray-300 font-medium text-lg relative;
  z-index: 1;
  opacity: 0.6;
  font-weight: 600;
}

.divider.active {
  @apply text-gray-400 opacity-80;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .toggle-button {
    min-width: 120px;
    padding: 8px 14px;
  }
  
  .toggle-text {
    font-size: 12px;
  }
  
  .divider {
    font-size: 14px;
    margin: 0 2px;
  }
}

@media (max-width: 640px) {
  .toggle-button {
    min-width: 110px;
    padding: 6px 10px;
  }
  
  .toggle-text {
    font-size: 11px;
  }
}
</style>