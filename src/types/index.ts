export type Tool = 
  | 'select'
  | 'pen'
  | 'rectangle'
  | 'circle'
  | 'line'
  | 'arrow'
  | 'text';

export interface Point {
  x: number;
  y: number;
}

export interface ViewportState {
  offsetX: number;
  offsetY: number;
  zoom: number;
}

export interface BaseShape {
  id: string;
  type: Tool;
  x: number;
  y: number;
  width: number;
  height: number;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  roughness: number;
  rotation?: number;
  selected?: boolean;
}

export interface PenShape extends BaseShape {
  type: 'pen';
  points: Point[];
}

export interface RectangleShape extends BaseShape {
  type: 'rectangle';
}

export interface CircleShape extends BaseShape {
  type: 'circle';
}

export interface LineShape extends BaseShape {
  type: 'line';
  endX: number;
  endY: number;
}

export interface ArrowShape extends BaseShape {
  type: 'arrow';
  endX: number;
  endY: number;
}

export interface TextShape extends BaseShape {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
}

export type Shape = PenShape | RectangleShape | CircleShape | LineShape | ArrowShape | TextShape;

export interface CanvasState {
  shapes: Shape[];
  selectedShapeId: string | null;
  currentTool: Tool;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  roughness: number;
  fontSize: number;
  fontFamily: string;
  viewport: ViewportState;
}

export interface HistoryState {
  past: CanvasState[];
  present: CanvasState;
  future: CanvasState[];
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ExportOptions {
  format: 'png' | 'svg' | 'json';
  quality?: number;
  scale?: number;
}
