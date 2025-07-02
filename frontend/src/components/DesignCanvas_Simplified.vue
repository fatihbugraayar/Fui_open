<!--
  DesignCanvas Component - Simplified Canvas System
  
  Workspace sistemi kaldırıldı, tek canvas sistemi kullanılıyor.
  Bu basitleştirme kullanıcı deneyimini iyileştirir ve performansı artırır.
  
  Özellikler:
  - Tek canvas sistemi ile basit layer yönetimi
  - Optimized drawing ve interaction handlers
  - Zoom ve pan desteği
  - Tool-based drawing operations
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
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @wheel="handleWheel"
      class="v-stage"
    >
      <v-layer>
        <!-- Canvas Background -->
        <v-rect
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
          v-for="layer in canvas.layers"
          :key="layer.id"
          :config="{
            x: canvasPosition.x + layer.x,
            y: canvasPosition.y + layer.y,
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
        <v-group v-if="isDrawing && currentDrawing">
          <!-- Rectangle Preview -->
          <v-rect
            v-if="currentDrawing.type === 'rectangle'"
            :config="{
              x: canvasPosition.x + currentDrawing.x,
              y: canvasPosition.y + currentDrawing.y,
              width: currentDrawing.width,
              height: currentDrawing.height,
              fill: 'transparent',
              stroke: '#007bff',
              strokeWidth: 2,
              dash: [5, 5]
            }"
          />
          
          <!-- Circle Preview -->
          <v-circle
            v-if="currentDrawing.type === 'circle'"
            :config="{
              x: canvasPosition.x + currentDrawing.x + currentDrawing.radius,
              y: canvasPosition.y + currentDrawing.y + currentDrawing.radius,
              radius: Math.abs(currentDrawing.radius),
              fill: 'transparent',
              stroke: '#007bff',
              strokeWidth: 2,
              dash: [5, 5]
            }"
          />
          
          <!-- Line Preview -->
          <v-line
            v-if="currentDrawing.type === 'line'"
            :config="{
              points: currentDrawing.points?.map((p, i) => 
                i % 2 === 0 ? p + canvasPosition.x : p + canvasPosition.y
              ) || [],
              stroke: '#007bff',
              strokeWidth: 2,
              lineCap: 'round',
              dash: [3, 3]
            }"
          />
        </v-group>

        <!-- Measurement Overlay -->
        <v-group v-if="measureStart && measureEnd">
          <v-line
            :config="{
              points: [measureStart.x, measureStart.y, measureEnd.x, measureEnd.y],
              stroke: '#ff0000',
              strokeWidth: 2,
              dash: [5, 5]
            }"
          />
          <v-circle
            v-for="(point, index) in [measureStart, measureEnd]"
            :key="index"
            :config="{
              x: point.x,
              y: point.y,
              radius: 4,
              fill: '#ff0000'
            }"
          />
          <v-text
            :config="{
              x: (measureStart.x + measureEnd.x) / 2,
              y: (measureStart.y + measureEnd.y) / 2 - 15,
              text: `${Math.round(calculateDistance(measureStart, measureEnd))}px`,
              fontSize: 12,
              fill: '#ff0000',
              fontFamily: 'Arial'
            }"
          />
        </v-group>
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
/**
 * DesignCanvas Component - Simplified Implementation
 * 
 * Tek canvas sistemi ile basitleştirilmiş tasarım alanı.
 * Workspace karmaşıklığı kaldırıldı, daha iyi performans ve kullanıcı deneyimi sağlandı.
 */

import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useProjectStore } from '../stores/project'
import { useHistoryStore } from '../stores/history'

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
}>()

// Stores
const projectStore = useProjectStore()
const historyStore = useHistoryStore()

// Template refs
const containerRef = ref<HTMLElement | null>(null)
const stageRef = ref<any>(null)

// Canvas state
const stageSize = ref({ width: 2000, height: 2000 })
const stagePosition = ref({ x: 0, y: 0 })

