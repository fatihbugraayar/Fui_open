<template>
  <div class="h-full flex flex-col bg-white">
    <!-- Header -->
    <div class="h-10 border-b border-gray-200 flex items-center px-3 flex-shrink-0">
      <h3 class="text-sm font-medium text-gray-900">Properties</h3>
    </div>
    
    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-3 space-y-4">
      <!-- No Selection State -->
      <div v-if="!selectedLayer" class="flex items-center justify-center h-20 text-xs text-gray-400">
        Select a layer to edit properties
      </div>
      
      <!-- Layer Properties -->
      <div v-else class="space-y-4">
        <!-- Layer Info -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">Layer Name</label>
          <input
            v-model="layerName"
            @blur="updateLayerName"
            class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        
        <!-- Position & Size -->
        <div class="space-y-2">
          <h4 class="text-xs font-medium text-gray-700">Position & Size</h4>
          
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-xs text-gray-500 mb-1">X</label>
              <input
                v-model.number="position.x"
                @input="updatePosition"
                type="number"
                class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">Y</label>
              <input
                v-model.number="position.y"
                @input="updatePosition"
                type="number"
                class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-xs text-gray-500 mb-1">Width</label>
              <input
                v-model.number="size.width"
                @input="updateSize"
                type="number"
                min="1"
                class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">Height</label>
              <input
                v-model.number="size.height"
                @input="updateSize"
                type="number"
                min="1"
                class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        
        <!-- Appearance -->
        <div class="space-y-2">
          <h4 class="text-xs font-medium text-gray-700">Appearance</h4>
          
          <!-- Fill Color -->
          <div>
            <label class="block text-xs text-gray-500 mb-1">Fill</label>
            <div class="flex items-center space-x-2">
              <input
                v-model="appearance.fill"
                @input="updateAppearance"
                type="color"
                class="w-8 h-6 border border-gray-300 rounded cursor-pointer"
              />
              <input
                v-model="appearance.fill"
                @input="updateAppearance"
                type="text"
                class="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <!-- Stroke Color -->
          <div>
            <label class="block text-xs text-gray-500 mb-1">Stroke</label>
            <div class="flex items-center space-x-2">
              <input
                v-model="appearance.stroke"
                @input="updateAppearance"
                type="color"
                class="w-8 h-6 border border-gray-300 rounded cursor-pointer"
              />
              <input
                v-model="appearance.stroke"
                @input="updateAppearance"
                type="text"
                class="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
            <!-- Stroke Width -->
          <div>
            <label class="block text-xs text-gray-500 mb-1">Stroke Width</label>
            <input
              v-model.number="appearance.strokeWidth"
              @input="updateAppearance"
              type="number"
              min="0"
              step="0.5"
              class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <!-- Opacity -->
          <div>
            <label class="block text-xs text-gray-500 mb-1">Opacity</label>
            <div class="flex items-center space-x-2">
              <input
                v-model.number="appearance.opacity"
                @input="updateAppearance"
                type="range"
                min="0"
                max="1"
                step="0.1"
                class="flex-1"
              />
              <span class="text-xs text-gray-500 w-8">{{ Math.round(appearance.opacity * 100) }}%</span>
            </div>
          </div>
        </div>
        
        <!-- Text Properties (only for text layers) -->
        <div v-if="selectedLayer.type === 'text'" class="space-y-2">
          <h4 class="text-xs font-medium text-gray-700">Text Properties</h4>
          
          <!-- Text Content -->
          <div>
            <label class="block text-xs text-gray-500 mb-1">Text</label>
            <textarea
              v-model="textProperties.text"
              @input="updateTextProperties"
              rows="3"
              class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              placeholder="Enter text..."
            />
          </div>
          
          <!-- Font Size -->
          <div>
            <label class="block text-xs text-gray-500 mb-1">Font Size</label>
            <input
              v-model.number="textProperties.fontSize"
              @input="updateTextProperties"
              type="number"
              min="8"
              max="200"
              class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <!-- Font Family -->
          <div>
            <label class="block text-xs text-gray-500 mb-1">Font Family</label>
            <select
              v-model="textProperties.fontFamily"
              @change="updateTextProperties"
              class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Georgia">Georgia</option>
              <option value="Verdana">Verdana</option>
              <option value="Comic Sans MS">Comic Sans MS</option>
              <option value="Impact">Impact</option>
              <option value="Courier New">Courier New</option>
            </select>
          </div>
          
          <!-- Font Style -->
          <div class="flex space-x-2">
            <button
              @click="toggleFontStyle('bold')"
              :class="[
                'px-2 py-1 text-xs border rounded',
                textProperties.fontStyle?.includes('bold') 
                  ? 'bg-blue-100 border-blue-300 text-blue-700' 
                  : 'border-gray-300 text-gray-700'
              ]"
            >
              <strong>B</strong>
            </button>
            <button
              @click="toggleFontStyle('italic')"
              :class="[
                'px-2 py-1 text-xs border rounded',
                textProperties.fontStyle?.includes('italic') 
                  ? 'bg-blue-100 border-blue-300 text-blue-700' 
                  : 'border-gray-300 text-gray-700'
              ]"
            >
              <em>I</em>
            </button>
          </div>
          
          <!-- Text Align -->
          <div>
            <label class="block text-xs text-gray-500 mb-1">Text Align</label>
            <div class="flex space-x-1">
              <button
                v-for="align in ['left', 'center', 'right']"
                :key="align"
                @click="textProperties.align = align; updateTextProperties()"
                :class="[
                  'px-2 py-1 text-xs border rounded flex-1',
                  textProperties.align === align 
                    ? 'bg-blue-100 border-blue-300 text-blue-700' 
                    : 'border-gray-300 text-gray-700'
                ]"
              >
                {{ align }}
              </button>
            </div>
          </div>
        </div>
        
        <!-- Line Properties (only for line/pen layers) -->
        <div v-if="selectedLayer.type === 'line'" class="space-y-2">
          <h4 class="text-xs font-medium text-gray-700">Line Properties</h4>
          
          <!-- Line Style -->
          <div>
            <label class="block text-xs text-gray-500 mb-1">Line Style</label>
            <select
              v-model="lineProperties.lineCap"
              @change="updateLineProperties"
              class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="butt">Butt</option>
              <option value="round">Round</option>
              <option value="square">Square</option>
            </select>
          </div>
          
          <!-- Line Join -->
          <div>
            <label class="block text-xs text-gray-500 mb-1">Line Join</label>
            <select
              v-model="lineProperties.lineJoin"
              @change="updateLineProperties"
              class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="miter">Miter</option>
              <option value="round">Round</option>
              <option value="bevel">Bevel</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useProjectStore } from '../stores/project'

