<!--
  DesignCanvas Component - Fixed Version with Text Editing
-->

<template>
  <div ref="containerRef" class="w-full h-full relative overflow-hidden bg-gray-100">
    <!-- Empty State: Canvas yokken gösterilir -->
    <div v-if="!hasCanvas" class="h-full flex flex-col items-center justify-center text-gray-400">
      <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
      <p class="text-lg">No Canvas Available</p>
      <p class="text-sm mt-2">Create a new project to get started</p>
    </div>

    <!-- Main Canvas: Konva.js canvas -->
    <v-stage
      v-else
      ref="stageRef"
      :config="stageConfig"
      @mousedown="handleStageMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @wheel="handleWheel"
      class="v-stage"
    >
      <v-layer>
        <!-- Canvas Background -->
        <v-rect
          v-if="canvas"
          :config="{
            x: canvasPosition.x,
            y: canvasPosition.y,
            width: canvasSize.width,
            height: canvasSize.height,
            fill: canvas.backgroundColor,
            stroke: '#e5e7eb',
            strokeWidth: 1,
            cornerRadius: 4,
            shadowColor: 'rgba(0, 0, 0, 0.1)',
            shadowBlur: 10,
            shadowOffset: { x: 0, y: 2 }
          }"
        />

        <!-- Canvas Layers -->
        <v-group
          v-if="canvas"
          v-for="layer in canvas.layers"
          :key="layer.id"
          :config="{
            id: layer.id,
            name: layer.id,
            x: canvasPosition.x + layer.x,
            y: canvasPosition.y + layer.y,
            width: layer.width,
            height: layer.height,
            rotation: layer.rotation || 0,
            draggable: (props.currentTool === 'select' || props.currentTool === 'move') && projectStore.selectedLayer === layer.id,
            visible: layer.visible !== false
          }"
          @dragend="handleLayerDragEnd($event, layer.id)"
          @transformend="handleTransformEnd($event, layer.id)"
          @dblclick="handleLayerDoubleClick($event, layer.id)"
        >
          <component
            :is="getLayerComponent(layer.type)"
            :config="getLayerConfig(layer)"
          />
        </v-group>

        <!-- Transformer -->
        <v-transformer ref="transformerRef" />
      </v-layer>
    </v-stage>

    <!-- Zoom Controls -->
    <div class="absolute bottom-4 right-4 flex items-center space-x-2 bg-white rounded-lg shadow-lg p-2">
      <button 
        class="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
        @click="zoomOut"
        title="Zoom Out"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
        </svg>
      </button>
      
      <span class="text-sm text-gray-600 min-w-[3rem] text-center font-medium">
        {{ Math.round(zoomLevel * 100) }}%
      </span>
      
      <button 
        class="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
        @click="zoomIn"
        title="Zoom In"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>
      
      <button 
        class="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors ml-2"
        @click="resetZoom"
        title="Reset Zoom"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>

    <!-- Canvas Info -->
    <div class="absolute top-4 left-4 bg-white rounded-lg shadow-sm p-2 text-xs text-gray-600">
      <div v-if="canvas">{{ canvas.width }} × {{ canvas.height }}px</div>
      <div>{{ Math.round(zoomLevel * 100) }}% zoom</div>
      <div>{{ canvas?.layers.length || 0 }} layers</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import { useProjectStore } from '../stores/project'
import { useHistoryStore } from '../stores/history'
import type { Layer } from '../types/project'

// Props ve Emits
const props = defineProps<{
  currentTool: string
  zoomLevel: number
}>()

const emit = defineEmits<{
  'layerSelected': [id: string]
  'layerUpdated': [id: string]
  'update:zoomLevel': [zoom: number]
  'colorSampled': [color: string]
  'measurementTaken': [distance: number, startPoint: { x: number; y: number }, endPoint: { x: number; y: number }]
  'toolChanged': [tool: string]
}>()

// Stores
const projectStore = useProjectStore()
const historyStore = useHistoryStore()

// Template refs
const containerRef = ref<HTMLElement | null>(null)
const stageRef = ref<any>(null)
const transformerRef = ref<any>(null)

// Canvas state
const stageSize = ref({ width: 2000, height: 2000 })
const stagePosition = ref({ x: 0, y: 0 })

