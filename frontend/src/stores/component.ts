import { defineStore } from 'pinia'
import type { Component, Position, Selection, MoveOperation } from '../types/component'

export const useComponentStore = defineStore('component', {
  state: () => ({
    components: [] as Component[],
    selection: {
      components: [] as string[],
      boundingBox: undefined
    } as Selection,
    moveHistory: [] as MoveOperation[],
    redoStack: [] as MoveOperation[],
    isDragging: false,
    gridSize: 10, // Izgara boyutu (piksel)
    snapToGrid: false // Izgaraya hizalama özelliği
  }),

  getters: {
    selectedComponents: (state) => {
      return state.components.filter(comp => state.selection.components.includes(comp.id))
    },

    boundingBox: (state) => {
      if (state.selection.components.length === 0) return undefined

      const selectedComps = state.components.filter(comp => 
        state.selection.components.includes(comp.id)
      )

      if (selectedComps.length === 0) return undefined

      const x = Math.min(...selectedComps.map(comp => comp.position.x))
      const y = Math.min(...selectedComps.map(comp => comp.position.y))
      const right = Math.max(...selectedComps.map(comp => 
        comp.position.x + comp.width * comp.scale.x
      ))
      const bottom = Math.max(...selectedComps.map(comp => 
        comp.position.y + comp.height * comp.scale.y
      ))

      return {
        x,
        y,
        width: right - x,
        height: bottom - y
      }
    }
  },

  actions: {
    // Bileşen ekleme
    addComponent(component: Component) {
      this.components.push(component)
    },

    // Bileşen silme
    removeComponent(id: string) {
      this.components = this.components.filter(comp => comp.id !== id)
      this.deselectComponent(id)
    },

    // Bileşen seçme
    selectComponent(id: string, multiSelect: boolean = false) {
      if (!multiSelect) {
        this.selection.components = []
      }
      if (!this.selection.components.includes(id)) {
        this.selection.components.push(id)
      }
      this.updateBoundingBox()
    },

    // Bileşen seçimini kaldırma
    deselectComponent(id: string) {
      this.selection.components = this.selection.components.filter(compId => compId !== id)
      this.updateBoundingBox()
    },

    // Tüm seçimleri temizleme
    clearSelection() {
      this.selection.components = []
      this.selection.boundingBox = undefined
    },

    // Sınırlayıcı kutuyu güncelleme
    updateBoundingBox() {
      this.selection.boundingBox = this.boundingBox
    },

    // Bileşen taşıma
    moveComponent(id: string, newPosition: Position) {
      const component = this.components.find(comp => comp.id === id)
      if (!component) return

      // Izgaraya hizalama aktifse
      if (this.snapToGrid) {
        newPosition.x = Math.round(newPosition.x / this.gridSize) * this.gridSize
        newPosition.y = Math.round(newPosition.y / this.gridSize) * this.gridSize
      }

      // Taşıma işlemini kaydet
      const moveOperation: MoveOperation = {
        componentId: id,
        startPosition: { ...component.position },
        endPosition: newPosition,
        timestamp: Date.now()
      }

      // Bileşeni taşı
      component.position = newPosition
      
      // Taşıma geçmişine ekle
      this.moveHistory.push(moveOperation)
      this.redoStack = [] // Redo stack'ini temizle
    },

    // Çoklu bileşen taşıma
    moveSelectedComponents(delta: Position) {
      this.selectedComponents.forEach(component => {
        const newPosition = {
          x: component.position.x + delta.x,
          y: component.position.y + delta.y
        }
        this.moveComponent(component.id, newPosition)
      })
    },

    // Taşıma işlemini geri alma
    undoMove() {
      const lastMove = this.moveHistory.pop()
      if (!lastMove) return

      const component = this.components.find(comp => comp.id === lastMove.componentId)
      if (component) {
        component.position = lastMove.startPosition
        this.redoStack.push(lastMove)
      }
    },

    // Taşıma işlemini tekrar yapma
    redoMove() {
      const lastUndo = this.redoStack.pop()
      if (!lastUndo) return

      const component = this.components.find(comp => comp.id === lastUndo.componentId)
      if (component) {
        component.position = lastUndo.endPosition
        this.moveHistory.push(lastUndo)
      }
    },

    // Izgaraya hizalama özelliğini aç/kapat
    toggleSnapToGrid() {
      this.snapToGrid = !this.snapToGrid
    },

    // Izgara boyutunu ayarlama
    setGridSize(size: number) {
      this.gridSize = size
    }
  }
}) 