// Canvas centering
const canvasPosition = computed(() => {
  if (!projectStore.canvas) return { x: 0, y: 0 }
  
  return {
    x: (stageSize.value.width - projectStore.canvas.width) / 2,
    y: (stageSize.value.height - projectStore.canvas.height) / 2
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

// Measure tool state
const measureStart = ref<{ x: number; y: number } | null>(null)
const measureEnd = ref<{ x: number; y: number } | null>(null)

// Pan state
const isPanning = ref(false)
const lastPanPoint = ref<{ x: number; y: number } | null>(null)
const spacePressed = ref(false)

// Helper functions
function calculateDistance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  return Math.sqrt(dx * dx + dy * dy)
}

function isPointInCanvas(x: number, y: number): boolean {
  const canvasX = canvasPosition.value.x
  const canvasY = canvasPosition.value.y
  
  return x >= canvasX && 
         x <= canvasX + canvasSize.value.width &&
         y >= canvasY && 
         y <= canvasY + canvasSize.value.height
}

function getRelativeCanvasPosition(stageX: number, stageY: number): { x: number; y: number } {
  return {
    x: stageX - canvasPosition.value.x,
    y: stageY - canvasPosition.value.y
  }
}

// Layer component mapping
function getLayerComponent(type: string): string {
  const componentMap: Record<string, string> = {
    rectangle: 'v-rect',
    circle: 'v-circle',
    text: 'v-text',
    line: 'v-line',
    image: 'v-image'
  }
  return componentMap[type] || 'v-rect'
}

// Layer configuration
function getLayerConfig(layer: any) {
  const baseConfig = {
    width: layer.width,
    height: layer.height,
    fill: layer.properties?.fill || '#3b82f6',
    stroke: layer.properties?.stroke || '#1e40af',
    strokeWidth: layer.properties?.strokeWidth || 1,
    opacity: layer.properties?.opacity || 1
  }

  switch (layer.type) {
    case 'circle':
      return {
        ...baseConfig,
        radius: Math.min(layer.width, layer.height) / 2
      }
    case 'text':
      return {
        ...baseConfig,
        text: layer.properties?.text || 'Text',
        fontSize: layer.properties?.fontSize || 16,
        fontFamily: layer.properties?.fontFamily || 'Arial'
      }
    case 'line':
      return {
        points: layer.properties?.points || [0, 0, layer.width, layer.height],
        stroke: layer.properties?.stroke || '#1e40af',
        strokeWidth: layer.properties?.strokeWidth || 2,
        lineCap: 'round'
      }
    default:
      return baseConfig
  }
}

// Event handlers
function handleMouseDown(event: any): void {
  if (!hasCanvas.value) return
  
  const stage = stageRef.value?.getStage()
  if (!stage) return
  
  const pos = stage.getRelativePointerPosition()
  
  // Space tuşu ile pan başlat
  if (spacePressed.value) {
    isPanning.value = true
    lastPanPoint.value = stage.getPointerPosition()
    return
  }
  
  // Canvas içinde mi kontrol et
  if (!isPointInCanvas(pos.x, pos.y)) return
  
  const canvasPos = getRelativeCanvasPosition(pos.x, pos.y)
  
  // Tool-based operations
  switch (props.currentTool) {
    case 'rectangle':
    case 'circle':
      startDrawing(canvasPos.x, canvasPos.y, props.currentTool)
      break
      
    case 'line':
      startLineDrawing(canvasPos.x, canvasPos.y)
      break
      
    case 'text':
      createTextLayer(canvasPos.x, canvasPos.y)
      break
      
    case 'measure':
      startMeasuring(pos.x, pos.y)
      break
      
    case 'eyedropper':
      sampleColor(canvasPos.x, canvasPos.y)
      break
  }
}

function handleMouseMove(event: any): void {
  const stage = stageRef.value?.getStage()
  if (!stage) return
  
  // Pan işlemi
  if (isPanning.value && lastPanPoint.value) {
    const currentPointerPos = stage.getPointerPosition()
    if (!currentPointerPos) return
    
    const dx = currentPointerPos.x - lastPanPoint.value.x
    const dy = currentPointerPos.y - lastPanPoint.value.y
    
    stagePosition.value.x += dx
    stagePosition.value.y += dy
    
    lastPanPoint.value = currentPointerPos
    return
  }
  
  // Drawing işlemi
  if (isDrawing.value && currentDrawing.value) {
    const pos = stage.getRelativePointerPosition()
    const canvasPos = getRelativeCanvasPosition(pos.x, pos.y)
    updateDrawing(canvasPos.x, canvasPos.y)
  }
  
  // Measure işlemi
  if (measureStart.value && !measureEnd.value) {
    const pos = stage.getRelativePointerPosition()
    measureEnd.value = { x: pos.x, y: pos.y }
  }
}

function handleMouseUp(event: any): void {
  if (isPanning.value) {
    isPanning.value = false
    lastPanPoint.value = null
    return
  }
  
  if (isDrawing.value) {
    finishDrawing()
  }
  
  if (measureStart.value && measureEnd.value) {
    const distance = calculateDistance(measureStart.value, measureEnd.value)
    emit('measurementTaken', distance, measureStart.value, measureEnd.value)
    measureStart.value = null
    measureEnd.value = null
  }
}

// Drawing functions
function startDrawing(x: number, y: number, type: string): void {
  isDrawing.value = true
  currentDrawing.value = {
    type,
    x,
    y,
    width: 0,
    height: 0,
    radius: 0
  }
}

function updateDrawing(x: number, y: number): void {
  if (!currentDrawing.value) return
  
  const width = x - currentDrawing.value.x
  const height = y - currentDrawing.value.y
  
  currentDrawing.value.width = width
  currentDrawing.value.height = height
  
  if (currentDrawing.value.type === 'circle') {
    currentDrawing.value.radius = Math.sqrt(width * width + height * height) / 2
  }
}

function finishDrawing(): void {
  if (!currentDrawing.value || !canvas.value) return
  
  const { type, x, y, width, height, radius } = currentDrawing.value
  
  // Minimum size check
  if (Math.abs(width) < 5 && Math.abs(height) < 5) {
    isDrawing.value = false
    currentDrawing.value = null
    return
  }
  
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
  
  projectStore.addLayer(layer)
  
  isDrawing.value = false
  currentDrawing.value = null
}

function startLineDrawing(x: number, y: number): void {
  isDrawing.value = true
  currentPath.value = [x, y]
  currentDrawing.value = {
    type: 'line',
    points: [x, y, x, y]
  }
}

function createTextLayer(x: number, y: number): void {
  projectStore.addLayer({
    type: 'text',
    x,
    y,
    width: 100,
    height: 24,
    properties: {
      text: 'New Text',
      fontSize: 16,
      fontFamily: 'Arial',
      fill: '#000000'
    }
  })
}

function startMeasuring(x: number, y: number): void {
  if (!measureStart.value) {
    measureStart.value = { x, y }
    measureEnd.value = { x, y }
  }
}

function sampleColor(x: number, y: number): void {
  // Find layer at position and sample its color
  if (canvas.value) {
    const layer = findLayerAtPosition(x, y)
    if (layer) {
      const color = layer.properties?.fill || layer.properties?.stroke || '#000000'
      emit('colorSampled', color)
    }
  }
}

function findLayerAtPosition(x: number, y: number): any {
  if (!canvas.value) return null
  
  // Search layers from top to bottom
  for (let i = canvas.value.layers.length - 1; i >= 0; i--) {
    const layer = canvas.value.layers[i]
    if (layer.visible !== false &&
        x >= layer.x && x <= layer.x + layer.width &&
        y >= layer.y && y <= layer.y + layer.height) {
      return layer
    }
  }
  return null
}

// Layer event handlers
function handleLayerClick(event: any, layerId: string): void {
  emit('layerSelected', layerId)
  projectStore.selectLayer(layerId)
}

function handleLayerDragEnd(event: any, layerId: string): void {
  const node = event.target
  const newX = node.x() - canvasPosition.value.x
  const newY = node.y() - canvasPosition.value.y
  
  projectStore.updateLayer(layerId, {
    x: newX,
    y: newY
  })
  
  emit('layerUpdated', layerId)
}

// Zoom functions
function zoomIn(): void {
  const newZoom = Math.min(props.zoomLevel * 1.2, 5)
  emit('update:zoomLevel', newZoom)
}

function zoomOut(): void {
  const newZoom = Math.max(props.zoomLevel / 1.2, 0.1)
  emit('update:zoomLevel', newZoom)
}

function resetZoom(): void {
  emit('update:zoomLevel', 1.0)
  // Reset position
  stagePosition.value = { x: 0, y: 0 }
}

function handleWheel(event: any): void {
  event.evt.preventDefault()
  
  const scaleBy = 1.05
  const stage = event.target.getStage()
  const oldScale = stage.scaleX()
  const mousePos = stage.getPointerPosition()
  
  const newScale = event.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy
  emit('update:zoomLevel', Math.max(0.1, Math.min(5, newScale)))
}

// Keyboard event handlers
function handleKeyDown(event: KeyboardEvent): void {
  if (event.code === 'Space') {
    event.preventDefault()
    spacePressed.value = true
  }
}

function handleKeyUp(event: KeyboardEvent): void {
  if (event.code === 'Space') {
    spacePressed.value = false
    isPanning.value = false
  }
}

// Lifecycle
onMounted(() => {
  if (containerRef.value) {
    stageSize.value = {
      width: containerRef.value.offsetWidth,
      height: containerRef.value.offsetHeight
    }
  }
  
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)
  window.addEventListener('resize', updateStageSize)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('keyup', handleKeyUp)
  window.removeEventListener('resize', updateStageSize)
})

function updateStageSize(): void {
  if (containerRef.value) {
    stageSize.value = {
      width: containerRef.value.offsetWidth,
      height: containerRef.value.offsetHeight
    }
  }
}

// Expose methods for parent component
defineExpose({
  stageRef,
  resetZoom,
  zoomIn,
  zoomOut
})
</script>

<style scoped>
.v-stage {
  touch-action: none;
  cursor: crosshair;
}

.v-stage.panning {
  cursor: grab;
}

.v-stage.panning:active {
  cursor: grabbing;
}
</style>
