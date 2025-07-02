<template>
  <div class="canvas-container"
       @dragover.prevent
       @drop="handleDrop">
    <!-- Zoom Kontrolleri -->
    <div class="zoom-controls">
      <button @click="zoomOut" class="zoom-button">-</button>
      <span>{{ Math.round(zoom * 100) }}%</span>
      <button @click="zoomIn" class="zoom-button">+</button>
    </div>

    <!-- Canvas Alanı -->
    <div class="canvas-wrapper"
         :style="{ transform: `scale(${zoom})` }">
      <!-- Varsayılan Frame -->
      <div v-if="!frames?.length" 
           class="default-frame"
           :style="defaultFrameStyle">
        <div class="frame-content">
          <p>Bileşenleri buraya sürükleyin</p>
        </div>
      </div>

      <!-- Frame'ler -->
      <div v-for="frame in frames" 
           :key="frame.id"
           class="frame"
           :class="{ 'selected': selectedFrameId === frame.id }"
           :style="getFrameStyle(frame)"
           @click="selectFrame(frame.id)">
        <div v-for="element in frame.elements"
             :key="element.id"
             class="canvas-element"
             :style="getElementStyle(element)"
             @click.stop="selectElement(element.id)">
          <component :is="element.type" 
                    v-bind="element.props" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Props tanımı
const props = withDefaults(defineProps<{
  frames?: Array<{
    id: string
    width: number
    height: number
    elements: Array<{
      id: string
      type: string
      props: any
      style: any
    }>
  }>
  selectedFrameId?: string
}>(), {
  frames: () => []
})

// Emits tanımı
const emit = defineEmits<{
  (e: 'selectFrame', id: string): void
  (e: 'selectElement', id: string): void
  (e: 'addElement', element: any): void
}>()

// Zoom kontrolü
const zoom = ref(1)
const zoomStep = 0.1
const minZoom = 0.1
const maxZoom = 3

const zoomIn = () => {
  if (zoom.value < maxZoom) {
    zoom.value += zoomStep
  }
}

const zoomOut = () => {
  if (zoom.value > minZoom) {
    zoom.value -= zoomStep
  }
}

// Varsayılan frame stili
const defaultFrameStyle = computed(() => ({
  width: '390px',
  height: '844px',
  backgroundColor: '#ffffff'
}))

// Frame seçimi
const selectFrame = (frameId: string) => {
  emit('selectFrame', frameId)
}

// Element seçimi
const selectElement = (elementId: string) => {
  emit('selectElement', elementId)
}

// Frame stili
const getFrameStyle = (frame: any) => ({
  width: `${frame.width}px`,
  height: `${frame.height}px`,
  backgroundColor: '#ffffff',
  position: 'relative',
  margin: '20px',
  boxShadow: '0 0 10px rgba(0,0,0,0.1)'
})

// Element stili
const getElementStyle = (element: any) => ({
  position: 'absolute',
  ...element.style
})

// Sürükle-bırak işlemleri
const handleDrop = (event: DragEvent) => {
  if (event.dataTransfer) {
    const componentData = JSON.parse(event.dataTransfer.getData('component'))
    const rect = (event.target as HTMLElement).getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    emit('addElement', {
      type: componentData.id,
      props: {},
      style: {
        left: `${x}px`,
        top: `${y}px`
      }
    })
  }
}
</script>

<style scoped>
.canvas-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: #2d2d2d;
}

.zoom-controls {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: #1e1e1e;
  padding: 8px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
}

.zoom-button {
  width: 30px;
  height: 30px;
  border: none;
  background-color: #333;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.zoom-button:hover {
  background-color: #444;
}

.canvas-wrapper {
  position: relative;
  transform-origin: top left;
  min-height: 100%;
  padding: 20px;
}

.frame {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.2s;
}

.frame.selected {
  box-shadow: 0 0 0 2px #3b82f6;
}

.frame-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
}

.canvas-element {
  position: absolute;
  cursor: move;
}

.canvas-element:hover {
  outline: 1px solid #3b82f6;
}
</style> 