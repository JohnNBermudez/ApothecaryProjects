/* Types for the bookshelf state and interactions */
export type ViewportSize = {
  width: number;
  height: number;
};

/* Type representing a book on the bookshelf */
export type Book = {
  id: string;
  name: string;
  filePath?: string;
  coverImage?: string;
  metadata?: Record<string, string>;
};

/* Type representing the state of a book being dragged on the bookshelf */
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

/* Type representing a slot on the bookshelf */
export type Slot = {
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
};
