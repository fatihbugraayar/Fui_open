<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useProjectStore } from './stores/project'
import { useHistoryStore } from './stores/history'
import ProjectStartScreen from './components/ProjectStartScreen.vue'
import TopBar from './components/TopBar.vue'
import ToolPanel from './components/ToolPanel_New.vue'
import DesignCanvas from './components/DesignCanvas.vue'
import RightPanelTabs from './components/RightPanelTabs.vue'

const projectStore = useProjectStore()
const historyStore = useHistoryStore()
const canvasRef = ref<InstanceType<typeof DesignCanvas> | null>(null)
const currentTool = ref('select')
const strokeColor = ref('#000000')
const fillColor = ref('#ffffff')
const strokeWidth = ref(2)
const opacity = ref(100)
const zoomLevel = ref(1.0)

// Project state
const showProjectStart = ref(true)

// Check for existing project on mount
onMounted(() => {
  // projectStore already loaded from localStorage in store initialization
  // Just check if we have existing workspaces
  if (projectStore.workspaces.length > 0) {
    // Has existing project, skip start screen
    showProjectStart.value = false
    
    console.log('Restored existing project')
  } else {
    // No existing project, show start screen
    showProjectStart.value = true
  }
})

// Default canvas size - workspace tabanlı
const canvasSize = computed(() => {
  return projectStore.currentWorkspace ? 
    { width: projectStore.currentWorkspace.width, height: projectStore.currentWorkspace.height } : 
    { width: 1440, height: 1024 }
})

// Project creation handler
function handleProjectCreated(projectData: any) {
  console.log('Creating project with data:', projectData)
  
  // Basitleştirilmiş canvas sistemi için direkt proje başlat
  projectStore.initializeProject(projectData)
  
  // Başlangıç ekranını gizle
  showProjectStart.value = false
}

// Return to start screen
function returnToStartScreen() {
  if (confirm('Are you sure? Any unsaved changes will be lost.')) {
    showProjectStart.value = true
    // Clear localStorage
    projectStore.clearStorage()
  }
}

// Handle tool changes from the tool panel
function handleToolChange(tool: string) {
  currentTool.value = tool
  console.log('Tool changed:', tool)
}

// Handle menu actions from TopBar
function handleMenuAction(payload: { menu: string, action: string }) {
  console.log('Menu action:', payload)
  
  switch (payload.action) {
    case 'undo':
      // Undo functionality
      historyStore.undo()
      break
    case 'redo':
      // Redo functionality
      historyStore.redo()
      break
    case 'copy':
      // Implement copy functionality
      console.log('Copy action')
      break
    case 'paste':
      // Implement paste functionality
      console.log('Paste action')
      break
    case 'delete':
      // Implement delete functionality
      console.log('Delete action')
      break
    case 'zoom-in':
      zoomLevel.value = Math.min(zoomLevel.value * 1.2, 5)
      break
    case 'zoom-out':
      zoomLevel.value = Math.max(zoomLevel.value / 1.2, 0.1)
      break
    case 'zoom-fit':
      zoomLevel.value = 1.0
      break
    case 'insert-rectangle':
      currentTool.value = 'rectangle'
      break
    case 'insert-circle':
      currentTool.value = 'circle'
      break
    case 'insert-text':
      currentTool.value = 'text'
      break
    case 'insert-line':
      currentTool.value = 'line'
      break
    default:
      console.log('Unhandled menu action:', payload.action)
  }
}

// Handle layer updates
function handleLayerUpdated(layerId: string) {
  console.log('Layer updated:', layerId)
  // Any additional logic when a layer is updated can go here
}

// Handle color changes
function handleColorChange() {
  console.log('Stroke color changed:', strokeColor.value)
  // Update selected layer's stroke color if any
  if (projectStore.selectedLayer) {
    projectStore.updateLayer(projectStore.selectedLayer, {
      properties: {
        ...projectStore.selectedLayerData?.properties,
        stroke: strokeColor.value
      }
    })
  }
}

function handleFillChange() {
  console.log('Fill color changed:', fillColor.value)
  // Update selected layer's fill color if any
  if (projectStore.selectedLayer) {
    projectStore.updateLayer(projectStore.selectedLayer, {
      properties: {
        ...projectStore.selectedLayerData?.properties,
        fill: fillColor.value
      }
    })
  }
}