// Canvas centering
const canvasPosition = computed(() => {
  if (!projectStore.canvas) return { x: 0, y: 0 }
  
  return {
    x: (stageSize.value.width - canvasSize.value.width) / 2,
    y: (stageSize.value.height - canvasSize.value.height) / 2
  }
})

// Canvas properties
const canvas = computed(() => projectStore.canvas)
const canvasSize = computed(() => ({
  width: canvas.value?.width || 1440,
  height: canvas.value?.height || 1024
}))

const hasCanvas = computed(() => canvas.value !== null)

// Stage configuration
const stageConfig = computed(() => ({
  width: stageSize.value.width,
  height: stageSize.value.height,
  scaleX: props.zoomLevel,
  scaleY: props.zoomLevel,
  x: stagePosition.value.x,
  y: stagePosition.value.y,
  draggable: false
}))

// Drawing state
const isDrawing = ref(false)
const currentDrawing = ref<any>(null)
const currentPath = ref<number[]>([])

// Pan state
const isPanning = ref(false)
const lastPanPoint = ref<{ x: number; y: number } | null>(null)
const spacePressed = ref(false)

// Text editing state
const isEditingText = ref(false)
const editingTextId = ref<string | null>(null)

// Keyboard handlers
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.code === 'Space' && !e.repeat) {
    e.preventDefault()
    spacePressed.value = true
    if (containerRef.value) {
      containerRef.value.style.cursor = 'grab'
    }
  }
}

const handleKeyUp = (e: KeyboardEvent) => {
  if (e.code === 'Space') {
    e.preventDefault()
    spacePressed.value = false
    isPanning.value = false
    if (containerRef.value) {
      containerRef.value.style.cursor = 'default'
    }
  }
}

// Transformer update function
function updateTransformer() {
  const transformer = transformerRef.value?.getNode()
  const stage = stageRef.value?.getStage()
  if (!transformer || !stage) return

  const selectedId = projectStore.selectedLayer

  if (selectedId && (props.currentTool === 'select' || props.currentTool === 'move')) {
    const selectedNode = stage.findOne(`#${selectedId}`)
    if (selectedNode) {
      transformer.nodes([selectedNode])
      transformer.enabledAnchors(['top-left', 'top-center', 'top-right', 
                                  'middle-right', 'bottom-right', 'bottom-center', 
                                  'bottom-left', 'middle-left'])
      transformer.rotateEnabled(true)
    } else {
      transformer.nodes([])
    }
  } else {
    transformer.nodes([])
  }
}

// Text editing functions
function startTextEditing(layerId: string) {
  const layer = projectStore.getLayerById(layerId)
  if (!layer || layer.type !== 'text') return
  
  isEditingText.value = true
  editingTextId.value = layerId
  
  nextTick(() => {
    const stage = stageRef.value?.getStage()
    if (!stage) return
    
    const layerGroup = stage.findOne(`#${layerId}`)
    if (!layerGroup) return
    
    const textNode = layerGroup.findOne('Text')
    if (!textNode) return
    
    const textPosition = textNode.getAbsolutePosition()
    const stageBox = stage.container().getBoundingClientRect()
    
    // Create textarea for editing
    const textarea = document.createElement('textarea')
    textarea.value = layer.properties?.text || ''
    textarea.style.position = 'absolute'
    textarea.style.top = (textPosition.y + stageBox.top) + 'px'
    textarea.style.left = (textPosition.x + stageBox.left) + 'px'
    textarea.style.width = Math.max(layer.width, 100) + 'px'
    textarea.style.minHeight = Math.max(layer.height, 30) + 'px'
    textarea.style.fontSize = (layer.properties?.fontSize || 16) + 'px'
    textarea.style.fontFamily = layer.properties?.fontFamily || 'Arial'
    textarea.style.color = layer.properties?.fill || '#000000'
    textarea.style.border = '2px solid #007bff'
    textarea.style.borderRadius = '4px'
    textarea.style.padding = '4px'
    textarea.style.resize = 'none'
    textarea.style.background = 'white'
    textarea.style.zIndex = '10000'
    textarea.style.outline = 'none'
    textarea.style.lineHeight = '1.2'
    
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()
    
    const finishEditing = () => {
      const newText = textarea.value
      
      // Calculate text size
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      if (context) {
        const fontSize = layer.properties?.fontSize || 16
        context.font = `${fontSize}px ${layer.properties?.fontFamily || 'Arial'}`
        
        // Calculate width and height based on text content
        const lines = newText.split('\n')
        let maxWidth = 0
        lines.forEach(line => {
          const metrics = context.measureText(line)
          maxWidth = Math.max(maxWidth, metrics.width)
        })
        
        const textWidth = Math.max(maxWidth + 20, 50) // Add padding
        const textHeight = Math.max(lines.length * fontSize * 1.2 + 10, 30) // Line height
        
        // Update layer with new text and size
        projectStore.updateLayer(layerId, {
          properties: {
            ...layer.properties,
            text: newText
          },
          width: textWidth,
          height: textHeight
        })
      }
      
      document.body.removeChild(textarea)
      isEditingText.value = false
      editingTextId.value = null
      historyStore.addState()
    }
    
    textarea.addEventListener('blur', finishEditing)
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault()
        finishEditing()
      }
      if (e.key === 'Escape') {
        finishEditing()
      }
    })
  })
}

