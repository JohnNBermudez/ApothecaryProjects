import type { PointerEvent as ReactPointerEvent } from "react";
import type { Book, Slot } from "./types";

type BookItemProps = {
  book: Book;
  slot?: Slot;
  isDragged: boolean;
  isDeleteMode: boolean;
  isSelected: boolean;
  position: { x: number; y: number };
  onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>, book: Book) => void;
  onClick: (book: Book) => void;
  onDoubleClick: (book: Book) => void;
};

export function BookItem({
  book,
  slot,
  isDragged,
  isDeleteMode,
  isSelected,
  position,
  onPointerDown,
  onClick,
  onDoubleClick,
}: BookItemProps) {
  return (
    <button
      type="button"
      className={`desktop-item${isDragged ? " desktop-item--dragging" : ""}${isDeleteMode ? " desktop-item--deletable" : ""}`}
      style={{
        left: position.x,
        top: position.y,
        width: slot?.width,
        height: slot?.height,
      }}
      onPointerDown={(event) => onPointerDown(event, book)}
      onClick={() => onClick(book)}
      onDoubleClick={(event) => {
        if (isDeleteMode) {
          event.preventDefault();
          return;
        }
        onDoubleClick(book);
      }}
      aria-label={`${book.name} desktop icon`}
      aria-pressed={isSelected}
    >
      <span className="desktop-item__icon" aria-hidden="true">
        📓
      </span>
      <span className="desktop-item__tooltip" role="tooltip">
        {book.name}
      </span>
    </button>
  );
}
