<template>
  <header class="h-10 bg-white border-b border-gray-200 flex items-center flex-shrink-0">
    <!-- Logo and Menu -->
    <div class="flex items-center flex-1">
      <!-- Logo -->
      <h1 class="text-base font-semibold text-gray-900 ml-2">Fui</h1>
      
      <!-- Main Menu -->
      <nav class="flex ml-4">
        <!-- File Menu -->
        <div class="relative" @mouseenter="showFileMenu = true" @mouseleave="showFileMenu = false">
          <button
            class="text-sm text-gray-600 hover:text-gray-900 px-2 h-10 flex items-center"
            :class="{ 'bg-gray-100': showFileMenu }"
          >
            File
          </button>
          <div v-if="showFileMenu" class="absolute top-full left-0 bg-white border border-gray-200 rounded-md shadow-lg py-2 min-w-[160px] z-50">
            <button @click="$emit('open')" class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Open</button>
            <button @click="$emit('new-project')" class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">New</button>
            <button @click="$emit('save')" class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Save</button>
            <button @click="$emit('save-as')" class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Save As</button>
          </div>
        </div>

        <!-- Edit Menu -->
        <div class="relative" @mouseenter="showEditMenu = true" @mouseleave="showEditMenu = false">
          <button
            class="text-sm text-gray-600 hover:text-gray-900 px-2 h-10 flex items-center"
            :class="{ 'bg-gray-100': showEditMenu }"
          >
            Edit
          </button>
          <div v-if="showEditMenu" class="absolute top-full left-0 bg-white border border-gray-200 rounded-md shadow-lg py-2 min-w-[160px] z-50">
            <button @click="$emit('undo')" class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Undo</button>
            <button @click="$emit('redo')" class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Redo</button>
            <button @click="$emit('copy')" class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Copy</button>
            <button @click="$emit('paste')" class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Paste</button>
            <button @click="$emit('delete')" class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Delete</button>
          </div>
        </div>

        <!-- View Menu -->
        <div class="relative" @mouseenter="showViewMenu = true" @mouseleave="showViewMenu = false">
          <button
            class="text-sm text-gray-600 hover:text-gray-900 px-2 h-10 flex items-center"
            :class="{ 'bg-gray-100': showViewMenu }"
          >
            View
          </button>
          <div v-if="showViewMenu" class="absolute top-full left-0 bg-white border border-gray-200 rounded-md shadow-lg py-2 min-w-[160px] z-50">
            <button @click="$emit('toggle-panel', 'properties')" class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Properties Panel</button>
            <button @click="$emit('toggle-panel', 'layers')" class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Layers Panel</button>
            <button @click="$emit('toggle-panel', 'workspace')" class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Workspace Panel</button>
          </div>
        </div>

        <!-- Insert Menu -->
        <div class="relative" @mouseenter="showInsertMenu = true" @mouseleave="showInsertMenu = false">
          <button
            class="text-sm text-gray-600 hover:text-gray-900 px-2 h-10 flex items-center"
            :class="{ 'bg-gray-100': showInsertMenu }"
          >
            Insert
          </button>
          <div v-if="showInsertMenu" class="absolute top-full left-0 bg-white border border-gray-200 rounded-md shadow-lg py-2 min-w-[160px] z-50">
            <button @click="$emit('insert-text')" class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Text</button>
            <button @click="$emit('insert-rectangle')" class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Rectangle</button>
            <button @click="$emit('insert-circle')" class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Circle</button>
            <button @click="$emit('insert-line')" class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Line</button>
          </div>
        </div>

        <!-- Help Menu -->
        <div class="relative" @mouseenter="showHelpMenu = true" @mouseleave="showHelpMenu = false">
          <button
            class="text-sm text-gray-600 hover:text-gray-900 px-2 h-10 flex items-center"
            :class="{ 'bg-gray-100': showHelpMenu }"
          >
            Help
          </button>
          <div v-if="showHelpMenu" class="absolute top-full left-0 bg-white border border-gray-200 rounded-md shadow-lg py-2 min-w-[160px] z-50">
            <button @click="$emit('keyboard-shortcuts')" class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Keyboard Shortcuts</button>
            <button @click="$emit('documentation')" class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Documentation</button>
            <button @click="$emit('about')" class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">About</button>
          </div>
        </div>
      </nav>
    </div>

    <!-- Right Side Actions -->
    <div class="flex items-center h-10 pr-2">
      <button
        class="px-3 h-7 text-sm border border-gray-300 rounded hover:bg-gray-50 mr-2"
        @click="$emit('new-project')"
      >
        New Project
      </button>
      <button
        class="px-3 h-7 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
        @click="$emit('save')"
      >
        Save
      </button>
      <button
        class="px-3 h-7 text-sm border border-gray-300 rounded hover:bg-gray-50"
        @click="$emit('export')"
      >
        Export
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const showFileMenu = ref(false);
const showEditMenu = ref(false);
const showViewMenu = ref(false);
const showInsertMenu = ref(false);
const showHelpMenu = ref(false);
</script>

<style scoped>
.top-bar {
  height: 60px;
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.left-section h1 {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.center-section {
  display: flex;
  align-items: center;
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #f5f5f5;
  padding: 4px;
  border-radius: 4px;
}

.zoom-controls button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  border-radius: 4px;
  cursor: pointer;
  color: #666;
}

.zoom-controls button:hover {
  background-color: #e0e0e0;
}

.zoom-controls button svg {
  width: 20px;
  height: 20px;
}

.zoom-level {
  min-width: 60px;
  text-align: center;
  font-size: 14px;
  color: #666;
}

.right-section {
  display: flex;
  gap: 8px;
}

.right-section button {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  border-radius: 4px;
  cursor: pointer;
  color: #666;
}

.right-section button:hover:not(:disabled) {
  background-color: #f0f0f0;
}

.right-section button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.right-section button svg {
  width: 20px;
  height: 20px;
}

/* Menu hover effects */
nav button:hover {
  background-color: #f3f4f6;
}

/* Dropdown menus */
.absolute {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border-radius: 6px;
}

/* Menu items */
.absolute button {
  transition: background-color 0.15s ease;
}

.absolute button:hover {
  background-color: #f3f4f6;
}

/* Dividers in menus */
hr {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 4px 0;
}
</style>