const projectStore = useProjectStore()

// Computed properties
const selectedLayer = computed(() => projectStore.selectedLayerData)

// Reactive properties
const layerName = ref('')
const position = ref({ x: 0, y: 0 })
const size = ref({ width: 0, height: 0 })
const appearance = ref({
  fill: '#ffffff',
  stroke: '#000000',
  strokeWidth: 1,
  opacity: 1
})

// Text properties
const textProperties = ref({
  text: '',
  fontSize: 16,
  fontFamily: 'Arial',
  fontStyle: '',
  align: 'left'
})

// Line properties
const lineProperties = ref({
  lineCap: 'round',
  lineJoin: 'round'
})

// Watch for selected layer changes
watch(selectedLayer, (newLayer) => {
  if (newLayer) {
    layerName.value = newLayer.name || ''
    position.value = { x: newLayer.x || 0, y: newLayer.y || 0 }
    size.value = { width: newLayer.width || 0, height: newLayer.height || 0 }
    
    appearance.value = {
      fill: newLayer.properties?.fill || '#ffffff',
      stroke: newLayer.properties?.stroke || '#000000',
      strokeWidth: newLayer.properties?.strokeWidth || 1,
      opacity: newLayer.properties?.opacity || 1
    }
    
    // Text properties
    if (newLayer.type === 'text') {
      textProperties.value = {
        text: newLayer.properties?.text || '',
        fontSize: newLayer.properties?.fontSize || 16,
        fontFamily: newLayer.properties?.fontFamily || 'Arial',
        fontStyle: newLayer.properties?.fontStyle || '',
        align: newLayer.properties?.align || 'left'
      }
    }
    
    // Line properties
    if (newLayer.type === 'line') {
      lineProperties.value = {
        lineCap: newLayer.properties?.lineCap || 'round',
        lineJoin: newLayer.properties?.lineJoin || 'round'
      }
    }
  }
}, { immediate: true })

// Update methods
function updateLayerName() {
  if (selectedLayer.value) {
    projectStore.updateLayer(selectedLayer.value.id, {
      name: layerName.value
    })
  }
}

function updatePosition() {
  if (selectedLayer.value) {
    projectStore.updateLayer(selectedLayer.value.id, {
      x: position.value.x,
      y: position.value.y
    })
  }
}

function updateSize() {
  if (selectedLayer.value) {
    projectStore.updateLayer(selectedLayer.value.id, {
      width: size.value.width,
      height: size.value.height
    })
  }
}

function updateAppearance() {
  if (selectedLayer.value) {
    projectStore.updateLayer(selectedLayer.value.id, {
      properties: {
        ...selectedLayer.value.properties,
        fill: appearance.value.fill,
        stroke: appearance.value.stroke,
        strokeWidth: appearance.value.strokeWidth,
        opacity: appearance.value.opacity
      }
    })
  }
}

function updateTextProperties() {
  if (selectedLayer.value && selectedLayer.value.type === 'text') {
    projectStore.updateLayer(selectedLayer.value.id, {
      properties: {
        ...selectedLayer.value.properties,
        text: textProperties.value.text,
        fontSize: textProperties.value.fontSize,
        fontFamily: textProperties.value.fontFamily,
        fontStyle: textProperties.value.fontStyle,
        align: textProperties.value.align
      }
    })
  }
}

function updateLineProperties() {
  if (selectedLayer.value && selectedLayer.value.type === 'line') {
    projectStore.updateLayer(selectedLayer.value.id, {
      properties: {
        ...selectedLayer.value.properties,
        lineCap: lineProperties.value.lineCap,
        lineJoin: lineProperties.value.lineJoin
      }
    })
  }
}

function toggleFontStyle(style: 'bold' | 'italic') {
  const currentStyles = textProperties.value.fontStyle.split(' ').filter(s => s)
  
  if (currentStyles.includes(style)) {
    textProperties.value.fontStyle = currentStyles.filter(s => s !== style).join(' ')
  } else {
    textProperties.value.fontStyle = [...currentStyles, style].join(' ')
  }
  
  updateTextProperties()
}
</script>

<style scoped>
/* Custom color input styling */
input[type="color"] {
  -webkit-appearance: none;
  border: none;
  padding: 0;
}

input[type="color"]::-webkit-color-swatch-wrapper {
  padding: 0;
}

input[type="color"]::-webkit-color-swatch {
  border: 1px solid #d1d5db;
  border-radius: 4px;
}
</style>