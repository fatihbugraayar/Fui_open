// UI Element (Layer) modeli - Simplified Canvas System
export interface Layer {
  id: string;
  type: 'rectangle' | 'circle' | 'text' | 'line' | 'image' | 'polygon' | 'star';
  name: string;
  workspaceId: string; // Canvas ID'si olarak kullanılır
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  properties: {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    opacity?: number;
    // Text properties
    text?: string;
    fontSize?: number;
    fontFamily?: string;
    fontStyle?: string;
    align?: string;
    // Line properties  
    points?: number[];
    lineCap?: string;
    lineJoin?: string;
    // Image properties
    imageUrl?: string;
    // Generic properties
    [key: string]: any;
  };
  visible?: boolean;
  locked?: boolean;
}

// Canvas modeli - Simplified System (Workspace yerine)
export interface Canvas {
  id: string;
  name: string;
  width: number;
  height: number;
  backgroundColor: string;
  layers: Layer[];
}

// Workspace modeli - Geriye uyumluluk için (deprecated)
export interface Workspace {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  layers: Layer[];
  backgroundColor?: string;
  isMainWorkspace?: boolean;
  order: number;
}

// Frame modeli (Artboard) - Deprecated, geriye uyumluluk için
export interface Frame {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  layers: Layer[];
  backgroundColor?: string;
}

// Proje modeli - Simplified Canvas System
export interface Project {
  id: string;
  name: string;
  canvas?: Canvas; // Ana canvas
  // Geriye uyumluluk için deprecated fields
  workspaces: Workspace[];
  frames: Frame[];
  createdAt: Date;
  updatedAt: Date;
}
