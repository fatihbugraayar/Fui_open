// Temel araç tipleri
export type ToolType = 'select' | 'move' | 'pen' | 'rectangle' | 'circle' | 'text' | 'image' | 'line' | 'polygon' | 'star' | 'pencil' | 'eraser' | 'eyedropper' | 'gradient' | 'measure' | 'path' | 'slice';

// Kalem aracı alt tipleri
export type PenSubToolType = 'free' | 'curved' | 'straight';

// Seçim aracı alt tipleri
export type SelectSubToolType = 'select' | 'select-rotate' | 'transform';

// Canvas boyut türü
export interface CanvasSize {
  width: number;
  height: number;
}

// Çizim özellikleri
export interface DrawingProperties {
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  opacity?: number;
  rotation?: number;
  path?: string;  // SVG path data
  text?: string;  // Text content
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  imageUrl?: string;
  buttonText?: string;
  bgColor?: string;
  textColor?: string;
}

// Çizim noktası
export interface Point {
  x: number;
  y: number;
}

// Araç tanımı
export interface Tool {
  id: ToolType;
  name: string;
  shortcut: string;
  icon: string;
}

// Alt araç tanımı
export interface SubTool {
  id: PenSubToolType | SelectSubToolType;
  name: string;
  icon: string;
}

// Araç durumu
export interface ToolState {
  activeTool: ToolType;
  activeSubTool?: PenSubToolType;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
}

// Dönüşüm özellikleri
export interface Transform {
  rotation: number;
  scaleX: number;
  scaleY: number;
}

// Stil özellikleri
export interface StyleProperties {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  visible?: boolean;
  locked?: boolean;
}
