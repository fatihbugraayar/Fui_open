<template>
  <div 
    class="drawing-layer"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseLeave"
    @keydown="handleKeyDown"
    @contextmenu="showContextMenu"
    tabindex="0"
    ref="drawingLayerRef"
  >
    <svg 
      ref="svgRef"
      class="drawing-svg"
      :width="width"
      :height="height"
    >
      <!-- Mevcut çizimler -->
      <path
        v-for="layer in layers"
        :key="layer.id"
        v-show="layer.visible"
        :d="layer.properties.path"
        :stroke="layer.properties.stroke"
        :stroke-width="layer.properties.strokeWidth"
        :fill="layer.properties.fill"
        :opacity="layer.properties.opacity"
        :transform="layer.properties.rotation ? `rotate(${layer.properties.rotation} ${layer.properties.x + layer.properties.width/2} ${layer.properties.y + layer.properties.height/2})` : ''"
        @click="handleLayerClick(layer.id)"
        @mouseenter="handleLayerHover(layer.id)"
        @mouseleave="handleLayerLeave"
        :class="{ 
          'selected': selectedLayerId === layer.id,
          'hovered': hoveredLayerId === layer.id
        }"
        :data-layer-id="layer.id"
      />
      
      <!-- Aktif çizim -->
      <path
        v-if="currentPath"
        :d="currentPath"
        :stroke="currentStroke"
        :stroke-width="currentStrokeWidth"
        :fill="isPathClosed ? 'rgba(128, 128, 128, 0.2)' : 'none'"
        :opacity="currentOpacity"
      />

      <!-- Anchor noktaları -->
      <circle
        v-for="point in anchorPoints"
        :key="point.id"
        :cx="point.x"
        :cy="point.y"
        r="4"
        :fill="point.isActive ? '#007bff' : '#666666'"
        class="anchor-point"
        @mousedown.stop="startPointDrag($event, point.id)"
      />

      <!-- Bezier kontrol noktaları -->
      <g v-if="bezierHandles.length > 0">
        <line
          v-for="handle in bezierHandles"
          :key="handle.id"
          :x1="handle.start.x"
          :y1="handle.start.y"
          :x2="handle.end.x"
          :y2="handle.end.y"
          stroke="#666666"
          stroke-dasharray="4"
        />
        <circle
          v-for="handle in bezierHandles"
          :key="`handle-${handle.id}`"
          :cx="handle.end.x"
          :cy="handle.end.y"
          r="3"
          fill="#666666"
          class="handle-point"
          @mousedown.stop="startHandleDrag($event, handle.id)"
        />
      </g>

      <!-- Geçici çizgi -->
      <line
        v-if="isDrawing && anchorPoints.length > 0"
        :x1="anchorPoints[anchorPoints.length - 1].x"
        :y1="anchorPoints[anchorPoints.length - 1].y"
        :x2="currentMousePosition.x"
        :y2="currentMousePosition.y"
        stroke="#666666"
        stroke-dasharray="4"
      />

      <!-- Geçici Bezier eğrisi -->
      <path
        v-if="tempPath"
        :d="tempPath"
        stroke="#666666"
        stroke-dasharray="4"
        fill="none"
      />

      <!-- Transform Box -->
      <g v-if="transformBox && currentSubTool === 'transform'">
        <rect
          :x="transformBox.x"
          :y="transformBox.y"
          :width="transformBox.width"
          :height="transformBox.height"
          :transform="`rotate(${transformBox.rotation} ${transformBox.x + transformBox.width/2} ${transformBox.y + transformBox.height/2})`"
          fill="none"
          stroke="#007bff"
          stroke-width="1"
          stroke-dasharray="4"
        />
        
        <!-- Transform Handles -->
        <circle
          v-for="handle in getTransformHandles"
          :key="handle.handle"
          :cx="handle.x"
          :cy="handle.y"
          r="4"
          fill="#007bff"
          stroke="#ffffff"
          stroke-width="1"
          :class="['transform-handle', `handle-${handle.handle}`]"
          @mousedown.stop="handleTransformStart($event, handle.handle)"
        />
      </g>
      
      <!-- Snap Guides -->
      <g v-if="snapGuides.horizontal.length || snapGuides.vertical.length">
        <line
          v-for="(y, index) in snapGuides.horizontal"
          :key="`h-${index}`"
          :x1="0"
          :y1="y"
          :x2="width"
          :y2="y"
          stroke="#007bff"
          stroke-width="1"
          stroke-dasharray="4"
        />
        <line
          v-for="(x, index) in snapGuides.vertical"
          :key="`v-${index}`"
          :x1="x"
          :y1="0"
          :x2="x"
          :y2="height"
          stroke="#007bff"
          stroke-width="1"
          stroke-dasharray="4"
        />
      </g>

      <!-- Selection Frame -->
      <g v-if="selectedLayerId && props.currentSubTool === 'select-rotate'">
        <rect
          :x="transformBox?.x"
          :y="transformBox?.y"
          :width="transformBox?.width"
          :height="transformBox?.height"
          :transform="`rotate(${transformBox?.rotation} ${transformBox?.x + transformBox?.width/2} ${transformBox?.y + transformBox?.height/2})`"
          fill="none"
          stroke="#007bff"
          stroke-width="1"
          stroke-dasharray="4"
          class="selection-frame"
        />
        
        <!-- Rotation Handle -->
        <circle
          :cx="transformBox?.x + transformBox?.width/2"
          :cy="transformBox?.y - 30"
          r="4"
          fill="#007bff"
          stroke="#ffffff"
          stroke-width="1"
          class="rotation-handle"
          @mousedown.stop="handleSelectRotateStart"
        />
      </g>
      
      <!-- Hover Frame -->
      <rect
        v-if="hoveredLayerId && props.currentSubTool === 'select-rotate'"
        :x="transformBox?.x"
        :y="transformBox?.y"
        :width="transformBox?.width"
        :height="transformBox?.height"
        fill="none"
        stroke="#666666"
        stroke-width="1"
        stroke-dasharray="2"
        class="hover-frame"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

