import type { PointerEvent as ReactPointerEvent } from "react";
import type { Book, Slot } from "./types";

let labelMeasurementContext: CanvasRenderingContext2D | null | undefined;

/* Truncate the book name to fit within the available width, adding an ellipsis if necessary */
function truncateBookName(
  name: string,
  availableWidth: number,
): { text: string; fontSize: number } {
  /* If the available width is non-positive, return the original name with a default font size */
  if (availableWidth <= 0) return { text: name, fontSize: 13 };

  /* Initialize the canvas context for measuring text width if it hasn't been done already */
  labelMeasurementContext ??= document.createElement("canvas").getContext("2d");
  if (!labelMeasurementContext) return { text: name, fontSize: 13 };

  /* Calculate the available text width after accounting for padding */
  const availableTextWidth = Math.max(0, availableWidth - 16);
  let fontSize = 13;
  /* Function to set the font for the canvas context */
  const setFont = () => {
    if (labelMeasurementContext) {
      labelMeasurementContext.font = `${fontSize}px "Segoe UI", sans-serif`;
    }
  };
  setFont();
  if (labelMeasurementContext.measureText(name).width <= availableTextWidth) {
    return { text: name, fontSize };
  }

  /* The marker plus the extension's leading dot produce the requested two-dot display */
  const ellipsis = ".";
  const extensionStart = name.lastIndexOf(".");
  const extension =
    extensionStart > 0 && extensionStart < name.length - 1
      ? name.slice(extensionStart)
      : "";

  if (extension) {
    /* Reduce the font only as much as needed to keep the ellipsis and full extension visible */
    setFont();
    const suffixWidth = labelMeasurementContext.measureText(`${ellipsis}${extension}`).width;
    if (suffixWidth > availableTextWidth && suffixWidth > 0) {
      fontSize *= availableTextWidth / suffixWidth;
      setFont();
    }
  }

  const stem = extension ? name.slice(0, extensionStart) : name;
  /* If there is no extension, ensure the ellipsis fits within the available width */
  if (!extension) {
    const ellipsisWidth = labelMeasurementContext.measureText(ellipsis).width;
    if (ellipsisWidth > availableTextWidth && ellipsisWidth > 0) {
      fontSize *= availableTextWidth / ellipsisWidth;
      setFont();
    }
  }

  /* Perform a binary search to find the maximum number of characters that can fit within the available width */
  let low = 0;
  let high = stem.length;
  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    if (
      labelMeasurementContext.measureText(`${stem.slice(0, middle)}${ellipsis}${extension}`).width <=
      availableTextWidth
    ) {
      low = middle;
    } else {
      high = middle - 1;
    }
  }

  /* Return the truncated text and the calculated font size */
  return {
    text: `${stem.slice(0, low)}${ellipsis}${extension}`,
    fontSize,
  };
}

/* Props for the BookItem component */
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

/* BookItem component renders a book item on the desktop */
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
  /* Truncate the book name to fit within the available width */
  const displayedName = truncateBookName(book.name, slot?.width ?? 0);
  
  /* Render the book item */
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
      <span className="desktop-item__tooltip" style={{ fontSize: displayedName.fontSize }} role="tooltip">
        {displayedName.text}
      </span>
    </button>
  );
}
