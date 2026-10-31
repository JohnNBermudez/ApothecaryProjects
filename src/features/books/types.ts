export type ViewportSize = {
  width: number;
  height: number;
};

export type Book = {
  id: string;
  name: string;
  filePath?: string;
  coverImage?: string;
  metadata?: Record<string, string>;
};

export type DragState = {
  id: string;
  pointerId: number;
  pointerX: number;
  pointerY: number;
  startX: number;
  startY: number;
  x: number;
  y: number;
  moved: boolean;
};

export type Slot = {
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
};
