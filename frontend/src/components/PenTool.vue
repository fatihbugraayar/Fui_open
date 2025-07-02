<template>
  <div class="pen-tool-container">
    <button 
      class="tool-button"
      :class="{ 'active': isActive }"
      @click="handleToolClick"
      @mousedown="handleMouseDown"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseLeave"
      @contextmenu.prevent="handleContextMenu"
      @mouseenter="handleMouseEnter"
      title="Kalem Aracı"
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
          v-for="tool in subTools" 
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
  PencilIcon,
  PencilSquareIcon,
  SwatchIcon,
  CursorArrowRaysIcon
} from '@heroicons/vue/24/outline'

const isActive = ref(false)
const showSubToolMenu = ref(false)
const activeSubTool = ref<string | null>(null)
const longPressTimer = ref<number | null>(null)
const lastUsedSubTool = ref<string | null>(null)

const subTools = [
  {
    id: 'pen-freehand',
    name: 'Serbest El Kalem',
    icon: PencilIcon,
    cursor: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'black\' stroke-width=\'2\'><path d=\'M12 19l7-7 3 3-7 7-3-3z\'/><path d=\'M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z\'/><path d=\'M2 2l7.586 7.586\'/><circle cx=\'11\' cy=\'11\' r=\'2\'/></svg>") 0 24, auto'
  },
  {
    id: 'pen-line',
    name: 'Çizgi Kalemi',
    icon: CursorArrowRaysIcon,
    cursor: 'crosshair'
  },
  {
    id: 'pen-curve',
    name: 'Kavisli Kalem',
    icon: SwatchIcon,
    cursor: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'black\' stroke-width=\'2\'><path d=\'M3 3c3 2 3 4 0 6s-3 4 0 6\'/><path d=\'M21 3c-3 2-3 4 0 6s3 4 0 6\'/><path d=\'M12 3c0 2 0 4 0 6s0 4 0 6\'/></svg>") 0 24, auto'
  }
]

const activeToolIcon = computed(() => {
  if (!activeSubTool.value) return PencilIcon
  const tool = subTools.find(t => t.id === activeSubTool.value)
  return tool?.icon || PencilIcon
})

const activeSubToolIcon = computed(() => {
  const tool = subTools.find(t => t.id === activeSubTool.value)
  return tool?.icon || PencilIcon
})

const emit = defineEmits<{
  (e: 'toolSelected', tool: string): void
  (e: 'subToolSelected', subTool: string): void
  (e: 'cursorChanged', cursor: string): void
}>()

const handleToolClick = () => {
  if (!showSubToolMenu.value) {
    isActive.value = !isActive.value
    emit('toolSelected', isActive.value ? 'pen' : '')
    
    if (isActive.value) {
      // Son kullanılan alt aracı seç
      const toolToSelect = activeSubTool.value || lastUsedSubTool.value || 'pen-freehand'
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
  
  const selectedTool = subTools.find(t => t.id === toolId)
  if (selectedTool) {
    emit('cursorChanged', selectedTool.cursor)
  }
  
  emit('toolSelected', 'pen')
  emit('subToolSelected', toolId)
}
</script>

<style scoped>
.pen-tool-container {
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