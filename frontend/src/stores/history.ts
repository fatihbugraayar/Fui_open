import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useProjectStore } from './project'

export interface HistoryState {
  actionType: string
  layerId?: string
  workspaceId?: string
  previousState: any
  timestamp: number
}

export const useHistoryStore = defineStore('history', () => {
  const undoStack = ref<HistoryState[]>([])
  const redoStack = ref<HistoryState[]>([])
  const projectStore = useProjectStore()
  
  // Maximum history stack size
  const MAX_HISTORY = 50

  function addState() {
    if (!projectStore.canvas) return;

    // Deep copy of the canvas state
    const currentState = JSON.parse(JSON.stringify(projectStore.canvas));

    const historyEntry: HistoryState = {
      actionType: 'canvasUpdate',
      previousState: currentState,
      timestamp: Date.now(),
    };

    undoStack.value.push(historyEntry);
    if (undoStack.value.length > MAX_HISTORY) {
      undoStack.value.shift();
    }
    // A new action clears the redo stack
    redoStack.value = [];
  }

  // Add an action to history
  function pushHistory(actionState: HistoryState) {
    undoStack.value.push(actionState)
    
    // Clear redo stack when a new action is performed
    redoStack.value = []
    
    // Limit the history stack size
    if (undoStack.value.length > MAX_HISTORY) {
      undoStack.value.shift()
    }
  }

  // Undo last action
  function undo() {
    if (undoStack.value.length === 0) return false
    
    const lastAction = undoStack.value.pop()
    if (!lastAction) return false
    
    // Store current state for potential redo
    const currentState = getCurrentState(lastAction)
    
    // Apply the previous state
    applyState(lastAction.previousState, lastAction.actionType)
    
    // Add to redo stack
    redoStack.value.push({
      ...lastAction,
      previousState: currentState,
    })
    
    return true
  }

  // Redo last undone action
  function redo() {
    if (redoStack.value.length === 0) return false
    
    const lastRedoAction = redoStack.value.pop()
    if (!lastRedoAction) return false
    
    // Store current state for potential undo
    const currentState = getCurrentState(lastRedoAction)
    
    // Apply the redo state
    applyState(lastRedoAction.previousState, lastRedoAction.actionType)
    
    // Add to undo stack
    undoStack.value.push({
      ...lastRedoAction,
      previousState: currentState
    })
    
    return true
  }
  
  // Get current state based on action type
  function getCurrentState(action: HistoryState) {
    switch (action.actionType) {
      case 'updateLayer':
        return action.layerId ? projectStore.getLayerById(action.layerId) : null
      case 'updateWorkspace':
        return action.workspaceId ? projectStore.getWorkspaceById(action.workspaceId) : null
      case 'addLayer':
      case 'removeLayer':
        return action.workspaceId ? { 
          workspaceId: action.workspaceId,
          layers: projectStore.getLayersByWorkspaceId(action.workspaceId) 
        } : null
      case 'multipleAction':
        return action.previousState.currentState
      default:
        return null
    }
  }
  
  // Apply state based on action type
  function applyState(state: any, actionType: string) {
    switch (actionType) {
      case 'updateLayer':
        if (state && state.id) {
          projectStore.updateLayer(state.id, state)
        }
        break
      case 'updateWorkspace':
        if (state && state.id) {
          projectStore.updateWorkspace(state.id, state)
        }
        break
      case 'addLayer':
        if (state && state.workspaceId) {
          projectStore.addLayerToWorkspace(state.layer, state.workspaceId)
        }
        break
      case 'removeLayer':
        if (state && state.layerId) {
          projectStore.removeLayer(state.layerId)
        }
        break
      case 'multipleAction':
        if (state && Array.isArray(state.actions)) {
          state.actions.forEach((action: any) => {
            applyState(action.state, action.type)
          })
        }
        break
    }
  }
  
  // Clear history
  function clearHistory() {
    undoStack.value = []
    redoStack.value = []
  }

  return {
    undoStack,
    redoStack,
    pushHistory,
    undo,
    redo,
    clearHistory,
    addState
  }
})
