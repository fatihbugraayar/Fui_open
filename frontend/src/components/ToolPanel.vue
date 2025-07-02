<template>
  <div class="w-16 h-full p-2 flex flex-col items-center space-y-2 relative">
    <div
      v-for="(group, groupName) in toolGroups"
      :key="groupName"
      class="relative w-full"
      @mouseenter="showDropdown(groupName, $event)"
      @mouseleave="hideDropdown"
    >
      <button
        @click="handleMainIconClick(group.tools[selectedToolInGroup[groupName]].name, groupName)"
        :title="selectedToolInGroup[groupName].charAt(0).toUpperCase() + selectedToolInGroup[groupName].slice(1)"
        :class="['w-12 h-12 p-2 rounded-md flex justify-center items-center transition-colors duration-150', activeTool === selectedToolInGroup[groupName] ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-200']"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" v-html="group.tools[selectedToolInGroup[groupName]].icon"></svg>
      </button>
    </div>

    <!-- Dropdown positioned absolutely outside of parent container -->
    <div
      v-if="activeDropdown"
      class="fixed bg-white rounded-md shadow-lg border border-gray-200 p-2 z-[10000] min-w-[180px]"
      :style="dropdownStyle"
      @mouseenter="keepDropdownOpen = true"
      @mouseleave="hideDropdown"
    >
      <button
        v-for="tool in toolGroups[activeDropdown].tools"
        :key="tool.name"
        @click="setActiveTool(tool.name, activeDropdown)"
        :title="tool.name.charAt(0).toUpperCase() + tool.name.slice(1)"
        :class="['flex items-center w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors duration-150', activeTool === tool.name ? 'bg-blue-100 text-blue-600 font-medium' : '']"
      >
        <svg class="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" v-html="tool.icon"></svg>
        {{ tool.name.charAt(0).toUpperCase() + tool.name.slice(1) }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';

const emit = defineEmits<{'tool-change': [toolName: string]}>();

interface Tool {
  name: string;
  icon: string; // SVG path data
}

interface ToolGroupCollection {
  [toolName: string]: Tool;
}

interface ToolStructure {
  [groupName: string]: {
    defaultTool: string;
    tools: ToolGroupCollection;
  };
}

const activeDropdown = ref<string | null>(null);
const dropdownStyle = ref({});
const keepDropdownOpen = ref(false);

const toolGroups = reactive<ToolStructure>({
  selection: {
    defaultTool: 'select',
    tools: {
      select: { name: 'select', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3l7.07 16.97 2.51-7.39L20 10.07 3 3z"/>' },
    },
  },
  shapes: {
    defaultTool: 'rectangle',
    tools: {
      rectangle: { name: 'rectangle', icon: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke-width="2"/>' },
      circle: { name: 'circle', icon: '<circle cx="12" cy="12" r="9" stroke-width="2"/>' },
      polygon: { name: 'polygon', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 7l10 5M12 17v-5"/>' },
      star: { name: 'star', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>' },
    },
  },
  drawing: {
    defaultTool: 'pen',
    tools: {
      line: { name: 'line', icon: '<line x1="4" y1="20" x2="20" y2="4" stroke-width="2"/>' },
      pen: { name: 'pen', icon: '<path d="M12 20.879l-1.78-1.781L2.835 11.716a2.519 2.519 0 010-3.562l7.071-7.071a2.519 2.519 0 013.562 0l7.383 7.383-1.781 1.78-7.273-7.272-6.364 6.364 7.273 7.272zM7.95 15.536l.707-.707M16.97 6.506l.707-.707"/>' },
      pencil: { name: 'pencil', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>' },
    },
  },
  media: {
    defaultTool: 'text',
    tools: {
      text: { name: 'text', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7V4h16v3M8 20h8M12 4v16"/>' },
      image: { name: 'image', icon: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke-width="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>' },
    },
  },
  utilities: {
    defaultTool: 'eyedropper',
    tools: {
      eyedropper: { name: 'eyedropper', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.057A7.5 7.5 0 007.5 3C3.358 3 0 6.358 0 10.5S3.358 18 7.5 18c1.55 0 2.98-.468 4.192-1.26L17.5 12.5l-2.5-2.5-4-4zM7.5 13a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/>' },
      eraser: { name: 'eraser', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 17.657L13.414 22H4a1 1 0 01-1-1v-9.414l4.343-4.343a2 2 0 012.828 0l7.071 7.071a2 2 0 010 2.828zM9.586 7.586L12 10m-2.414-2.414L12 5.172"/>' },
      zoom: { name: 'zoom', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/>' }, // Zoom aracı eklendi
    },
  },
});

const selectedToolInGroup = reactive<{[key: string]: string}>({});
for (const groupName in toolGroups) {
  selectedToolInGroup[groupName] = toolGroups[groupName].defaultTool;
}

const activeTool = ref(toolGroups.selection.tools[toolGroups.selection.defaultTool].name);
emit('tool-change', activeTool.value); // Emit initial tool

function setActiveTool(toolName: string, groupName: string) {
  selectedToolInGroup[groupName] = toolName;
  activeTool.value = toolName;
  emit('tool-change', toolName);
}

function handleMainIconClick(toolName: string, groupName: string) {
  // If the clicked main icon already represents the active tool, do nothing.
  // Otherwise, set it as the active tool.
  if (activeTool.value !== toolName) {
    setActiveTool(toolName, groupName);
  }
  // This function could also be used to toggle a click-based dropdown if hover wasn't desired.
}

function showDropdown(groupName: string, event: MouseEvent) {
  const button = event.currentTarget as HTMLElement;
  const rect = button.getBoundingClientRect();

  activeDropdown.value = groupName;
  dropdownStyle.value = {
    left: `${rect.right + 8}px`,
    top: `${rect.top}px`
  };
}

function hideDropdown() {
  setTimeout(() => {
    if (!keepDropdownOpen.value) {
      activeDropdown.value = null;
    }
    keepDropdownOpen.value = false;
  }, 100);
}
</script>