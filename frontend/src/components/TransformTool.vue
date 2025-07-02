<template>
  <div class="transform-tool-container">
    <button 
      class="tool-button"
      :class="{ 'active': isActive }"
      @click="handleToolClick"
      @mousedown="handleMouseDown"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseLeave"
      @contextmenu.prevent="handleContextMenu"
      @mouseenter="handleMouseEnter"
      title="Dönüştürme Araçları"
    >
      <component :is="activeToolIcon" class="tool-icon" />
      <component 
        :is="activeSubToolIcon" 
        v-if="activeSubTool"
        class="sub-tool-icon"
      />
    </button>

    <!-- Alt Araçlar Menüsü -->
    <Transition name="sub-tool-menu">
      <div 
        v-if="showSubToolMenu" 
        class="sub-tool-menu"
        @mouseleave="handleMenuLeave"
      >
        <button 
          v-for="tool in transformTools" 
          :key="tool.id"
          class="sub-tool-button"
          :class="{ 'active': activeSubTool === tool.id }"
          @click="handleSubToolSelect(tool.id)"
          :title="tool.name"
        >
          <component :is="tool.icon" class="sub-tool-icon" />
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  ArrowsPointingOutIcon,
  ArrowPathIcon,
  ArrowPathRoundedSquareIcon
} from '@heroicons/vue/24/outline'

const isActive = ref(false)
const showSubToolMenu = ref(false)
const activeSubTool = ref<string | null>(null)
const longPressTimer = ref<number | null>(null)
const lastUsedSubTool = ref<string | null>(null)

const transformTools = [
  {
    id: 'move',
    name: 'Taşıma Aracı',
    icon: ArrowsPointingOutIcon,
    cursor: 'move'
  },
  {
    id: 'transform',
    name: 'Dönüştürme Aracı',
    icon: ArrowPathIcon,
    cursor: 'crosshair'
  },
  {
    id: 'select-rotate',
    name: 'Seç ve Döndür',
    icon: ArrowPathRoundedSquareIcon,
    cursor: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'black\' stroke-width=\'2\'><path d=\'M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83\'/></svg>") 12 12, auto'
  }
]

const activeToolIcon = computed(() => {
  if (!activeSubTool.value) return ArrowsPointingOutIcon
  const tool = transformTools.find(t => t.id === activeSubTool.value)
  return tool?.icon || ArrowsPointingOutIcon
})

const activeSubToolIcon = computed(() => {
  const tool = transformTools.find(t => t.id === activeSubTool.value)
  return tool?.icon || ArrowsPointingOutIcon
})

const emit = defineEmits<{
  (e: 'toolSelected', tool: string): void
  (e: 'subToolSelected', subTool: string): void
  (e: 'cursorChanged', cursor: string): void
}>()

const handleToolClick = () => {
  if (!showSubToolMenu.value) {
    isActive.value = !isActive.value
    emit('toolSelected', isActive.value ? 'transform' : '')
    
    if (isActive.value) {
      // Son kullanılan alt aracı seç
      const toolToSelect = activeSubTool.value || lastUsedSubTool.value || 'move'
      handleSubToolSelect(toolToSelect)
    } else {
      emit('cursorChanged', 'default')
    }
  }
}

const handleMouseDown = () => {
  longPressTimer.value = window.setTimeout(() => {
    showSubToolMenu.value = true
  }, 200)
}

const handleMouseUp = () => {
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
  }
}

const handleMouseLeave = () => {
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
  }
}

const handleMouseEnter = () => {
  if (isActive.value) {
    showSubToolMenu.value = true
  }
}

const handleMenuLeave = () => {
  showSubToolMenu.value = false
}

const handleContextMenu = () => {
  showSubToolMenu.value = true
}

const handleSubToolSelect = (toolId: string) => {
  activeSubTool.value = toolId
  lastUsedSubTool.value = toolId
  showSubToolMenu.value = false
  isActive.value = true
  
  const selectedTool = transformTools.find(t => t.id === toolId)
  if (selectedTool) {
    emit('cursorChanged', selectedTool.cursor)
  }
  
  emit('toolSelected', 'transform')
  emit('subToolSelected', toolId)
}
</script>

<style scoped>
.transform-tool-container {
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
  cursor: pointer;
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

.sub-tool-icon {
  width: 16px;
  height: 16px;
  position: absolute;
  right: 4px;
  bottom: 4px;
  color: #333333;
}

.sub-tool-menu {
  position: absolute;
  left: 100%;
  top: 0;
  background-color: #ffffff;
  border-radius: 4px;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 4px;
  padding: 4px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sub-tool-button {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sub-tool-button:hover {
  background-color: #f1f1f1;
}

.sub-tool-button.active {
  background-color: #ededed;
  color: #333333;
}

.sub-tool-button .sub-tool-icon {
  position: static;
  width: 24px;
  height: 24px;
  color: #a0a0a0;
  transition: color 0.2s ease;
}

.sub-tool-button:hover .sub-tool-icon {
  color: #666666;
}

.sub-tool-button.active .sub-tool-icon {
  color: #333333;
}

/* Animasyonlar */
.sub-tool-menu-enter-active,
.sub-tool-menu-leave-active {
  transition: all 0.2s ease;
}

.sub-tool-menu-enter-from,
.sub-tool-menu-leave-to {
  opacity: 0;
  transform: scale(0.95) translateX(-10px);
}
</style> 