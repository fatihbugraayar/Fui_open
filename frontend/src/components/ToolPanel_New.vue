<!--
  ToolPanel Component - Modern Redesign
  
  Yeni tasarım ile modern ve kullanışlı bir araç paneli.
  Floating design ile canvas alanını engellemiyor.
-->

<template>  <div class="w-16 h-full bg-white border-r border-gray-200 p-2 flex flex-col">
    <!-- Tool Groups -->
    <div class="space-y-2">
      <!-- Selection Tools -->
      <div class="tool-group">
        <div class="text-xs text-gray-500 mb-1">Selection</div>
        <div class="flex flex-col space-y-1">
          <button
            v-for="tool in selectionTools"
            :key="tool.id"
            @click="selectTool(tool.id)"
            :class="[
              'w-12 h-8 p-1 rounded flex items-center justify-center transition-all duration-200',
              activeTool === tool.id 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            ]"
            :title="tool.label"
          >            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="tool.icon" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Shape Tools -->
      <div class="tool-group">
        <div class="text-xs text-gray-500 mb-1">Shapes</div>
        <div class="flex flex-col space-y-1">
          <button
            v-for="tool in shapeTools"
            :key="tool.id"
            @click="selectTool(tool.id)"
            :class="[
              'w-12 h-8 p-1 rounded flex items-center justify-center transition-all duration-200',
              activeTool === tool.id 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            ]"
            :title="tool.label"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="tool.icon" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Draw Tools -->
      <div class="tool-group">
        <div class="text-xs text-gray-500 mb-1">Draw</div>
        <div class="flex flex-col space-y-1">
          <button
            v-for="tool in drawTools"
            :key="tool.id"
            @click="selectTool(tool.id)"
            :class="[
              'w-12 h-8 p-1 rounded flex items-center justify-center transition-all duration-200',
              activeTool === tool.id 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            ]"
            :title="tool.label"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="tool.icon" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Utility Tools -->
      <div class="tool-group">
        <div class="text-xs text-gray-500 mb-1">Utilities</div>
        <div class="flex flex-col space-y-1">
          <button
            v-for="tool in utilityTools"
            :key="tool.id"
            @click="selectTool(tool.id)"
            :class="[
              'w-12 h-8 p-1 rounded flex items-center justify-center transition-all duration-200',
              activeTool === tool.id 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            ]"
            :title="tool.label"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="tool.icon" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Separator -->
    <div class="border-t border-gray-200 my-2"></div>

    <!-- Color Controls -->
    <div class="space-y-2">
      <div class="text-xs text-gray-500">Colors</div>
      
      <!-- Fill Color -->
      <div class="flex flex-col space-y-1">
        <label class="text-xs text-gray-600">Fill</label>
        <input
          v-model="fillColor"
          @input="updateFillColor"
          type="color"
          class="w-12 h-6 border border-gray-300 rounded cursor-pointer"
        />
      </div>
      
      <!-- Stroke Color -->
      <div class="flex flex-col space-y-1">
        <label class="text-xs text-gray-600">Stroke</label>
        <input
          v-model="strokeColor"
          @input="updateStrokeColor"
          type="color"
          class="w-12 h-6 border border-gray-300 rounded cursor-pointer"
        />
      </div>
    </div>

    <!-- Flex spacer to push properties to bottom if needed -->
    <div class="flex-1"></div>

    <!-- Properties (simplified for narrow layout) -->
    <div class="space-y-2 mt-2">      
      <!-- Stroke Width -->
      <div class="flex flex-col space-y-1">
        <label class="text-xs text-gray-600">Width</label>
        <input
          v-model.number="strokeWidth"
          @input="updateStrokeWidth"
          type="range"
          min="0"
          max="20"
          step="1"
          class="w-full"
        />
        <span class="text-xs text-gray-500 text-center">{{ strokeWidth }}</span>
      </div>
      
      <!-- Opacity -->
      <div class="flex flex-col space-y-1">
        <label class="text-xs text-gray-600">Opacity</label>
        <input
          v-model.number="opacity"
          @input="updateOpacity"
          type="range"
          min="0"
          max="100"
          step="1"
          class="w-full"
        />
        <span class="text-xs text-gray-500 text-center">{{ opacity }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * ToolPanel Component - Modern Redesign
 * 
 * Yeni floating design ile modern ve kullanışlı araç paneli.
 * Canvas alanını engellemez, daha iyi kullanıcı deneyimi sağlar.
 */

import { ref, watch } from 'vue'

// Props
const props = defineProps<{
  activeTool: string
  strokeColor: string
  fillColor: string
  strokeWidth: number
  opacity: number
}>()

// Emits
const emit = defineEmits<{
  'tool-change': [tool: string]
  'stroke-color-change': [color: string]
  'fill-color-change': [color: string]
  'stroke-width-change': [width: number]
  'opacity-change': [opacity: number]
}>()

// Local state
const strokeColor = ref(props.strokeColor)
const fillColor = ref(props.fillColor)
const strokeWidth = ref(props.strokeWidth)
const opacity = ref(props.opacity)

// Tool definitions
const selectionTools = [
  {
    id: 'select',
    label: 'Select',
    icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'
  },
  {
    id: 'move',
    label: 'Move',
    icon: 'M13 5l7 7-7 7M5 5l7 7-7 7'
  }
]

const shapeTools = [
  {
    id: 'rectangle',
    label: 'Rectangle',
    icon: 'M3 3h18v18H3z'
  },
  {
    id: 'circle',
    label: 'Circle',
    icon: 'M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  {
    id: 'line',
    label: 'Line',
    icon: 'm3 21 18-18'
  },
  {
    id: 'polygon',
    label: 'Polygon',
    icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'
  }
]

const drawTools = [
  {
    id: 'pen',
    label: 'Pen Tool',
    icon: 'M12 19l7-7 3 3-7 7-3-3z'
  },
  {
    id: 'brush',
    label: 'Brush',
    icon: 'M9.06 9.06c.39.39 1.02.39 1.41 0L12 7.53l1.53 1.53c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 6.12a.996.996 0 00-1.41 0L10.47 7.65c-.39.39-.39 1.02 0 1.41z'
  },
  {
    id: 'text',
    label: 'Text',
    icon: 'M4 7V4h16v3M8 20h8M12 4v16'
  }
]

const utilityTools = [
  {
    id: 'eyedropper',
    label: 'Eyedropper',
    icon: 'M20 16v4a2 2 0 01-2 2h-4M4 8V4a2 2 0 012-2h4M8 16l-4-4 2-2 4 4-2 2zM16 8l4-4-2-2-4 4 2 2z'
  },
  {
    id: 'zoom',
    label: 'Zoom',
    icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
  },
  {
    id: 'measure',
    label: 'Measure',
    icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z'
  }
]

// Methods
function selectTool(toolId: string): void {
  emit('tool-change', toolId)
}

function updateStrokeColor(): void {
  emit('stroke-color-change', strokeColor.value)
}

function updateFillColor(): void {
  emit('fill-color-change', fillColor.value)
}

function updateStrokeWidth(): void {
  emit('stroke-width-change', strokeWidth.value)
}

function updateOpacity(): void {
  emit('opacity-change', opacity.value)
}

// Watch for prop changes
watch(() => props.strokeColor, (newValue) => {
  strokeColor.value = newValue
})

watch(() => props.fillColor, (newValue) => {
  fillColor.value = newValue
})

watch(() => props.strokeWidth, (newValue) => {
  strokeWidth.value = newValue
})

watch(() => props.opacity, (newValue) => {
  opacity.value = newValue
})
</script>

<style scoped>
.tool-group {
  position: relative;
}

/* Custom range slider styling */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  outline: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: #3b82f6;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.2s ease;
}

input[type="range"]::-webkit-slider-thumb:hover {
  background: #2563eb;
}

input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #3b82f6;
  border-radius: 50%;
  cursor: pointer;
  border: none;
  transition: background 0.2s ease;
}

input[type="range"]::-moz-range-thumb:hover {
  background: #2563eb;
}

/* Color input styling */
input[type="color"] {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background: none;
  border: 0;
  cursor: pointer;
}

input[type="color"]::-webkit-color-swatch-wrapper {
  padding: 0;
  border: 1px solid #d1d5db;
  border-radius: 4px;
}

input[type="color"]::-webkit-color-swatch {
  border: none;
  border-radius: 3px;
}
</style>