// Handle stroke width changes
function handleStrokeWidthChange(width: number) {
  strokeWidth.value = width
  console.log('Stroke width changed:', width)
  // Update selected layer's stroke width if any
  if (projectStore.selectedLayer) {
    projectStore.updateLayer(projectStore.selectedLayer, {
      properties: {
        ...projectStore.selectedLayerData?.properties,
        strokeWidth: width
      }
    })
  }
}

// Handle opacity changes
function handleOpacityChange(newOpacity: number) {
  opacity.value = newOpacity
  console.log('Opacity changed:', newOpacity)
  // Update selected layer's opacity if any
  if (projectStore.selectedLayer) {
    projectStore.updateLayer(projectStore.selectedLayer, {
      properties: {
        ...projectStore.selectedLayerData?.properties,
        opacity: newOpacity / 100
      }
    })
  }
}

// Handle color sampling from eyedropper
function handleColorSampled(color: string) {
  strokeColor.value = color
  console.log('Color sampled:', color)
}

// Handle measurement from measure tool
function handleMeasurementTaken(distance: number, startPoint: any, endPoint: any) {
  console.log(`Measurement: ${Math.round(distance)}px`, { startPoint, endPoint })
  // You could show this in a toast/notification
}

// Handle alignment changes
function handleAlignmentChanged(alignment: string) {
  // Alignment functionality can be implemented later
  console.log('Alignment changed:', alignment)
}

// Save the project
async function saveProject() {
  try {
    await projectStore.saveProject()
    alert('Project saved successfully!')
  } catch (error) {
    console.error('Failed to save project:', error)
    alert('Failed to save project. Please try again.')
  }
}

// Export canvas as image
function exportCanvas() {
  if (!canvasRef.value) return
  
  try {
    // This is a basic implementation. For a more complex export,
    // we would need to implement a proper rendering system.
    const stage = canvasRef.value.stageRef?.getNode()
    if (stage) {
      const dataURL = stage.toDataURL({ pixelRatio: 2 })
      
      // Create a temporary link and trigger download
      const link = document.createElement('a')
      link.download = `figma-lite-export-${Date.now()}.png`
      link.href = dataURL
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      alert('Canvas not ready for export')
    }
  } catch (error) {
    console.error('Failed to export canvas:', error)
    alert('Failed to export canvas. Please try again.')
  }
}

// Handle zoom level updates
function handleZoomUpdate(newZoom: number) {
  zoomLevel.value = newZoom
  console.log('Zoom updated:', newZoom)
}

// Initialize application
onMounted(() => {
  // Eğer daha önce canvas varsa başlangıç ekranını atla
  if (projectStore.hasProject) {
    showProjectStart.value = false
  }
})
</script>

<template>
  <!-- Project Start Screen -->
  <ProjectStartScreen 
    v-if="showProjectStart"
    @project-created="handleProjectCreated"
  />

  <!-- Main Designer Interface -->
  <div v-else class="fixed inset-0 flex flex-col">
    <!-- Top Bar -->
    <TopBar 
      :current-tool="currentTool"
      :tool-properties="{ stroke: strokeColor, fill: fillColor }"
      @save="saveProject" 
      @export="exportCanvas" 
      @new-project="returnToStartScreen"
      @menu-action="handleMenuAction"
    />

    <!-- Main Content -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Left Tool Panel -->
      <ToolPanel 
        :activeTool="currentTool"
        :strokeColor="strokeColor"
        :fillColor="fillColor"
        :strokeWidth="strokeWidth"
        :opacity="opacity"
        @tool-change="handleToolChange"
        @stroke-color-change="(color: string) => strokeColor = color"
        @fill-color-change="(color: string) => fillColor = color"
        @stroke-width-change="handleStrokeWidthChange"
        @opacity-change="handleOpacityChange"
      />

      <!-- Canvas Area -->
      <div class="flex-1 overflow-hidden">
        <DesignCanvas 
          ref="canvasRef"
          :currentTool="currentTool"
          :zoomLevel="zoomLevel"
          @layerSelected="projectStore.selectLayer"
          @layerUpdated="handleLayerUpdated"
          @update:zoomLevel="handleZoomUpdate"
          @colorSampled="handleColorSampled"
          @measurementTaken="handleMeasurementTaken"
        />
      </div>

      <!-- Right Panel with Tabs -->
      <div class="w-60 flex flex-col border-l border-gray-200 bg-white">
        <RightPanelTabs />
      </div>
    </div>
  </div>
</template>

<style>
body {
  margin: 0;
  padding: 0;
  overflow: hidden;
  position: fixed;
  width: 100%;
  height: 100%;
}

#app {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
