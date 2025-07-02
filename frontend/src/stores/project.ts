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
  function createLayer(type: Layer['type'], options: Partial<Layer>): Layer {
    if (!canvas.value) {
      throw new Error('Canvas not initialized');
    }

    const newLayer: Layer = {
      id: generateId(),
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Layer`,
      type: type,
      workspaceId: canvas.value.id,
      x: options.x || 0,
      y: options.y || 0,
      width: options.width || 100,
      height: options.height || 100,
      rotation: options.rotation || 0,
      properties: options.properties || {},
      visible: options.visible !== false,
      locked: options.locked || false,
    };

    canvas.value.layers.push(newLayer);
    isDirty.value = true;
    console.log('Layer created:', newLayer.name);
    return newLayer;
  }

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
    const index = canvas.value.layers.findIndex(l => l.id === id)
    if (index !== -1) {
      canvas.value.layers.splice(index, 1)
      if (selectedLayer.value === id) {
        selectedLayer.value = null
      }
      isDirty.value = true
      console.log('Layer deleted:', id)
      return true
    }
    return false
  }

  function selectLayer(id: string | null): void {
    selectedLayer.value = id
    console.log('Layer selected:', id)
  }

  function moveLayerUp(id: string): boolean {
    if (!canvas.value) return false
    const layers = canvas.value.layers
    const index = layers.findIndex(l => l.id === id)
    if (index > -1 && index < layers.length - 1) {
      [layers[index], layers[index + 1]] = [layers[index + 1], layers[index]]
      isDirty.value = true
      return true
    }
    return false
  }

  function moveLayerDown(id: string): boolean {
    if (!canvas.value) return false
    const layers = canvas.value.layers
    const index = layers.findIndex(l => l.id === id)
    if (index > 0) {
      [layers[index], layers[index - 1]] = [layers[index - 1], layers[index]]
      isDirty.value = true
      return true
    }
    return false
  }

  function updateCanvasSize(width: number, height: number): void {
    if (canvas.value) {
      canvas.value.width = width
      canvas.value.height = height
      isDirty.value = true
    }
  }

  function updateCanvasBackground(color: string): void {
    if (canvas.value) {
      canvas.value.backgroundColor = color
      isDirty.value = true
    }
  }

  function hasStoredData(): boolean {
    return localStorage.getItem(STORAGE_KEY) !== null
  }

  // Watch for changes to automatically save
  watch(
    () => canvas,
    () => {
      saveToStorage()
    },
    { deep: true }
  )
  // Initialize from storage
  loadFromStorage()

  // Return store interface
  return {
    // State properties
    currentProject,
    canvas,
    selectedLayer,
    isDirty,
    
    // Computed properties
    currentLayers,
    selectedLayerData,
    hasProject,
    
    // Helper functions
    getLayerById,
    
    // Project operations
    initializeProject,
    updateCanvasSize,
    updateCanvasBackground,
    
    // Layer operations
    createLayer,
    addLayer,
    updateLayer,
    deleteLayer,
    moveLayerUp,
    moveLayerDown,
    selectLayer,
    
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