const props = defineProps<{
  width: number
  height: number
  isDrawingMode: boolean
  currentSubTool?: string
  layers: Array<{
    id: string
    name: string
    type: string
    visible: boolean
    properties: {
      path: string
      stroke: string
      strokeWidth: number
      fill: string
      opacity: number
      x?: number
      y?: number
      width?: number
      height?: number
      rotation?: number
    }
  }>
  selectedLayerId?: string
}>()

const emit = defineEmits<{
  (e: 'selectLayer', id: string): void
  (e: 'addLayer', layer: any): void
}>()

const svgRef = ref<SVGElement | null>(null)
const drawingLayerRef = ref<HTMLElement | null>(null)
const isDrawing = ref(false)
const currentPath = ref<string>('')
const anchorPoints = ref<Array<{ id: string; x: number; y: number; isActive: boolean }>>([])
const bezierHandles = ref<Array<{ id: string; start: { x: number; y: number }; end: { x: number; y: number } }>>([])
const isDraggingHandle = ref(false)
const activeHandleId = ref<string | null>(null)
const isShiftPressed = ref(false)
const isCtrlPressed = ref(false)
const currentMousePosition = ref({ x: 0, y: 0 })
const isPathClosed = ref(false)
const isDraggingPoint = ref(false)
const activePointId = ref<string | null>(null)
const currentPoints = ref<Array<{ x: number; y: number }>>([])
const tempPath = ref<string>('')
const isDrawingCurve = ref(false)
const currentBezierPoint = ref<{ x: number; y: number } | null>(null)
const isDragging = ref(false)
const isTransforming = ref(false)
const transformBox = ref<{
  x: number
  y: number
  width: number
  height: number
  rotation: number
} | null>(null)
const transformHandle = ref<string | null>(null)
const selectedElements = ref<Set<string>>(new Set())
const snapGuides = ref<{
  horizontal: number[]
  vertical: number[]
}>({ horizontal: [], vertical: [] })
const dragStartPos = ref({ x: 0, y: 0 })
const transformStartPos = ref({ x: 0, y: 0 })
const transformStartSize = ref({ width: 0, height: 0 })
const transformStartRotation = ref(0)
const isRotating = ref(false)
const rotationCenter = ref({ x: 0, y: 0 })
const rotationStartAngle = ref(0)
const currentRotation = ref(0)
const hoveredLayerId = ref<string | null>(null)

