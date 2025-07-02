import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Layer, Project } from '../types/project'

/**
 * Project Store - Simplified Canvas System
 * 
 * Workspace sistemi kaldırıldı, her proje tek bir canvas'tan oluşur.
 * Bu basitleştirme kullanıcı deneyimini iyileştirir ve kod karmaşıklığını azaltır.
 */

export const useProjectStore = defineStore('project', () => {
  // Proje durumu
  const currentProject = ref<Project | null>(null)
  
  // Canvas durumu - tek canvas sistemi
  const canvas = ref<{
    id: string
    name: string
    width: number
    height: number
    backgroundColor: string
    layers: Layer[]
  } | null>(null)
  
  // Seçili katman
  const selectedLayer = ref<string | null>(null)
  const isDirty = ref(false)

  // Local Storage için key
  const STORAGE_KEY = 'fui-designer-project'

  // Computed properties
  const currentLayers = computed(() => canvas.value?.layers || [])
  
  const selectedLayerData = computed(() => {
    if (!canvas.value || !selectedLayer.value) return null
    return canvas.value.layers.find(layer => layer.id === selectedLayer.value)
  })

  const hasProject = computed(() => canvas.value !== null)

  // Helper functions
  function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  function getLayerById(layerId: string): Layer | null {
    if (!canvas.value || !layerId) return null
    
    const layer = canvas.value.layers.find(l => l.id === layerId)
    if (layer) {
      console.log(`Layer found: ${layer.id}, name: ${layer.name}, visible: ${layer.visible}`)
      return layer
    }
    
    console.log(`Layer not found with id: ${layerId}`)
    return null
  }

  // Storage functions
  function loadFromStorage(): boolean {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        
        if (data.currentProject) {
          currentProject.value = data.currentProject
        }
        
        if (data.canvas) {
          canvas.value = data.canvas
        }
        
        if (data.selectedLayer) {
          selectedLayer.value = data.selectedLayer
        }
        
        console.log('Project loaded from localStorage')
        return true
      }
    } catch (error) {
      console.error('Error loading project from localStorage:', error)
    }
    return false
  }

  function saveToStorage(): void {
    try {
      const data = {
        currentProject: currentProject.value,
        canvas: canvas.value,
        selectedLayer: selectedLayer.value,
        timestamp: Date.now()
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      console.log('Project saved to localStorage')
    } catch (error) {
      console.error('Error saving project to localStorage:', error)
    }
  }

  function clearStorage(): void {
    try {
      localStorage.removeItem(STORAGE_KEY)
      canvas.value = null
      currentProject.value = null
      selectedLayer.value = null
      console.log('Project cleared from localStorage')
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  }

  // Project operations
  function initializeProject(projectData: {
    name: string
    width: number
    height: number
    backgroundColor: string
    type?: string
  }): void {
    console.log('Initializing new project:', projectData.name)
    
    // Yeni canvas oluştur
    canvas.value = {
      id: generateId(),
      name: 'Main Canvas',
      width: projectData.width,
      height: projectData.height,
      backgroundColor: projectData.backgroundColor,
      layers: []
    }
    
    // Proje bilgilerini kaydet
    currentProject.value = {
      id: generateId(),
      name: projectData.name,
      workspaces: [], // Geriye uyumluluk için
      frames: [], // Geriye uyumluluk için
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    isDirty.value = false
    console.log('Project initialized successfully')
  }

  // Layer operations
  function addLayer(layer: Omit<Layer, 'id'> & { id?: string }): Layer | null {
    if (!canvas.value) {
      console.warn('Canvas yok, layer eklenemez')
      return null
    }
    
    const newLayer: Layer = {
      id: layer.id || generateId(),
      name: layer.name || layer.type || 'New Layer',
      type: layer.type,
      workspaceId: canvas.value.id, // Canvas ID'si olarak kullan
      x: layer.x || 0,
      y: layer.y || 0,
      width: layer.width || 100,
      height: layer.height || 100,
      rotation: layer.rotation || 0,
      properties: layer.properties || {},
      visible: layer.visible !== undefined ? layer.visible : true,
      locked: layer.locked !== undefined ? layer.locked : false,
    }
    
    canvas.value.layers.push(newLayer)
    isDirty.value = true
    console.log('Layer added:', newLayer.name)
    return newLayer
  }

  function updateLayer(id: string, updates: Partial<Layer>): boolean {
    if (!canvas.value) return false
    
    const layer = canvas.value.layers.find(l => l.id === id)
    if (layer) {
      // Properties nesnesini dikkatli bir şekilde merge et
      if (updates.properties && layer.properties) {
        updates.properties = { ...layer.properties, ...updates.properties }
      }
      
      Object.assign(layer, updates)
      isDirty.value = true
      console.log('Layer updated:', id)
      return true
    }
    
    console.warn('Layer not found for update:', id)
    return false
  }

  function deleteLayer(id: string): boolean {
    if (!canvas.value) return false
    
    const layerIndex = canvas.value.layers.findIndex(l => l.id === id)
    if (layerIndex !== -1) {
      const deletedLayer = canvas.value.layers[layerIndex]
      canvas.value.layers.splice(layerIndex, 1)
      
      // Eğer silinen katman seçili katman ise, seçimi kaldır
      if (selectedLayer.value === id) {
        selectedLayer.value = null
      }
      
      isDirty.value = true
      console.log('Layer deleted:', deletedLayer.name)
      return true
    }
    
    console.warn('Layer not found for deletion:', id)
    return false
  }

  function moveLayer(id: string, newIndex: number): boolean {
    if (!canvas.value) return false
    
    const currentIndex = canvas.value.layers.findIndex(l => l.id === id)
    if (currentIndex !== -1 && newIndex >= 0 && newIndex < canvas.value.layers.length) {
      const layer = canvas.value.layers.splice(currentIndex, 1)[0]
      canvas.value.layers.splice(newIndex, 0, layer)
      isDirty.value = true
      console.log('Layer moved:', layer.name)
      return true
    }
    
    return false
  }

  function toggleLayerVisibility(id: string): boolean {
    if (!canvas.value) return false
    
    const layer = canvas.value.layers.find(l => l.id === id)
    if (layer) {
      layer.visible = !layer.visible
      isDirty.value = true
      console.log(`Layer ${layer.name} visibility toggled to ${layer.visible}`)
      return true
    }
    
    return false
  }

  // Selection operations
  function selectLayer(id: string | null): void {
    selectedLayer.value = id
    console.log('Layer selected:', id)
  }

  function deselectLayer(): void {
    selectedLayer.value = null
    console.log('Layer deselected')
  }

  // Project save/load operations
  async function saveProject(): Promise<void> {
    if (!currentProject.value) {
      throw new Error('No project to save')
    }
    
    try {
      // API çağrısı yapılacak
      console.log('Saving project...', currentProject.value.name)
      // Örnek: await api.saveProject(currentProject.value)
      isDirty.value = false
      console.log('Project saved successfully')
    } catch (error) {
      console.error('Project save error:', error)
      throw error
    }
  }

  async function loadProject(projectId: string): Promise<void> {
    try {
      console.log('Loading project...', projectId)
      // API çağrısı yapılacak
      // const project = await api.loadProject(projectId)
      // currentProject.value = project
      // canvas.value = project.canvas
      isDirty.value = false
      console.log('Project loaded successfully')
    } catch (error) {
      console.error('Project load error:', error)
      throw error
    }
  }

  function updateCanvasSize(width: number, height: number): void {
    if (canvas.value) {
      canvas.value.width = width
      canvas.value.height = height
      isDirty.value = true
    }
  }

  function updateCanvasBackground(backgroundColor: string): void {
    if (canvas.value) {
      canvas.value.backgroundColor = backgroundColor
      isDirty.value = true
    }
  }

  // Auto-save watchers
  watch([canvas, selectedLayer, currentProject], () => {
    saveToStorage()
  }, { deep: true })

  // Initialize from storage
  const hasStoredData = loadFromStorage()

  // Return store interface
  return {
    // State
    currentProject,
    canvas,
    selectedLayer,
    isDirty,
    
    // Computed
    currentLayers,
    selectedLayerData,
    hasProject,
    
    // Helper functions
    getLayerById,
    
    // Project operations
    initializeProject,
    saveProject,
    loadProject,
    updateCanvasSize,
    updateCanvasBackground,
    
    // Layer operations
    addLayer,
    updateLayer,
    deleteLayer,
    moveLayer,
    toggleLayerVisibility,
    selectLayer,
    deselectLayer,
    
    // Storage operations
    saveToStorage,
    loadFromStorage,
    clearStorage,
    hasStoredData,
    
    // Geriye uyumluluk için deprecated properties
    workspaces: computed(() => canvas.value ? [canvas.value] : []),
    selectedWorkspace: computed(() => canvas.value?.id || null),
    currentWorkspace: computed(() => canvas.value),
    currentWorkspaceLayers: computed(() => currentLayers.value),
    selectWorkspace: () => {}, // No-op
    addLayerToWorkspace: addLayer, // Alias
    mainWorkspace: computed(() => canvas.value)
  }
})
