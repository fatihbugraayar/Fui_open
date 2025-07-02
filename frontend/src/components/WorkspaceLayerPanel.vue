<template>
  <div class="h-full flex flex-col bg-white">
    <!-- Workspace Tabs -->
    <div class="border-b border-gray-200 bg-gray-50">
      <!-- Tab Header -->
      <div class="flex items-center px-3 py-1 text-xs text-gray-500 border-b border-gray-200">
        <span>Workspaces</span>
        <button
          @click="addNewWorkspace"
          class="ml-auto p-1 hover:bg-gray-200 rounded transition-colors"
          title="Add Workspace"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
        </button>
      </div>
      
      <!-- Workspace Tabs -->
      <div class="flex overflow-x-auto">
        <div
          v-for="workspace in projectStore.workspaces"
          :key="workspace.id"
          :class="[
            'flex items-center px-3 py-2 text-xs border-r border-gray-200 cursor-pointer transition-colors group min-w-0',
            workspace.id === projectStore.selectedWorkspace 
              ? 'bg-white text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-600 hover:bg-gray-100'
          ]"
          @click="selectWorkspace(workspace.id)"
        >
          <!-- Main workspace indicator -->
          <div
            v-if="workspace.isMainWorkspace"
            class="w-2 h-2 bg-blue-500 rounded-full mr-1 flex-shrink-0"
            title="Main Workspace"
          ></div>
          
          <!-- Workspace name -->
          <span class="truncate">{{ workspace.name }}</span>
          
          <!-- Close button -->
          <button
            v-if="!workspace.isMainWorkspace"
            @click.stop="deleteWorkspace(workspace.id)"
            class="ml-1 p-0.5 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded transition-all flex-shrink-0"
            title="Close Workspace"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Layers Header -->
    <div class="h-10 border-b border-gray-200 flex items-center px-3 flex-shrink-0">
      <h3 class="text-sm font-medium text-gray-900">
        Layers
        <span v-if="currentWorkspace" class="text-xs text-gray-500 font-normal">
          ({{ currentWorkspace.name }})
        </span>
      </h3>
      
      <!-- Layer actions -->
      <div class="ml-auto flex items-center space-x-1">
        <button
          @click="addNewLayer"
          class="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
          title="Add Layer"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Scrollable Layer List -->
    <div class="flex-1 overflow-y-auto">
      <!-- No layers message -->
      <div 
        v-if="currentWorkspaceLayers.length === 0" 
        class="flex items-center justify-center h-20 text-xs text-gray-400"
      >
        No layers in this workspace
      </div>
      
      <!-- Layer list -->
      <div 
        v-for="layer in currentWorkspaceLayers" 
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
        <div class="w-5 h-5 border border-gray-200 rounded-sm flex items-center justify-center mr-2"
             :style="{ backgroundColor: getLayerPreviewColor(layer) }">
          <!-- Layer type icon -->
          <svg v-if="layer.type === 'rectangle'" class="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"/>
          </svg>
          <svg v-else-if="layer.type === 'circle'" class="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
          </svg>
          <svg v-else-if="layer.type === 'text'" class="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M5 4v3h5.5v12h3V7H19V4z"/>
          </svg>
        </div>
        
        <!-- Layer Info -->
        <div class="flex-1 min-w-0">
          <div class="text-sm text-gray-900 truncate">{{ layer.name }}</div>
          <div class="text-xs text-gray-500">{{ layer.type }}</div>
        </div>
        
        <!-- Layer Actions -->
        <div class="opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            class="h-6 w-6 flex items-center justify-center text-gray-400 hover:text-gray-600"
            @click.stop="duplicateLayer(layer.id)"
            title="Duplicate Layer"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <button 
            class="h-6 w-6 flex items-center justify-center text-gray-400 hover:text-red-600 ml-1"
            @click.stop="removeLayer(layer.id)"
            title="Delete Layer"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProjectStore } from '../stores/project'

const projectStore = useProjectStore()

// Computed properties
const currentWorkspace = computed(() => projectStore.currentWorkspace)
const currentWorkspaceLayers = computed(() => projectStore.currentWorkspaceLayers)
const selectedLayerId = computed(() => projectStore.selectedLayer)

// Methods
function selectWorkspace(id: string) {
  projectStore.selectWorkspace(id)
}

function selectLayer(id: string) {
  projectStore.selectLayer(id)
}

function addNewWorkspace() {
  const workspaceCount = projectStore.workspaces.length
  projectStore.addWorkspace({
    name: `Workspace ${workspaceCount + 1}`,
    width: 1440,
    height: 1024,
    x: 100 + (workspaceCount * 200),
    y: 100,
    backgroundColor: '#ffffff',
    order: workspaceCount
  })
}

function deleteWorkspace(id: string) {
  if (confirm('Are you sure you want to delete this workspace?')) {
    projectStore.deleteWorkspace(id)
  }
}

function addNewLayer() {
  if (currentWorkspace.value) {
    projectStore.addLayerToWorkspace({
      type: 'rectangle',
      name: `Layer ${currentWorkspaceLayers.value.length + 1}`,
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      properties: {
        fill: '#3b82f6',
        stroke: '#1e40af',
        strokeWidth: 2
      }
    })
  }
}

function toggleLayerVisibility(layerId: string) {
  const layer = currentWorkspaceLayers.value.find(l => l.id === layerId)
  if (layer) {
    projectStore.updateLayer(layerId, {
      visible: !layer.visible
    })
  }
}

function isLayerHidden(layerId: string): boolean {
  const layer = currentWorkspaceLayers.value.find(l => l.id === layerId)
  return layer ? layer.visible === false : false
}

function duplicateLayer(layerId: string) {
  const layer = currentWorkspaceLayers.value.find(l => l.id === layerId)
  if (layer && currentWorkspace.value) {
    projectStore.addLayerToWorkspace({
      ...layer,
      name: `${layer.name} Copy`,
      x: layer.x + 10,
      y: layer.y + 10
    })
  }
}

function removeLayer(layerId: string) {
  if (confirm('Are you sure you want to delete this layer?')) {
    projectStore.deleteLayer(layerId)
  }
}

function getLayerPreviewColor(layer: any): string {
  if (layer.properties?.fill) {
    return layer.properties.fill
  }
  switch (layer.type) {
    case 'rectangle':
      return '#3b82f6'
    case 'circle':
      return '#ef4444'
    case 'text':
      return '#10b981'
    default:
      return '#6b7280'
  }
}
</script>