// Aktif çizim özellikleri
const currentStroke = ref('#000000')
const currentStrokeWidth = ref(2)
const currentFill = ref('rgba(128, 128, 128, 0.2)')
const currentOpacity = ref(1)

// Klavye olaylarını dinle
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    cancelDrawing()
  } else if (event.key === 'Enter') {
    completeDrawing()
  } else if (event.key === 'Shift') {
    isShiftPressed.value = true
  } else if (event.key === 'Control') {
    isCtrlPressed.value = true
  }
}

const handleKeyUp = (event: KeyboardEvent) => {
  if (event.key === 'Shift') {
    isShiftPressed.value = false
  } else if (event.key === 'Control') {
    isCtrlPressed.value = false
  }
}

// Çizimi iptal et
const cancelDrawing = () => {
  isDrawing.value = false
  currentPath.value = ''
  anchorPoints.value = []
  bezierHandles.value = []
  isPathClosed.value = false
}

// Çizimi tamamla
const completeDrawing = () => {
  if (currentPath.value) {
    const newLayer = {
      id: `layer-${Date.now()}`,
      name: `Shape ${props.layers.length + 1}`,
      type: 'path',
      visible: true,
      properties: {
        path: currentPath.value,
        stroke: currentStroke.value,
        strokeWidth: currentStrokeWidth.value,
        fill: isPathClosed.value ? currentFill.value : 'none',
        opacity: currentOpacity.value
      }
    }
    emit('addLayer', newLayer)
  }
  cancelDrawing()
}

// Yeni birleştirilmiş mouse event handler'lar
const handleMouseDown = (event: MouseEvent) => {
  if (props.currentSubTool === 'select-rotate') {
    handleSelectRotateStart(event)
  } else if (props.isDrawingMode) {
    startDrawing(event)
  }
}

const handleMouseMove = (event: MouseEvent) => {
  if (props.currentSubTool === 'select-rotate' && isRotating.value) {
    handleSelectRotate(event)
  } else if (props.isDrawingMode) {
    draw(event)
  }
}

const handleMouseUp = (event: MouseEvent) => {
  if (props.currentSubTool === 'select-rotate') {
    handleSelectRotateEnd()
  } else if (props.isDrawingMode) {
    endDrawing()
  }
}