function handleLayerDoubleClick(event: any, id: string) {
  const layer = projectStore.getLayerById(id)
  if (layer && layer.type === 'text') {
    // Double click on text starts editing
    startTextEditing(id)
  } else {
    // Double click functionality for other layers
    projectStore.selectLayer(id)
    nextTick(() => updateTransformer())
  }
}

// Helper functions
function calculateDistance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  if (!p1 || !p2) return 0
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  return Math.sqrt(dx * dx + dy * dy)
}

function getCanvasPointerPosition(): { x: number; y: number } | null {
  const stage = stageRef.value?.getStage()
  if (!stage) return null
  
  const pointerPosition = stage.getPointerPosition()
  if (!pointerPosition) return null

  const x = (pointerPosition.x - stage.x()) / stage.scaleX()
  const y = (pointerPosition.y - stage.y()) / stage.scaleY()

  return {
    x: x - canvasPosition.value.x,
    y: y - canvasPosition.value.y,
  }
}

// Layer component mapping
function getLayerComponent(type: string): string {
  const componentMap: Record<string, string> = {
    rectangle: 'v-rect',
    circle: 'v-circle',
    text: 'v-text',
    line: 'v-line',
    image: 'v-image',
    star: 'v-star'
  }
  return componentMap[type] || 'v-rect'
}

// Layer configuration
function getLayerConfig(layer: any) {
  const baseConfig = {
    fill: layer.properties?.fill || '#3b82f6',
    stroke: layer.properties?.stroke || '#1e40af',
    strokeWidth: layer.properties?.strokeWidth || 1,
    opacity: layer.properties?.opacity || 1,
    perfectDrawEnabled: false
  }

  switch (layer.type) {
    case 'rectangle':
      return {
        ...baseConfig,
        width: layer.width,
        height: layer.height,
      }
    case 'circle':
      return {
        ...baseConfig,
        x: layer.width / 2,
        y: layer.height / 2,
        radius: Math.min(layer.width, layer.height) / 2
      }
    case 'star':
      return {
        ...baseConfig,
        x: layer.width / 2,
        y: layer.height / 2,
        numPoints: layer.properties?.numPoints || 5,
        innerRadius: layer.properties?.innerRadius || Math.min(layer.width, layer.height) / 4,
        outerRadius: layer.properties?.outerRadius || Math.min(layer.width, layer.height) / 2,
      }
    case 'text':
      return {
        x: 0,
        y: 0,
        text: layer.properties?.text || 'Text',
        fontSize: layer.properties?.fontSize || 16,
        fontFamily: layer.properties?.fontFamily || 'Arial',
        fill: layer.properties?.fill || '#000000',
        align: layer.properties?.align || 'left',
        width: layer.width,
        height: layer.height,
        wrap: 'word',
        ellipsis: false,
        listening: true,
        perfectDrawEnabled: false
      }
    case 'line':
      return {
        points: layer.properties?.points || [0, 0, layer.width, layer.height],
        stroke: layer.properties?.stroke || '#1e40af',
        strokeWidth: layer.properties?.strokeWidth || 2,
        lineCap: 'round',
        perfectDrawEnabled: false
      }
    default:
      return { ...baseConfig, width: layer.width, height: layer.height }
  }
}

