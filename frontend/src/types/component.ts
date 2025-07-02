// Bileşen konumu için tip tanımı
export interface Position {
  x: number;
  y: number;
}

// Temel bileşen özellikleri
export interface BaseComponent {
  id: string;
  type: string;
  position: Position;
  width: number;
  height: number;
  rotation: number;
  scale: {
    x: number;
    y: number;
  };
  selected: boolean;
  visible: boolean;
  locked: boolean;
}

// Çizim bileşeni
export interface DrawingComponent extends BaseComponent {
  type: 'drawing';
  paths: Array<{
    points: Array<{ x: number; y: number }>;
    stroke: string;
    strokeWidth: number;
    fill: string;
  }>;
}

// Metin bileşeni
export interface TextComponent extends BaseComponent {
  type: 'text';
  content: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  alignment: 'left' | 'center' | 'right';
}

// Şekil bileşeni
export interface ShapeComponent extends BaseComponent {
  type: 'shape';
  shapeType: 'rectangle' | 'circle' | 'triangle';
  fill: string;
  stroke: string;
  strokeWidth: number;
}

// Çizgi bileşeni
export interface LineComponent extends BaseComponent {
  type: 'line';
  points: [number, number, number, number]; // [x1, y1, x2, y2]
  stroke: string;
  strokeWidth: number;
}

// Çokgen bileşeni
export interface PolygonComponent extends BaseComponent {
  type: 'polygon';
  centerX: number;
  centerY: number;
  radius: number;
  sides: number; // 3-12 arası
  fill: string;
  stroke: string;
  strokeWidth: number;
}

// Yıldız bileşeni
export interface StarComponent extends BaseComponent {
  type: 'star';
  centerX: number;
  centerY: number;
  outerRadius: number;
  innerRadius: number;
  numRays: number; // 3-20 arası
  fill: string;
  stroke: string;
  strokeWidth: number;
}

// Serbest çizim bileşeni (Kurşun kalem)
export interface PencilComponent extends BaseComponent {
  type: 'pencil';
  points: number[]; // [x1, y1, x2, y2, x3, y3, ...]
  stroke: string;
  strokeWidth: number;
  smoothing: boolean;
}

// Görüntü bileşeni
export interface ImageComponent extends BaseComponent {
  type: 'image';
  src: string;
  imageWidth: number;
  imageHeight: number;
  opacity: number;
  filters?: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    blur?: number;
  };
}

// Gradyan bileşeni
export interface GradientComponent extends BaseComponent {
  type: 'gradient';
  gradientType: 'linear' | 'radial';
  startColor: string;
  endColor: string;
  startPoint: Position;
  endPoint: Position;
  stops?: Array<{
    offset: number;
    color: string;
  }>;
}

// Yol (Path) bileşeni - Gelişmiş çizim için
export interface PathComponent extends BaseComponent {
  type: 'path';
  pathData: string; // SVG path data
  fill: string;
  stroke: string;
  strokeWidth: number;
  fillRule?: 'nonzero' | 'evenodd';
}

// Tüm bileşen tipleri için union tip
export type Component = 
  | DrawingComponent 
  | TextComponent 
  | ShapeComponent 
  | LineComponent
  | PolygonComponent
  | StarComponent
  | PencilComponent
  | ImageComponent
  | GradientComponent
  | PathComponent;

// Bileşen seçimi için tip
export interface Selection {
  components: string[]; // Seçili bileşenlerin ID'leri
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// Taşıma işlemi için tip
export interface MoveOperation {
  componentId: string;
  startPosition: Position;
  endPosition: Position;
  timestamp: number;
}