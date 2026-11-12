import type { CSSProperties, PointerEvent as ReactPointerEvent, RefObject } from "react";
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
  isCopyFilepathMode: boolean;
  selectedId: string | null;
  hoveredBook: Book | null;
  copiedFeedback: { id: string; token: number } | null;
  filePathBarStyle: CSSProperties;
  getItemPosition: (id: string) => { x: number; y: number };
  onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerCancel: () => void;
  onDeleteBook: (id: string) => void;
  onCopyBook: (book: Book) => void;
  onOpenBook: (book: Book) => void;
  onBookMouseEnter: (book: Book) => void;
  onBookMouseLeave: () => void;
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
  isCopyFilepathMode,
  selectedId,
  hoveredBook,
  copiedFeedback,
  filePathBarStyle,
  getItemPosition,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onDeleteBook,
  onCopyBook,
  onOpenBook,
  onBookMouseEnter,
  onBookMouseLeave,
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
      {/* Keep the hovered path in the center divider, inset from the bookshelf's decorative edges. */}
      {hoveredBook && (
        <p
          className="bookshelf-filepath-bar"
          style={filePathBarStyle}
          title={hoveredBook.filePath ?? "No file path available"}
          aria-label={hoveredBook.filePath ?? "No file path available"}
          role="status"
          tabIndex={0}
        >
          {hoveredBook.filePath ?? "No file path available"}
        </p>
      )}

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
            isCopyFilepathMode={isCopyFilepathMode}
            isSelected={selectedId === book.id}
            position={position}
            copiedFeedbackToken={copiedFeedback?.id === book.id ? copiedFeedback.token : undefined}
            onPointerDown={onBookPointerDown}
            onMouseEnter={onBookMouseEnter}
            onMouseLeave={onBookMouseLeave}
            onClick={(currentBook) => {
              if (isDeleteMode) {
                onDeleteBook(currentBook.id);
              } else if (isCopyFilepathMode) {
                onCopyBook(currentBook);
              }
            }}
            onDoubleClick={onOpenBook}
          />
        );
      })}
    </div>
  );
}