// Event handlers
function handleStageMouseDown(event: any): void {
  if (!hasCanvas.value) return
  const stage = stageRef.value?.getStage()
  if (!stage) return

  // Handle panning with middle mouse button
  if (event.evt && event.evt.button === 1) {
    event.evt.preventDefault()
    isPanning.value = true
    lastPanPoint.value = stage.getPointerPosition()
    if (containerRef.value) {
      containerRef.value.style.cursor = 'grabbing'
    }
    return
  }

  // Handle panning with spacebar
  if (spacePressed.value) {
    isPanning.value = true
    lastPanPoint.value = stage.getPointerPosition()
    return
  }

  // Handle layer selection with the 'select' or 'move' tool
  if (props.currentTool === 'select' || props.currentTool === 'move') {
    const pos = getCanvasPointerPosition()
    if (!pos) return

    // Find the topmost layer at this position
    let selectedLayerId = null
    if (canvas.value) {
      for (let i = canvas.value.layers.length - 1; i >= 0; i--) {
        const layer = canvas.value.layers[i]
        
        if (!layer.visible) continue
        
        const layerLeft = layer.x
        const layerRight = layer.x + layer.width
        const layerTop = layer.y
        const layerBottom = layer.y + layer.height
        
        if (pos.x >= layerLeft && pos.x <= layerRight && 
            pos.y >= layerTop && pos.y <= layerBottom) {
          selectedLayerId = layer.id
          break
        }
      }
    }

    if (selectedLayerId) {
      projectStore.selectLayer(selectedLayerId)
      emit('layerSelected', selectedLayerId)
      nextTick(() => updateTransformer())
    } else {
      projectStore.selectLayer(null)
      nextTick(() => updateTransformer())
    }
    return
  }

  // Handle drawing tools
  if (['rectangle', 'circle', 'star', 'line'].includes(props.currentTool)) {
    const pos = getCanvasPointerPosition()
    if (!pos || !canvas.value) return

    isDrawing.value = true
    try {
      const newLayer = projectStore.createLayer(props.currentTool as Layer['type'], {
        x: pos.x,
        y: pos.y,
        width: 1,
        height: 1,
      })
      currentDrawing.value = { id: newLayer.id, start: pos }
      projectStore.selectLayer(newLayer.id)
    } catch (error) {
      console.error('Error creating layer:', error)
      isDrawing.value = false
    }
    return
  }

  // Handle text tool
  if (props.currentTool === 'text') {
    const pos = getCanvasPointerPosition()
    if (!pos || !canvas.value) return

    try {
      const newLayer = projectStore.createLayer('text', {
        x: pos.x,
        y: pos.y,
        width: 200,
        height: 40,
        properties: {
          text: 'Type here...',
          fontSize: 16,
          fontFamily: 'Arial',
          fill: '#000000',
          align: 'left'
        }
      })
      projectStore.selectLayer(newLayer.id)
      nextTick(() => {
        updateTransformer()
        startTextEditing(newLayer.id)
      })
    } catch (error) {
      console.error('Error creating text layer:', error)
    }
    return
  }
}

function handleMouseMove(event: any): void {
  if (!hasCanvas.value) return
  const stage = stageRef.value?.getStage()
  if (!stage) return

  // Handle panning
  if (isPanning.value && lastPanPoint.value) {
    const newPos = stage.getPointerPosition()
    if (!newPos) return
    
    const dx = newPos.x - lastPanPoint.value.x
    const dy = newPos.y - lastPanPoint.value.y

    stagePosition.value = {
      x: stagePosition.value.x + dx,
      y: stagePosition.value.y + dy,
    }
    lastPanPoint.value = newPos
    return
  }

  // Handle drawing
  if (isDrawing.value && currentDrawing.value && currentDrawing.value.start) {
    const pos = getCanvasPointerPosition()
    if (!pos) return

    const start = currentDrawing.value.start
    const newWidth = Math.abs(pos.x - start.x)
    const newHeight = Math.abs(pos.y - start.y)
    const newX = Math.min(pos.x, start.x)
    const newY = Math.min(pos.y, start.y)

    projectStore.updateLayer(currentDrawing.value.id, {
      x: newX,
      y: newY,
      width: Math.max(1, newWidth),
      height: Math.max(1, newHeight),
    })
  }
}

