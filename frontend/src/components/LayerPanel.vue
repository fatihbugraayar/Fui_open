<template>
  <div class="h-full flex flex-col bg-white">
    <!-- Header -->
    <div class="h-10 border-b border-gray-200 flex items-center px-3 flex-shrink-0">
      <h3 class="text-sm font-medium text-gray-900">Layers</h3>
    </div>
    
    <!-- Scrollable Layer List -->
    <div class="flex-1 overflow-y-auto">
      <div 
        v-for="layer in layers" 
        :key="layer.id"
        :data-layer-id="layer.id"
        :class="[
          'flex items-center h-8 hover:bg-gray-50 group transition-colors border-b border-gray-100',
          { 'bg-blue-50': layer.id === selectedLayerId }
        ]"
        @click="selectLayer(layer.id)"
      >
        <!-- Layer Visibility Toggle -->
        <button 
          class="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-gray-600"
          @click.stop="toggleLayerVisibility(layer.id)"
        >
          <svg 
            v-if="!isLayerHidden(layer.id)" 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-4 w-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <svg 
            v-else 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-4 w-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
        </button>
        
        <!-- Layer Preview -->
        <div class="w-5 h-5 border border-gray-200 rounded-sm flex items-center justify-center"
             :style="{ backgroundColor: getLayerPreviewColor(layer) }">
          <span v-if="layer.type === 'text'" class="text-[10px]">T</span>
          <span v-else-if="layer.type === 'rectangle'" class="text-[10px]">□</span>
          <span v-else-if="layer.type === 'circle'" class="text-[10px]">○</span>
          <span v-else-if="layer.type === 'path'" class="text-[10px]">/</span>
        </div>
        
        <!-- Layer Name -->
        <div class="flex-1 truncate text-xs text-gray-900 ml-2">
          {{ layer.name || `${layer.type.charAt(0).toUpperCase() + layer.type.slice(1)} ${layers.indexOf(layer) + 1}` }}
        </div>
        
        <!-- Layer Actions -->
        <div class="flex opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            class="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-gray-600"
            @click.stop="duplicateLayer(layer.id)"
            title="Duplicate"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <button 
            class="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-red-500"
            @click.stop="deleteLayer(layer.id)"
            title="Delete"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-if="layers.length === 0" class="flex items-center justify-center h-20 text-xs text-gray-400">
        No layers yet
      </div>
    </div>
    
    <!-- Add Layer Button -->
    <div class="h-9 border-t border-gray-200 flex items-center px-1 flex-shrink-0">
      <button 
        @click="addNewLayer"
        class="flex items-center justify-center h-7 w-full text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-sm transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add Layer
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useProjectStore } from '@/stores/project'
import type { Layer } from '@/types/project' // Import the Layer type

const projectStore = useProjectStore()

const hiddenLayers = ref<Set<string>>(new Set())

// Frame'in layer'larını al veya boş dizi döndür
const layers = computed(() => {
  // Seçili frame'in layer'larını al, yoksa boş dizi döndür
  return projectStore.currentFrameLayers ? [...projectStore.currentFrameLayers].reverse() : []
})
const selectedLayerId = computed(() => projectStore.selectedLayer)

function selectLayer(id: string) {
  projectStore.selectLayer(id)
}

function deleteLayer(id: string) {
  // Doğrudan projectStore.deleteLayer metodunu kullan
  projectStore.deleteLayer(id)
  if (selectedLayerId.value === id) {
    projectStore.deselectLayer()
  }
}

function duplicateLayer(id: string) {
  // Seçili frame'in layer'larından ilgili layer'ı bul
  const currentFrameLayers = projectStore.currentFrameLayers || []
  const layer = currentFrameLayers.find(l => l.id === id)
  if (!layer) return
  
  const newLayer = JSON.parse(JSON.stringify(layer))
  newLayer.id = `layer-${Date.now()}`
  
  // position yerine x ve y kullanılıyor
  if (layer.x !== undefined && layer.y !== undefined) {
    newLayer.x = layer.x + 20
    newLayer.y = layer.y + 20
  }
  
  // projectStore.addLayer metodunu kullan
  projectStore.addLayer(newLayer)
  projectStore.selectLayer(newLayer.id)
}

function addNewLayer() {
  const newLayer = {
    id: `layer-${Date.now()}`,
    type: 'rectangle',
    name: `Layer ${layers.value.length + 1}`,
    x: 100,
    y: 100,
    width: 100,
    height: 100,
    properties: {
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 1,
      opacity: 1,
      rotation: 0
    }
  }
  
  projectStore.addLayer(newLayer)
  projectStore.selectLayer(newLayer.id)
}

function toggleLayerVisibility(id: string) {
  // Find the layer in the current frame
  const layer = projectStore.currentFrameLayers?.find(l => l.id === id);
  if (layer) {
    // Toggle the visibility in the store
    projectStore.updateLayer(id, {
      visible: layer.visible === false // If undefined or true, set to false, otherwise set to true
    });
  }
  
  // Also maintain in local set for UI rendering
  if (hiddenLayers.value.has(id)) {
    hiddenLayers.value.delete(id);
  } else {
    hiddenLayers.value.add(id);
  }
}

function isLayerHidden(id: string) {
  // Check both the local set and the store value
  const layer = projectStore.currentFrameLayers?.find(l => l.id === id);
  return hiddenLayers.value.has(id) || layer?.visible === false;
}

function getLayerPreviewColor(layer: any) {
  if (layer.properties.fill && layer.properties.fill !== 'transparent') {
    return layer.properties.fill
  } else if (layer.properties.stroke) {
    return layer.properties.stroke
  }
  return '#f3f4f6'
}

// Expose methods if needed by parent
const focusLayer = (id: string) => {
  // Implementation to scroll to and highlight a specific layer
  const element = document.querySelector(`[data-layer-id="${id}"]`)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    // Add highlight effect
    element.classList.add('bg-blue-50')
    setTimeout(() => {
      element.classList.remove('bg-blue-50')
    }, 1000)
  }
}

defineExpose({
  focusLayer
})
</script>

<style scoped>
.layer-enter-active,
.layer-leave-active {
  transition: all 0.3s ease;
}

.layer-enter-from,
.layer-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
