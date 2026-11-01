import type { PointerEvent as ReactPointerEvent, RefObject } from "react";
import { BookItem } from "./BookItem";
import type { Book, DragState, Slot } from "./types";

/* Props for the BookshelfSurface component */
type BookshelfSurfaceProps = {
  surfaceRef: RefObject<HTMLDivElement | null>;
  books: Book[];
  positions: Record<string, number>;
  slots: Slot[];
  drag: DragState | null;
  previewSlot?: Slot;
  isDeleteMode: boolean;
  selectedId: string | null;
  getItemPosition: (id: string) => { x: number; y: number };
  onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerCancel: () => void;
  onDeleteBook: (id: string) => void;
  onOpenBook: (book: Book) => void;
  onBookPointerDown: (event: ReactPointerEvent<HTMLButtonElement>, book: Book) => void;
};

/* BookshelfSurface component renders the bookshelf and handles book interactions */
export function BookshelfSurface({
  surfaceRef,
  books,
  positions,
  slots,
  drag,
  previewSlot,
  isDeleteMode,
  selectedId,
  getItemPosition,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onDeleteBook,
  onOpenBook,
  onBookPointerDown,
}: BookshelfSurfaceProps) {
  /* Render the bookshelf surface with all books and drop slots */
  return (
    <div
      ref={surfaceRef}
      className="desktop-surface"
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      {drag?.moved &&
        slots.map((slot) => {
          const isPreview = previewSlot?.index === slot.index;
          return (
            <div
              key={slot.index}
              className={`drop-slot${isPreview ? " drop-slot--target" : ""}`}
              style={{ left: slot.x, top: slot.y, width: slot.width, height: slot.height }}
              aria-hidden="true"
            />
          );
        })}

      {books.map((book) => {
        const position = getItemPosition(book.id);
        const slot = slots[positions[book.id] ?? 0];
        const isDragged = drag?.id === book.id && drag.moved;

        return (
          <BookItem
            key={book.id}
            book={book}
            slot={slot}
            isDragged={isDragged}
            isDeleteMode={isDeleteMode}
            isSelected={selectedId === book.id}
            position={position}
            onPointerDown={onBookPointerDown}
            onClick={(currentBook) => {
              if (isDeleteMode) {
                onDeleteBook(currentBook.id);
              }
            }}
            onDoubleClick={onOpenBook}
          />
        );
      })}
    </div>
  );
}
