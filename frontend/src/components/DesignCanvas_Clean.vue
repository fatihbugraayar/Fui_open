<template>
  <div ref="containerRef" class="w-full h-full relative overflow-hidden bg-gray-50">
    <!-- Empty State -->
    <div v-if="!hasWorkspaces" class="h-full flex flex-col items-center justify-center text-gray-400">
      <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
      <p class="text-lg">No Workspaces Yet</p>
      <p class="text-sm mt-2">Create a new workspace to get started</p>
      <button
        class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        @click="createNewWorkspace"
      >
        Create Workspace
      </button>
    </div>

    <!-- Canvas -->
    <v-stage
      v-else
      ref="stageRef"
      :config="stageConfig"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @wheel="handleWheel"
      class="v-stage"
    >
      <v-layer>
        <!-- Grid -->
        <v-rect
          :config="{
            width: stageConfig.width,
            height: stageConfig.height,
            fillPatternImage: gridPattern,
            fillPatternRepeat: 'repeat'
          }"
        />

        <!-- Workspaces -->
        <v-group
          v-for="workspace in props.workspaces"
          :key="workspace.id"
          :config="{
            x: workspace.x,
            y: workspace.y,
            width: workspace.width,
            height: workspace.height,
            draggable: currentTool === 'move'
          }"
        >
          <!-- Workspace Background -->
          <v-rect
            :config="{
              width: workspace.width,
              height: workspace.height,
              fill: workspace.backgroundColor || '#ffffff',
              stroke: workspace.id === selectedWorkspaceId ? '#007bff' : '#e5e7eb',
              strokeWidth: workspace.id === selectedWorkspaceId ? 2 : 1,
              cornerRadius: 2
            }"
            @click="() => $emit('selectWorkspace', workspace.id)"
          />

          <!-- Main workspace indicator -->
          <v-rect
            v-if="workspace.isMainWorkspace"
            :config="{
              x: -8,
              y: -8,
              width: 6,
              height: 6,
              fill: '#3b82f6',
              cornerRadius: 3
            }"
          />

          <!-- Workspace Label -->
          <v-text
            :config="{
              x: 8,
              y: -25,
              text: workspace.name,
              fontSize: 12,
              fontFamily: 'Arial',
              fill: '#374151'
            }"
          />

          <!-- Workspace Content (Layers) -->
          <v-group
            v-for="layer in workspace.layers"
            :key="layer.id"
            :config="{
              x: layer.x,
              y: layer.y,
              draggable: currentTool === 'move',
              visible: layer.visible !== false
            }"
            @dragend="handleLayerDragEnd($event, layer.id)"
            @click="handleLayerClick($event, layer.id)"
          >
            <component
              :is="getLayerComponent(layer.type)"
              :config="getLayerConfig(layer)"
            />
          </v-group>

          <!-- Drawing Preview -->
          <v-group v-if="isDrawing && currentDrawing && currentDrawing.workspaceId === workspace.id">
            <v-rect
              v-if="currentDrawing.type === 'rectangle'"
              :config="{
                x: currentDrawing.x,
                y: currentDrawing.y,
                width: currentDrawing.width,
                height: currentDrawing.height,
                fill: 'transparent',
                stroke: '#007bff',
                strokeWidth: 2,
                dash: [5, 5]
              }"
            />
            <v-circle
              v-if="currentDrawing.type === 'circle'"
              :config="{
                x: currentDrawing.x + currentDrawing.radius,
                y: currentDrawing.y + currentDrawing.radius,
                radius: Math.abs(currentDrawing.radius),
                fill: 'transparent',
                stroke: '#007bff',
                strokeWidth: 2,
                dash: [5, 5]
              }"
            />
          </v-group>
        </v-group>
      </v-layer>
    </v-stage>

    <!-- Zoom Controls -->
    <div class="absolute bottom-4 right-4 flex items-center space-x-2 bg-white rounded-lg shadow p-2">
      <button 
        class="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
        @click="zoomOut"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
        </svg>
      </button>
      <span class="text-sm text-gray-600 min-w-[3rem] text-center">
        {{ Math.round(props.zoomLevel * 100) }}%
      </span>
      <button 
        class="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
        @click="zoomIn"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useProjectStore } from '../stores/project'

// Konva.js imports - konva vue kütüphanesi kullanılıyor
// Bu componentlerin doğru import edildiğinden emin olun

// Props ve Emits
const props = defineProps<{
  workspaces: any[]
  selectedWorkspaceId: string | null
  currentTool: string
  zoomLevel: number
}>()

const emit = defineEmits<{
  'selectWorkspace': [id: string]
  'layerSelected': [id: string]
  'layerUpdated': [id: string]
  'update:zoomLevel': [zoom: number]
}>()

// Store
const projectStore = useProjectStore()

// Template refs
const containerRef = ref<HTMLElement | null>(null)
const stageRef = ref<any>(null)

// Canvas state
const stageConfig = ref({
  width: 2000,
  height: 2000,
  draggable: false
})

// Computed
const hasWorkspaces = computed(() => props.workspaces && props.workspaces.length > 0)

// Refs
const gridPattern = ref<HTMLImageElement | null>(null)

// Drawing state
const isDrawing = ref(false)
const currentDrawing = ref<any>(null)

// Drawing functions
function startDrawing(x: number, y: number, workspaceId: string) {
  if (props.currentTool === 'rectangle' || props.currentTool === 'circle') {
    isDrawing.value = true
    currentDrawing.value = {
      type: props.currentTool,
      workspaceId,
      x,
      y,
      width: 0,
      height: 0,
      radius: 0
    }
  }
}