const startDrawing = (event: MouseEvent) => {
  if (!props.isDrawingMode) return
  
  const rect = svgRef.value?.getBoundingClientRect()
  if (!rect) return
  
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  switch (props.currentSubTool) {
    case 'pen-freehand':
      isDrawing.value = true
      currentPoints.value = [{ x, y }]
      currentPath.value = `M ${x} ${y}`
      break
      
    case 'pen-line':
      // İlk noktaya tekrar tıklandığında yolu kapat
      if (anchorPoints.value.length > 0) {
        const firstPoint = anchorPoints.value[0]
        const distance = Math.sqrt(Math.pow(x - firstPoint.x, 2) + Math.pow(y - firstPoint.y, 2))
        
        if (distance < 10) {
          isPathClosed.value = true
          currentPath.value += ' Z'
          completeDrawing()
          return
        }
      }
      
      isDrawing.value = true
      const linePointId = `point-${Date.now()}`
      anchorPoints.value.push({ id: linePointId, x, y, isActive: true })
      
      if (anchorPoints.value.length === 1) {
        currentPath.value = `M ${x} ${y}`
      } else {
        const prevPoint = anchorPoints.value[anchorPoints.value.length - 2]
        let newX = x
        let newY = y
        
        // Shift tuşu ile 45° hizalama
        if (isShiftPressed.value) {
          const dx = x - prevPoint.x
          const dy = y - prevPoint.y
          const angle = Math.atan2(dy, dx)
          const distance = Math.sqrt(dx * dx + dy * dy)
          const snapAngle = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4)
          
          newX = prevPoint.x + Math.cos(snapAngle) * distance
          newY = prevPoint.y + Math.sin(snapAngle) * distance
        }
        
        currentPath.value += ` L ${newX} ${newY}`
      }
      break
      
    case 'pen-curve':
      if (event.detail === 2) {
        // Çift tıklama ile handle'ları sıfırla
        const lastPoint = anchorPoints.value[anchorPoints.value.length - 1]
        if (lastPoint) {
          const handle = bezierHandles.value[bezierHandles.value.length - 1]
          if (handle) {
            handle.end.x = lastPoint.x
            handle.end.y = lastPoint.y
            updateBezierPath()
          }
        }
        return
      }
      
      // İlk noktaya tekrar tıklandığında yolu kapat
      if (anchorPoints.value.length > 0) {
        const firstPoint = anchorPoints.value[0]
        const distance = Math.sqrt(Math.pow(x - firstPoint.x, 2) + Math.pow(y - firstPoint.y, 2))
        
        if (distance < 10) {
          isPathClosed.value = true
          currentPath.value += ' Z'
          completeDrawing()
          return
        }
      }
      
      isDrawing.value = true
      isDrawingCurve.value = true
      const curvePointId = `point-${Date.now()}`
      anchorPoints.value.push({ id: curvePointId, x, y, isActive: true })
      
      if (anchorPoints.value.length === 1) {
        currentPath.value = `M ${x} ${y}`
      } else {
        const prevPoint = anchorPoints.value[anchorPoints.value.length - 2]
        const handleId = `handle-${Date.now()}`
        
        // Kontrol noktaları
        const cp1x = prevPoint.x + (x - prevPoint.x) * 0.5
        const cp1y = prevPoint.y
        const cp2x = prevPoint.x + (x - prevPoint.x) * 0.5
        const cp2y = y
        
        bezierHandles.value.push({
          id: handleId,
          start: { x: prevPoint.x, y: prevPoint.y },
          end: { x: cp1x, y: cp1y }
        })
        
        currentPath.value += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y}`
      }
      break
  }
}

const draw = (event: MouseEvent) => {
  if (!props.isDrawingMode) return
  
  const rect = svgRef.value?.getBoundingClientRect()
  if (!rect) return
  
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  currentMousePosition.value = { x, y }
  
  switch (props.currentSubTool) {
    case 'pen-freehand':
      if (isDrawing.value) {
        currentPoints.value.push({ x, y })
        
        // Yumuşatılmış path oluştur
        if (currentPoints.value.length > 2) {
          const points = currentPoints.value
          let path = `M ${points[0].x} ${points[0].y}`
          
          for (let i = 1; i < points.length - 2; i++) {
            const xc = (points[i].x + points[i + 1].x) / 2
            const yc = (points[i].y + points[i + 1].y) / 2
            path += ` Q ${points[i].x} ${points[i].y}, ${xc} ${yc}`
          }
          
          // Son iki nokta için düz çizgi
          const lastPoint = points[points.length - 1]
          path += ` L ${lastPoint.x} ${lastPoint.y}`
          
          currentPath.value = path
        } else {
          currentPath.value = `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`
        }
      }
      break
      
    case 'pen-line':
      if (isDraggingHandle.value && activeHandleId.value) {
        const handle = bezierHandles.value.find(h => h.id === activeHandleId.value)
        if (handle) {
          handle.end.x = x
          handle.end.y = y
          updateBezierPath()
        }
      } else if (isDraggingPoint.value && activePointId.value) {
        const point = anchorPoints.value.find(p => p.id === activePointId.value)
        if (point) {
          point.x = x
          point.y = y
          updatePath()
        }
      } else if (isDrawing.value && anchorPoints.value.length > 0) {
        const lastPoint = anchorPoints.value[anchorPoints.value.length - 1]
        let newX = x
        let newY = y
        
        // Shift tuşu ile 45° hizalama
        if (isShiftPressed.value) {
          const dx = x - lastPoint.x
          const dy = y - lastPoint.y
          const angle = Math.atan2(dy, dx)
          const distance = Math.sqrt(dx * dx + dy * dy)
          const snapAngle = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4)
          
          newX = lastPoint.x + Math.cos(snapAngle) * distance
          newY = lastPoint.y + Math.sin(snapAngle) * distance
        }
        
        currentMousePosition.value = { x: newX, y: newY }
      }
      break
      
    case 'pen-curve':
      if (isDraggingHandle.value && activeHandleId.value) {
        const handle = bezierHandles.value.find(h => h.id === activeHandleId.value)
        if (handle) {
          handle.end.x = x
          handle.end.y = y
          updateBezierPath()
        }
      } else if (isDraggingPoint.value && activePointId.value) {
        const point = anchorPoints.value.find(p => p.id === activePointId.value)
        if (point) {
          point.x = x
          point.y = y
          updatePath()
        }
      } else if (isDrawingCurve.value && anchorPoints.value.length > 0) {
        const lastPoint = anchorPoints.value[anchorPoints.value.length - 1]
        const handle = bezierHandles.value[bezierHandles.value.length - 1]
        
        if (handle) {
          // Geçici Bezier eğrisi göster
          const cp1x = handle.start.x + (x - handle.start.x) * 0.5
          const cp1y = handle.start.y
          const cp2x = handle.start.x + (x - handle.start.x) * 0.5
          const cp2y = y
          
          tempPath.value = `M ${handle.start.x} ${handle.start.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y}`
        }
      }
      break
  }
}

const endDrawing = () => {
  if (!isDrawing.value) return
  
  switch (props.currentSubTool) {
    case 'pen-freehand':
      completeDrawing()
      break
      
    case 'pen-line':
      // Anchor noktası eklemeye devam et
      break
      
    case 'pen-curve':
      isDrawingCurve.value = false
      tempPath.value = ''
      // Bezier eğrisi oluşturmaya devam et
      break
  }
  
  if (isDraggingHandle.value) {
    isDraggingHandle.value = false
    activeHandleId.value = null
  } else if (isDraggingPoint.value) {
    isDraggingPoint.value = false
    activePointId.value = null
  }
}

const handleMouseLeave = () => {
  if (isDrawing.value) {
    endDrawing()
  }
}

const handleLayerClick = (layerId: string) => {
  emit('selectLayer', layerId)
}

// Nokta sürükleme
const startPointDrag = (event: MouseEvent, pointId: string) => {
  isDraggingPoint.value = true
  activePointId.value = pointId
}

// Handle sürükleme
const startHandleDrag = (event: MouseEvent, handleId: string) => {
  isDraggingHandle.value = true
  activeHandleId.value = handleId
}

const updatePath = () => {
  if (anchorPoints.value.length < 2) return
  
  let path = `M ${anchorPoints.value[0].x} ${anchorPoints.value[0].y}`
  
  for (let i = 1; i < anchorPoints.value.length; i++) {
    const prevPoint = anchorPoints.value[i - 1]
    const currentPoint = anchorPoints.value[i]
    const handle = bezierHandles.value[i - 1]
    
    if (handle) {
      path += ` C ${handle.end.x} ${handle.end.y}, ${handle.end.x} ${currentPoint.y}, ${currentPoint.x} ${currentPoint.y}`
    } else {
      path += ` L ${currentPoint.x} ${currentPoint.y}`
    }
  }
  
  if (isPathClosed.value) {
    path += ' Z'
  }
  
  currentPath.value = path
}

const updateBezierPath = () => {
  updatePath()
}

// Transform box için handle'ların pozisyonlarını hesapla
const getTransformHandles = computed(() => {
  if (!transformBox.value) return []
  
  const { x, y, width, height, rotation } = transformBox.value
  const centerX = x + width / 2
  const centerY = y + height / 2
  
  // Döndürme açısını radyana çevir
  const rad = (rotation * Math.PI) / 180
  
  // Köşe noktalarını hesapla
  const corners = [
    { x: x, y: y, handle: 'nw' },
    { x: x + width, y: y, handle: 'ne' },
    { x: x + width, y: y + height, handle: 'se' },
    { x: x, y: y + height, handle: 'sw' }
  ]
  
  // Kenar orta noktalarını hesapla
  const edges = [
    { x: centerX, y: y, handle: 'n' },
    { x: x + width, y: centerY, handle: 'e' },
    { x: centerX, y: y + height, handle: 's' },
    { x: x, y: centerY, handle: 'w' }
  ]
  
  // Döndürme handle'ı
  const rotationHandle = {
    x: centerX,
    y: y - 30,
    handle: 'rotate'
  }
  
  // Tüm noktaları döndür
  return [...corners, ...edges, rotationHandle].map(point => ({
    ...point,
    x: centerX + (point.x - centerX) * Math.cos(rad) - (point.y - centerY) * Math.sin(rad),
    y: centerY + (point.x - centerX) * Math.sin(rad) + (point.y - centerY) * Math.cos(rad)
  }))
})

// Snap guide'ları hesapla
const calculateSnapGuides = () => {
  if (!transformBox.value) return
  
  const { x, y, width, height } = transformBox.value
  const guides = {
    horizontal: [y, y + height / 2, y + height],
    vertical: [x, x + width / 2, x + width]
  }
  
  // Canvas kenarlarına olan mesafeleri kontrol et
  const snapThreshold = 10
  const canvasEdges = {
    horizontal: [0, props.height],
    vertical: [0, props.width]
  }
  
  // Yatay guide'ları kontrol et
  guides.horizontal = guides.horizontal.filter(guideY => {
    return canvasEdges.horizontal.some(edge => Math.abs(guideY - edge) < snapThreshold)
  })
  
  // Dikey guide'ları kontrol et
  guides.vertical = guides.vertical.filter(guideX => {
    return canvasEdges.vertical.some(edge => Math.abs(guideX - edge) < snapThreshold)
  })
  
  snapGuides.value = guides
}

// Move Tool için mouse event handlers
const handleMoveStart = (event: MouseEvent) => {
  if (props.currentSubTool !== 'move' || !selectedElements.value.size) return
  
  const rect = svgRef.value?.getBoundingClientRect()
  if (!rect) return
  
  isDragging.value = true
  dragStartPos.value = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  }
}

const handleMove = (event: MouseEvent) => {
  if (!isDragging.value || !selectedElements.value.size) return
  
  const rect = svgRef.value?.getBoundingClientRect()
  if (!rect) return
  
  const currentPos = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  }
  
  const dx = currentPos.x - dragStartPos.value.x
  const dy = currentPos.y - dragStartPos.value.y
  
  // Shift tuşu ile axis lock
  const moveX = isShiftPressed.value ? dx : dx
  const moveY = isShiftPressed.value ? 0 : dy
  
  // Seçili elementleri taşı
  selectedElements.value.forEach(elementId => {
    const element = props.layers.find(layer => layer.id === elementId)
    if (element) {
      // Element pozisyonunu güncelle
      element.properties.x = (element.properties.x || 0) + moveX
      element.properties.y = (element.properties.y || 0) + moveY
    }
  })
  
  // Transform box'ı güncelle
  if (transformBox.value) {
    transformBox.value.x += moveX
    transformBox.value.y += moveY
  }
  
  dragStartPos.value = currentPos
  calculateSnapGuides()
}

// Free Transform Tool için mouse event handlers
const handleTransformStart = (event: MouseEvent, handle: string) => {
  if (props.currentSubTool !== 'transform' || !transformBox.value) return
  
  const rect = svgRef.value?.getBoundingClientRect()
  if (!rect) return
  
  isTransforming.value = true
  transformHandle.value = handle
  transformStartPos.value = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  }
  transformStartSize.value = {
    width: transformBox.value.width,
    height: transformBox.value.height
  }
  transformStartRotation.value = transformBox.value.rotation
}

const handleTransform = (event: MouseEvent) => {
  if (!isTransforming.value || !transformBox.value || !transformHandle.value) return
  
  const rect = svgRef.value?.getBoundingClientRect()
  if (!rect) return
  
  const currentPos = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  }
  
  const dx = currentPos.x - transformStartPos.value.x
  const dy = currentPos.y - transformStartPos.value.y
  
  switch (transformHandle.value) {
    case 'rotate':
      // Döndürme işlemi
      const centerX = transformBox.value.x + transformBox.value.width / 2
      const centerY = transformBox.value.y + transformBox.value.height / 2
      const startAngle = Math.atan2(
        transformStartPos.value.y - centerY,
        transformStartPos.value.x - centerX
      )
      const currentAngle = Math.atan2(
        currentPos.y - centerY,
        currentPos.x - centerX
      )
      let rotation = transformStartRotation.value + (currentAngle - startAngle) * (180 / Math.PI)
      
      // 1° hassasiyetle yuvarla
      rotation = Math.round(rotation)
      
      // Shift ile 15° adımlarla döndür
      if (isShiftPressed.value) {
        rotation = Math.round(rotation / 15) * 15
      }
      
      transformBox.value.rotation = rotation
      break
      
    default:
      // Yeniden boyutlandırma işlemi
      let newWidth = transformStartSize.value.width
      let newHeight = transformStartSize.value.height
      
      if (transformHandle.value.includes('e')) {
        newWidth += dx
      }
      if (transformHandle.value.includes('w')) {
        newWidth -= dx
      }
      if (transformHandle.value.includes('s')) {
        newHeight += dy
      }
      if (transformHandle.value.includes('n')) {
        newHeight -= dy
      }
      
      // Shift ile oran koru
      if (isShiftPressed.value) {
        const ratio = transformStartSize.value.width / transformStartSize.value.height
        if (Math.abs(dx) > Math.abs(dy)) {
          newHeight = newWidth / ratio
        } else {
          newWidth = newHeight * ratio
        }
      }
      
      // Ctrl ile serbest boyutlandırma
      if (!isCtrlPressed.value) {
        // Minimum boyut kontrolü
        newWidth = Math.max(10, newWidth)
        newHeight = Math.max(10, newHeight)
      }
      
      transformBox.value.width = newWidth
      transformBox.value.height = newHeight
      
      // Pozisyon güncelleme
      if (transformHandle.value.includes('w')) {
        transformBox.value.x = transformBox.value.x + (transformStartSize.value.width - newWidth)
      }
      if (transformHandle.value.includes('n')) {
        transformBox.value.y = transformBox.value.y + (transformStartSize.value.height - newHeight)
      }
  }
  
  calculateSnapGuides()
}

const handleTransformEnd = () => {
  if (!isTransforming.value || !transformBox.value) return
  
  // Seçili elementleri güncelle
  selectedElements.value.forEach(elementId => {
    const element = props.layers.find(layer => layer.id === elementId)
    if (element) {
      element.properties.width = transformBox.value!.width
      element.properties.height = transformBox.value!.height
      element.properties.rotation = transformBox.value!.rotation
    }
  })
  
  isTransforming.value = false
  transformHandle.value = null
  calculateSnapGuides()
}

// Sağ tıklama menüsü
const showContextMenu = (event: MouseEvent) => {
  if (props.currentSubTool !== 'transform' || !selectedElements.value.size) return
  
  event.preventDefault()
  
  const menu = document.createElement('div')
  menu.className = 'transform-context-menu'
  menu.innerHTML = `
    <div class="menu-item" data-action="flip-h">Yatay Çevir</div>
    <div class="menu-item" data-action="flip-v">Dikey Çevir</div>
  `
  
  menu.style.position = 'fixed'
  menu.style.left = `${event.clientX}px`
  menu.style.top = `${event.clientY}px`
  
  document.body.appendChild(menu)
  
  const handleClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.classList.contains('menu-item')) {
      const action = target.dataset.action
      if (action === 'flip-h') {
        // Yatay çevirme
        if (transformBox.value) {
          transformBox.value.width *= -1
        }
      } else if (action === 'flip-v') {
        // Dikey çevirme
        if (transformBox.value) {
          transformBox.value.height *= -1
        }
      }
    }
    document.body.removeChild(menu)
    document.removeEventListener('click', handleClick)
  }
  
  document.addEventListener('click', handleClick)
}

// Select & Rotate Tool için mouse event handlers
const handleSelectRotateStart = (event: MouseEvent) => {
  if (props.currentSubTool !== 'select-rotate') return
  
  const rect = svgRef.value?.getBoundingClientRect()
  if (!rect) return
  
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  // Seçili katmanı bul
  const selectedLayer = props.layers.find(layer => layer.id === props.selectedLayerId)
  if (!selectedLayer) return
  
  // Döndürme merkezini hesapla
  const bbox = svgRef.value?.querySelector(`[data-layer-id="${selectedLayer.id}"]`)?.getBBox()
  if (!bbox) return
  
  rotationCenter.value = {
    x: bbox.x + bbox.width / 2,
    y: bbox.y + bbox.height / 2
  }
  
  // Başlangıç açısını hesapla
  rotationStartAngle.value = Math.atan2(y - rotationCenter.value.y, x - rotationCenter.value.x)
  currentRotation.value = selectedLayer.properties.rotation || 0
  
  isRotating.value = true
}

const handleSelectRotate = (event: MouseEvent) => {
  if (!isRotating.value || props.currentSubTool !== 'select-rotate') return
  
  const rect = svgRef.value?.getBoundingClientRect()
  if (!rect) return
  
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  // Mevcut açıyı hesapla
  const currentAngle = Math.atan2(y - rotationCenter.value.y, x - rotationCenter.value.x)
  let rotation = currentRotation.value + (currentAngle - rotationStartAngle.value) * (180 / Math.PI)
  
  // Shift ile 15° adımlarla döndür
  if (isShiftPressed.value) {
    rotation = Math.round(rotation / 15) * 15
  }
  
  // Seçili katmanı güncelle
  const selectedLayer = props.layers.find(layer => layer.id === props.selectedLayerId)
  if (selectedLayer) {
    selectedLayer.properties.rotation = rotation
  }
}

const handleSelectRotateEnd = () => {
  isRotating.value = false
}

// Hover efekti için
const handleLayerHover = (layerId: string) => {
  if (props.currentSubTool === 'select-rotate') {
    hoveredLayerId.value = layerId
  }
}

const handleLayerLeave = () => {
  hoveredLayerId.value = null
}

onMounted(() => {
  svgRef.value = document.querySelector('.drawing-svg')
  drawingLayerRef.value?.focus()
  window.addEventListener('keyup', handleKeyUp)
})

onUnmounted(() => {
  window.removeEventListener('keyup', handleKeyUp)
})
</script>

<style scoped>
.drawing-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: crosshair;
  outline: none;
}

.drawing-svg {
  width: 100%;
  height: 100%;
  pointer-events: all;
}

path.selected {
  stroke-width: 3;
  stroke: #007bff;
}

.anchor-point {
  cursor: move;
  transition: r 0.2s ease;
}

.anchor-point:hover {
  r: 6;
}

.handle-point {
  cursor: move;
  transition: r 0.2s ease;
}

.handle-point:hover {
  r: 5;
}

.transform-handle {
  cursor: pointer;
}

.handle-nw { cursor: nw-resize; }
.handle-ne { cursor: ne-resize; }
.handle-se { cursor: se-resize; }
.handle-sw { cursor: sw-resize; }
.handle-n { cursor: n-resize; }
.handle-e { cursor: e-resize; }
.handle-s { cursor: s-resize; }
.handle-w { cursor: w-resize; }
.handle-rotate { cursor: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2'><path d='M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83'/></svg>") 12 12, auto; }

.transform-context-menu {
  position: fixed;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 4px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

.menu-item {
  padding: 8px 16px;
  cursor: pointer;
}

.menu-item:hover {
  background-color: #f0f0f0;
}

.selection-frame {
  pointer-events: none;
}

.rotation-handle {
  cursor: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2'><path d='M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83'/></svg>") 12 12, auto;
}

.hover-frame {
  pointer-events: none;
}

path.hovered {
  stroke-width: 3;
  stroke: #666666;
}
</style> 