function handleMouseUp(): void {
  if (isPanning.value) {
    isPanning.value = false
    lastPanPoint.value = null
    if (containerRef.value) {
      containerRef.value.style.cursor = spacePressed.value ? 'grab' : 'default'
    }
    return
  }

  if (isDrawing.value) {
    if (currentDrawing.value) {
      historyStore.addState()
    }
    isDrawing.value = false
    currentDrawing.value = null
  }
}

function handleWheel(event: any): void {
  event.evt?.preventDefault()
  if (!hasCanvas.value) return

  const stage = stageRef.value?.getStage()
  if (!stage) return

  const oldScale = stage.scaleX()
  const pointer = stage.getPointerPosition()
  if (!pointer) return

  const mousePointTo = {
    x: (pointer.x - stage.x()) / oldScale,
    y: (pointer.y - stage.y()) / oldScale,
  }

  const scaleBy = 1.1
  const newScale = event.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy

  emit('update:zoomLevel', newScale)

  nextTick(() => {
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    }
    stagePosition.value = newPos
  })
}

function handleLayerDragEnd(event: any, id: string) {
  const node = event.target
  const x = node.x() - canvasPosition.value.x
  const y = node.y() - canvasPosition.value.y
  
  projectStore.updateLayer(id, { x, y })
  historyStore.addState()
  emit('layerUpdated', id)
}

function handleTransformEnd(event: any, id: string) {
  const node = event.target
  const scaleX = node.scaleX()
  const scaleY = node.scaleY()
  
  node.scaleX(1)
  node.scaleY(1)

  const x = node.x() - canvasPosition.value.x
  const y = node.y() - canvasPosition.value.y
  const width = Math.max(5, node.width() * scaleX)
  const height = Math.max(5, node.height() * scaleY)

  projectStore.updateLayer(id, {
    x: x,
    y: y,
    rotation: node.rotation(),
    width: width,
    height: height,
  })
  
  historyStore.addState()
  emit('layerUpdated', id)
}

// Zoom controls
function resetZoom() {
  if (!containerRef.value || !stageRef.value?.getStage() || !canvas.value) return

  const stage = stageRef.value.getStage()
  const container = containerRef.value

  const padding = 80
  const containerWidth = container.clientWidth
  const containerHeight = container.clientHeight

  const availableWidth = containerWidth - padding * 2
  const availableHeight = containerHeight - padding * 2

  const canvasW = canvasSize.value.width
  const canvasH = canvasSize.value.height

  if (canvasW <= 0 || canvasH <= 0 || availableWidth <= 0 || availableHeight <= 0) {
    emit('update:zoomLevel', 1)
    stagePosition.value = { x: 0, y: 0 }
    return
  }

  const scale = Math.min(availableWidth / canvasW, availableHeight / canvasH)

  emit('update:zoomLevel', scale)

  nextTick(() => {
    const canvasCenterX = canvasPosition.value.x + canvasW / 2
    const canvasCenterY = canvasPosition.value.y + canvasH / 2

    const newStagePosX = containerWidth / 2 - canvasCenterX * scale
    const newStagePosY = containerHeight / 2 - canvasCenterY * scale

    stagePosition.value = { x: newStagePosX, y: newStagePosY }
  })
}

const zoomIn = () => emit('update:zoomLevel', props.zoomLevel * 1.2)
const zoomOut = () => emit('update:zoomLevel', props.zoomLevel / 1.2)

// Lifecycle hooks
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)
  
  nextTick(() => {
    if (hasCanvas.value) {
      resetZoom()
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('keyup', handleKeyUp)
})

// Watchers
watch(() => props.currentTool, () => {
  nextTick(() => updateTransformer())
})

watch(() => projectStore.selectedLayer, () => {
  nextTick(() => updateTransformer())
})

watch(hasCanvas, (isReady, wasReady) => {
  if (isReady && !wasReady) {
    nextTick(() => resetZoom())
  }
})

</script>

<style scoped>
.v-stage {
  cursor: default;
}
</style>