function updateDrawing(x: number, y: number) {
  if (isDrawing.value && currentDrawing.value) {
    const width = x - currentDrawing.value.x
    const height = y - currentDrawing.value.y
    
    currentDrawing.value.width = width
    currentDrawing.value.height = height
    
    if (currentDrawing.value.type === 'circle') {
      currentDrawing.value.radius = Math.sqrt(width * width + height * height) / 2
    }
  }
}

function finishDrawing() {
  if (isDrawing.value && currentDrawing.value) {
    const { workspaceId, type, x, y, width, height, radius } = currentDrawing.value
    
    // Minimum size check
    if (Math.abs(width) > 5 || Math.abs(height) > 5) {
      const layer = {
        type,
        x: width < 0 ? x + width : x,
        y: height < 0 ? y + height : y,
        width: Math.abs(width),
        height: Math.abs(height),
        properties: {
          fill: '#3b82f6',
          stroke: '#1e40af',
          strokeWidth: 1
        }
      }
      
      if (type === 'circle') {
        layer.width = Math.abs(radius) * 2
        layer.height = Math.abs(radius) * 2
      }
      
      projectStore.addLayerToWorkspace(layer)
    }
    
    isDrawing.value = false
    currentDrawing.value = null
  }
}

// Create new workspace function
function createNewWorkspace() {
  projectStore.addWorkspace({
    name: `Workspace ${projectStore.workspaces.length + 1}`,
    width: 1440,
    height: 1024,
    x: 100 + (projectStore.workspaces.length * 200), // Offset each workspace
    y: 100,
    backgroundColor: '#ffffff',
    order: projectStore.workspaces.length
  })
}

// Layer handling functions
function handleLayerClick(event: any, layerId: string) {
  emit('layerSelected', layerId)
}

function handleLayerDragEnd(event: any, layerId: string) {
  const node = event.target
  emit('layerUpdated', layerId)
}

function getLayerComponent(type: string) {
  switch (type) {
    case 'rectangle':
      return 'v-rect'
    case 'circle':
      return 'v-circle'
    case 'text':
      return 'v-text'
    default:
      return 'v-rect'
  }
}

function getLayerConfig(layer: any) {
  const baseConfig = {
    width: layer.width,
    height: layer.height,
    fill: layer.properties?.fill || '#3b82f6',
    stroke: layer.properties?.stroke || '#1e40af',
    strokeWidth: layer.properties?.strokeWidth || 1
  }

  if (layer.type === 'circle') {
    return {
      ...baseConfig,
      radius: Math.min(layer.width, layer.height) / 2
    }
  } else if (layer.type === 'text') {
    return {
      ...baseConfig,
      text: layer.properties?.text || 'Text',
      fontSize: layer.properties?.fontSize || 16,
      fontFamily: layer.properties?.fontFamily || 'Arial'
    }
  }

  return baseConfig
}

// Mouse handling functions
function handleMouseDown(event: any) {
  const stage = event.target.getStage()
  const pos = stage.getRelativePointerPosition()
  
  // Check if we're clicking on a workspace
  const workspace = props.workspaces.find(w => 
    pos.x >= w.x && pos.x <= w.x + w.width &&
    pos.y >= w.y && pos.y <= w.y + w.height
  )
  
  if (workspace && (props.currentTool === 'rectangle' || props.currentTool === 'circle')) {
    // Start drawing inside workspace
    const localX = pos.x - workspace.x
    const localY = pos.y - workspace.y
    startDrawing(localX, localY, workspace.id)
  }
}

function handleMouseMove(event: any) {
  if (isDrawing.value) {
    const stage = event.target.getStage()
    const pos = stage.getRelativePointerPosition()
    
    const workspace = props.workspaces.find(w => w.id === currentDrawing.value.workspaceId)
    if (workspace) {
      const localX = pos.x - workspace.x
      const localY = pos.y - workspace.y
      updateDrawing(localX, localY)
    }
  }
}

function handleMouseUp(event: any) {
  if (isDrawing.value) {
    finishDrawing()
  }
}

function handleWheel(event: any) {
  // Handle zoom with wheel
  event.evt.preventDefault()
  const scaleBy = 1.05
  const stage = event.target.getStage()
  const oldScale = stage.scaleX()
  const mousePos = stage.getPointerPosition()
  
  const newScale = event.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy
  emit('update:zoomLevel', newScale)
}

// Zoom functions
function zoomIn() {
  const newZoom = Math.min(props.zoomLevel * 1.2, 5)
  emit('update:zoomLevel', newZoom)
}

function zoomOut() {
  const newZoom = Math.max(props.zoomLevel / 1.2, 0.1)
  emit('update:zoomLevel', newZoom)
}

// Methods
function updateStageSize() {
  if (containerRef.value) {
    stageConfig.value.width = containerRef.value.offsetWidth
    stageConfig.value.height = containerRef.value.offsetHeight
  }
}

// Lifecycle
onMounted(() => {
  updateStageSize()
  window.addEventListener('resize', updateStageSize)
  
  // Create grid pattern
  const canvas = document.createElement('canvas')
  canvas.width = 20
  canvas.height = 20
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.strokeStyle = '#f0f0f0'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(20, 0)
    ctx.moveTo(0, 0)
    ctx.lineTo(0, 20)
    ctx.stroke()
    
    const img = new Image()
    img.src = canvas.toDataURL()
    img.onload = () => {
      gridPattern.value = img
    }
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', updateStageSize)
})

// Expose
defineExpose({
  stageRef
})
</script>

<style scoped>
.v-stage {
  touch-action: none;
}
</style>
