<!--
  RightPanelTabs Component - Simplified Canvas System
  
  Workspace sistemi kaldırıldı, sadece layers, properties, edit ve insert tabları kaldı.
  Bu basitleştirme kullanıcı arayüzünü daha temiz ve anlaşılır hale getirir.
-->

<template>
  <div class="h-full flex flex-col bg-white">
    <!-- Tab Header -->
    <div class="flex border-b border-gray-200 bg-gray-50">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="[
          'px-3 py-2 text-xs font-medium transition-colors flex-1',
          activeTab === tab.id
            ? 'text-blue-600 bg-white border-b-2 border-blue-600'
            : 'text-gray-600 hover:bg-gray-100'
        ]"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab Content -->
    <div class="tab-content flex-1 overflow-hidden">
      <!-- Layers Tab -->
      <div v-if="activeTab === 'layers'" class="h-full overflow-y-auto">
        <div v-if="projectStore.hasProject && projectStore.canvas" class="flex flex-col h-full">
          <!-- Layers Header -->
          <div class="flex items-center px-3 py-1 text-xs text-gray-500 border-b border-gray-200 bg-gray-50">
            <span>Layers ({{ projectStore.canvas.layers.length }})</span>
            <button
              @click="addNewLayer"
              class="ml-auto p-1 hover:bg-gray-200 rounded transition-colors"
              title="Add Layer"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
            </button>
          </div>
          
          <!-- Layer List -->
          <div class="flex-1 overflow-y-auto">
            <div
              v-for="layer in projectStore.currentLayers"
              :key="layer.id"
              :class="[
                'flex items-center px-3 py-2 text-xs border-b border-gray-200 cursor-pointer transition-colors group',
                layer.id === projectStore.selectedLayer ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
              ]"
              @click="selectLayer(layer.id)"
              @dblclick="selectLayerAndShowProperties(layer.id)"
            >
              <!-- Layer Type Icon -->
              <svg v-if="layer.type === 'text'" class="w-3 h-3 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7V4h16v3M8 20h8M12 4v16"/>
              </svg>
              <svg v-else-if="layer.type === 'rectangle'" class="w-3 h-3 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke-width="2"/>
              </svg>
              <svg v-else-if="layer.type === 'circle'" class="w-3 h-3 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" stroke-width="2"/>
              </svg>
              <svg v-else-if="layer.type === 'line'" class="w-3 h-3 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <line x1="4" y1="20" x2="20" y2="4" stroke-width="2"/>
              </svg>
              <svg v-else class="w-3 h-3 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"/>
              </svg>

              <!-- Layer Name -->
              <span class="flex-1 truncate">{{ layer.name || layer.type }}</span>

              <!-- Visibility Toggle -->
              <button
                @click.stop="toggleLayerVisibility(layer.id)"
                class="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded transition-all"
                :title="layer.visible === false ? 'Show Layer' : 'Hide Layer'"
              >
                <svg v-if="layer.visible !== false" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                <svg v-else class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/>
                </svg>
              </button>

              <!-- Delete Button -->
              <button
                @click.stop="deleteLayer(layer.id)"
                class="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 text-red-600 rounded transition-all"
                title="Delete Layer"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- No Project State -->
        <div v-else class="flex items-center justify-center h-20 text-xs text-gray-400">
          No project loaded
        </div>
      </div>

      <!-- Properties Tab -->
      <div v-else-if="activeTab === 'properties'" class="h-full overflow-y-auto">
        <div class="p-3 space-y-4">
          <!-- No Selection State -->
          <div v-if="!projectStore.selectedLayerData" class="flex items-center justify-center h-20 text-xs text-gray-400">
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
                    v-model.number="layerX"
                    @input="updateLayerPosition"
                    type="number"
                    class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-500 mb-1">Y</label>
                  <input
                    v-model.number="layerY"
                    @input="updateLayerPosition"
                    type="number"
                    class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-xs text-gray-500 mb-1">Width</label>
                  <input
                    v-model.number="layerWidth"
                    @input="updateLayerSize"
                    type="number"
                    min="1"
                    class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-500 mb-1">Height</label>
                  <input
                    v-model.number="layerHeight"
                    @input="updateLayerSize"
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
                    v-model="layerFill"
                    @input="updateLayerAppearance"
                    type="color"
                    class="w-8 h-6 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    v-model="layerFill"
                    @input="updateLayerAppearance"
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
                    v-model="layerStroke"
                    @input="updateLayerAppearance"
                    type="color"
                    class="w-8 h-6 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    v-model="layerStroke"
                    @input="updateLayerAppearance"
                    type="text"
                    class="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <!-- Stroke Width -->
              <div>
                <label class="block text-xs text-gray-500 mb-1">Stroke Width</label>
                <input
                  v-model.number="layerStrokeWidth"
                  @input="updateLayerAppearance"
                  type="number"
                  min="0"
                  class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              
              <!-- Opacity -->
              <div>
                <label class="block text-xs text-gray-500 mb-1">Opacity</label>
                <input 
                  v-model.number="layerOpacity"
                  @input="updateLayerAppearance"
                  type="range"
                  class="w-full"
                  min="0"
                  max="100"
                  step="1"
                />
                <div class="text-right text-xs text-gray-500">{{ layerOpacity }}%</div>
              </div>
            </div>

            <!-- Text Properties (only for text layers) -->
            <div v-if="projectStore.selectedLayerData.type === 'text'" class="space-y-2">
              <h4 class="text-xs font-medium text-gray-700">Text</h4>
              
              <!-- Text Content -->
              <div>
                <label class="block text-xs text-gray-500 mb-1">Content</label>
                <textarea
                  v-model="layerTextContent"
                  @input="updateLayerText"
                  class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows="3"
                ></textarea>
              </div>
              
              <!-- Font -->
              <div>
                <label class="block text-xs text-gray-500 mb-1">Font</label>
                <select 
                  v-model="layerFontFamily"
                  @change="updateLayerText"
                  class="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                >
                  <option value="Arial">Arial</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Verdana">Verdana</option>
                </select>
              </div>
              
              <!-- Font Size -->
              <div>
                <label class="block text-xs text-gray-500 mb-1">Font Size</label>
                <input
                  v-model.number="layerFontSize"
                  @input="updateLayerText"
                  type="number"
                  min="8"
                  max="72"
                  class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Tab -->
      <div v-else-if="activeTab === 'edit'" class="h-full overflow-y-auto">
        <div class="p-4">
          <h3 class="text-sm font-medium text-gray-700 mb-3">Edit Tools</h3>
          <div class="space-y-2">
            <button
              v-for="tool in editTools"
              :key="tool.id"
              @click="selectTool(tool.id)"
              class="w-full px-3 py-2 text-sm text-left border border-gray-300 rounded hover:bg-gray-50"
            >
              {{ tool.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- Insert Tab -->
      <div v-else-if="activeTab === 'insert'" class="h-full overflow-y-auto">
        <div class="p-4">
          <h3 class="text-sm font-medium text-gray-700 mb-3">Insert Tools</h3>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="tool in insertTools"
              :key="tool.id"
              @click="startUsingTool(tool.id)"
              class="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
            >
              {{ tool.label }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * RightPanelTabs Component - Simplified Implementation
 * 
 * Workspace sistemi kaldırıldı, basitleştirilmiş tab sistemi kullanılıyor.
 * Sadece layers, properties, edit ve insert tabları mevcut.
 */

import { ref, computed, watch } from 'vue'
import { useProjectStore } from '../stores/project'
import { useHistoryStore } from '../stores/history'

// Stores
const projectStore = useProjectStore()
const historyStore = useHistoryStore()

// Tab Configuration
const tabs = [
  { id: 'layers', label: 'Layers' },
  { id: 'properties', label: 'Properties' },
  { id: 'edit', label: 'Edit' },
  { id: 'insert', label: 'Insert' }
]

const activeTab = ref('layers')

// Layer properties reactive state
const layerName = ref('')
const layerX = ref(0)
const layerY = ref(0)
const layerWidth = ref(0)
const layerHeight = ref(0)
const layerFill = ref('#FFFFFF')
const layerStroke = ref('#000000')
const layerStrokeWidth = ref(1)
const layerOpacity = ref(100)

// Text properties
const layerTextContent = ref('')
const layerFontFamily = ref('Arial')
const layerFontSize = ref(16)

// Tools configuration
const editTools = [
  { id: 'copy', label: 'Copy' },
  { id: 'paste', label: 'Paste' },
  { id: 'duplicate', label: 'Duplicate' },
  { id: 'group', label: 'Group' },
  { id: 'ungroup', label: 'Ungroup' },
  { id: 'align-left', label: 'Align Left' },
  { id: 'align-center', label: 'Align Center' },
  { id: 'align-right', label: 'Align Right' }
]

const insertTools = [
  { id: 'rectangle', label: 'Rectangle' },
  { id: 'circle', label: 'Circle' },
  { id: 'line', label: 'Line' },
  { id: 'text', label: 'Text' },
  { id: 'image', label: 'Image' }
]

// Watch for selected layer changes
watch(() => projectStore.selectedLayerData, (newData) => {
  if (newData) {
    layerName.value = newData.name || ''
    layerX.value = newData.x || 0
    layerY.value = newData.y || 0
    layerWidth.value = newData.width || 0
    layerHeight.value = newData.height || 0
    layerFill.value = newData.properties?.fill || '#FFFFFF'
    layerStroke.value = newData.properties?.stroke || '#000000'
    layerStrokeWidth.value = newData.properties?.strokeWidth || 1
    layerOpacity.value = newData.properties?.opacity ? Math.round(newData.properties.opacity * 100) : 100
    
    if (newData.type === 'text') {
      layerFontFamily.value = newData.properties?.fontFamily || 'Arial'
      layerFontSize.value = newData.properties?.fontSize || 16
      layerTextContent.value = newData.properties?.text || ''
    }
  }
}, { immediate: true })

// Layer management functions
function addNewLayer(): void {
  const layer = {
    type: 'rectangle',
    x: 50,
    y: 50,
    width: 100,
    height: 100,
    properties: {
      fill: '#3b82f6',
      stroke: '#1e40af',
      strokeWidth: 1
    }
  }
  
  const newLayer = projectStore.addLayer(layer)
  if (newLayer) {
    projectStore.selectLayer(newLayer.id)
  }
}

function selectLayer(id: string): void {
  projectStore.selectLayer(id)
}

function selectLayerAndShowProperties(id: string): void {
  projectStore.selectLayer(id)
  activeTab.value = 'properties'
}

function toggleLayerVisibility(id: string): void {
  projectStore.toggleLayerVisibility(id)
}

function deleteLayer(id: string): void {
  if (confirm('Are you sure you want to delete this layer?')) {
    projectStore.deleteLayer(id)
  }
}

// Update layer properties functions
function updateLayerName(): void {
  if (!projectStore.selectedLayer) return
  
  projectStore.updateLayer(projectStore.selectedLayer, {
    name: layerName.value
  })
}

function updateLayerPosition(): void {
  if (!projectStore.selectedLayer) return
  
  projectStore.updateLayer(projectStore.selectedLayer, {
    x: layerX.value,
    y: layerY.value
  })
}

function updateLayerSize(): void {
  if (!projectStore.selectedLayer) return
  
  projectStore.updateLayer(projectStore.selectedLayer, {
    width: layerWidth.value,
    height: layerHeight.value
  })
}

function updateLayerAppearance(): void {
  if (!projectStore.selectedLayer) return
  
  projectStore.updateLayer(projectStore.selectedLayer, {
    properties: {
      ...projectStore.selectedLayerData?.properties,
      fill: layerFill.value,
      stroke: layerStroke.value,
      strokeWidth: layerStrokeWidth.value,
      opacity: layerOpacity.value / 100
    }
  })
}

function updateLayerText(): void {
  if (!projectStore.selectedLayer) return
  
  projectStore.updateLayer(projectStore.selectedLayer, {
    properties: {
      ...projectStore.selectedLayerData?.properties,
      text: layerTextContent.value,
      fontFamily: layerFontFamily.value,
      fontSize: layerFontSize.value
    }
  })
}

// Tool functions
function selectTool(toolId: string): void {
  console.log('Edit tool selected:', toolId)
  // Implement edit tool functionality
}

function startUsingTool(toolId: string): void {
  console.log('Insert tool selected:', toolId)
  // Emit tool change to parent
  // This would typically emit to the parent component
}
</script>

<style scoped>
.tab-content {
  background-color: #ffffff;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
