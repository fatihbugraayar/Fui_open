<template>
  <div class="move-tool-container">
    <button 
      class="tool-button"
      :class="{ 'active': isActive }"
      @click="handleToolClick"
      @mousedown="handleMouseDown"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseLeave"
      @contextmenu.prevent="handleContextMenu"
      @mouseenter="handleMouseEnter"
      title="Taşıma Aracı (V)"
    >
      <component :is="ArrowsPointingOutIcon" class="tool-icon" />
    </button>

    <!-- Taşıma Bilgisi -->
    <div v-if="showPositionInfo" class="position-info">
      X: {{ currentPosition.x }}px, Y: {{ currentPosition.y }}px
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ArrowsPointingOutIcon } from '@heroicons/vue/24/outline'
import type { Position } from '../types/component'

const isActive = ref(false)
const showPositionInfo = ref(false)
const currentPosition = ref<Position>({ x: 0, y: 0 })
const isDragging = ref(false)
const startPosition = ref<Position>({ x: 0, y: 0 })
const lastPosition = ref<Position>({ x: 0, y: 0 })

const emit = defineEmits<{
  (e: 'toolSelected', tool: string): void
  (e: 'moveStart', position: Position): void
  (e: 'moveUpdate', position: Position): void
  (e: 'moveEnd', position: Position): void
  (e: 'cursorChanged', cursor: string): void
}>()

const handleToolClick = () => {
  isActive.value = !isActive.value
  emit('toolSelected', isActive.value ? 'move' : '')
  emit('cursorChanged', isActive.value ? 'move' : 'default')
}

const handleMouseDown = (event: MouseEvent) => {
  if (!isActive.value) return
  
  isDragging.value = true
  startPosition.value = { x: event.clientX, y: event.clientY }
  lastPosition.value = { x: event.clientX, y: event.clientY }
  showPositionInfo.value = true
  
  emit('moveStart', startPosition.value)
}

const handleMouseMove = (event: MouseEvent) => {
  if (!isDragging.value || !isActive.value) return
  
  const currentX = event.clientX
  const currentY = event.clientY
  
  // Shift tuşu basılıysa sadece yatay veya dikey hareket
  if (event.shiftKey) {
    const deltaX = Math.abs(currentX - startPosition.value.x)
    const deltaY = Math.abs(currentY - startPosition.value.y)
    
    if (deltaX > deltaY) {
      currentPosition.value = { x: currentX, y: startPosition.value.y }
    } else {
      currentPosition.value = { x: startPosition.value.x, y: currentY }
    }
  } else {
    currentPosition.value = { x: currentX, y: currentY }
  }
  
  emit('moveUpdate', currentPosition.value)
}

const handleMouseUp = () => {
  if (!isDragging.value) return
  
  isDragging.value = false
  showPositionInfo.value = false
  emit('moveEnd', currentPosition.value)
}

const handleMouseLeave = () => {
  if (isDragging.value) {
    handleMouseUp()
  }
}

const handleContextMenu = () => {
  // Sağ tık menüsünü engelle
}

const handleMouseEnter = () => {
  if (isActive.value) {
    emit('cursorChanged', 'move')
  }
}

// Klavye kısayolları
const handleKeyDown = (event: KeyboardEvent) => {
  if (!isActive.value) return
  
  switch (event.key.toLowerCase()) {
    case 'escape':
      if (isDragging.value) {
        // Taşıma işlemini iptal et
        isDragging.value = false
        showPositionInfo.value = false
        currentPosition.value = startPosition.value
        emit('moveEnd', startPosition.value)
      }
      break
    case 'enter':
      if (isDragging.value) {
        // Taşıma işlemini onayla
        handleMouseUp()
      }
      break
  }
}

// Event listener'ları ekle/kaldır
onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.move-tool-container {
  width: 100%;
  padding: 8px;
  position: relative;
}

.tool-button {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  border-radius: 4px;
  cursor: move;
  transition: all 0.2s ease;
  position: relative;
}

.tool-button:hover {
  background-color: #f1f1f1;
}

.tool-button.active {
  background-color: #ededed;
  color: #333333;
}

.tool-icon {
  width: 24px;
  height: 24px;
  color: #a0a0a0;
  transition: color 0.2s ease;
}

.tool-button:hover .tool-icon {
  color: #666666;
}

.tool-button.active .tool-icon {
  color: #333333;
}

.position-info {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  pointer-events: none;
  z-index: 1000;
}
</style> 