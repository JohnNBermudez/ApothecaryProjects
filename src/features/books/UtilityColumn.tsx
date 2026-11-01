import { useState } from "react";
import { BOOKSHELF_HEIGHT } from "./constants";

/* Tooltip text for the file size sort button */
const FILE_SIZE_TOOLTIP_TEXT = "Sort books by file size from smallest to largest.";

/* Props for the UtilityColumn component */
type UtilityColumnProps = {
  booksCount: number;
  isAddHovered: boolean;
  isDeleteMode: boolean;
  statusMessage: string;
  left: number;
  top: number;
  scale: number;
  onAddBook: () => void;
  onDeleteMode: () => void;
  onAlphabeticalSort: () => void;
  onFileSizeSort: () => void;
  onFileTypeSort: () => void;
  onSetAddHovered: (value: boolean) => void;
};

/* UtilityColumn component */
export function UtilityColumn({
  booksCount,
  isAddHovered,
  isDeleteMode,
  statusMessage,
  left,
  top,
  scale,
  onAddBook,
  onDeleteMode,
  onAlphabeticalSort,
  onFileSizeSort,
  onFileTypeSort,
  onSetAddHovered,
}: UtilityColumnProps) {
  /* State for tracking if the file size sort button is hovered */
  const [isFileSizeHovered, setIsFileSizeHovered] = useState(false);

  /* Sort actions for the utility column */
  const sortActions = [
    {
      label: "Alphabetical Sort",
      ariaLabel: "Sort books by name alphabetically",
      icon: "A↕",
      onClick: onAlphabeticalSort,
    },
    {
      label: "File Size",
      ariaLabel: "Sort books by file size",
      icon: "↕",
      tooltip: FILE_SIZE_TOOLTIP_TEXT,
      onClick: onFileSizeSort,
    },
    { label: "File Type", ariaLabel: "Sort books by file type", icon: ".↕", onClick: onFileTypeSort },
  ];

  /* Render the utility column */
  return (
    <aside
      className="utility-column"
      style={{ left, top, height: BOOKSHELF_HEIGHT, transform: `scale(${scale})` }}
      aria-label="Desktop utilities"
    >
      <button
        type="button"
        className="add-book-button"
        onClick={onAddBook}
        onMouseEnter={() => onSetAddHovered(true)}
        onMouseLeave={() => onSetAddHovered(false)}
        aria-label="Add book"
      >
        {isAddHovered ? (
          <img
            key="animated"
            className="add-book-button__icon"
            src={new URL("../../../assets/icons/add-book-hover.svg", import.meta.url).href}
            alt=""
          />
        ) : (
          <img
            key="default"
            className="add-book-button__icon"
            src={new URL("../../../assets/icons/add-book.svg", import.meta.url).href}
            alt=""
          />
        )}
        <span className="add-book-button__label">Add Book</span>
      </button>

      <button
        type="button"
        className={`utility-action-button${isDeleteMode ? " utility-action-button--active" : ""}`}
        onClick={onDeleteMode}
        aria-pressed={isDeleteMode}
        aria-label={isDeleteMode ? "Exit delete mode" : "Delete book"}
      >
        <span className="utility-action-button__icon" aria-hidden="true">
          ×
        </span>
        <span className="utility-action-button__label">
          {isDeleteMode ? "Cancel Delete" : "Delete Book"}
        </span>
      </button>

      {sortActions.map((action) => (
        <button
          key={action.label}
          type="button"
          className="utility-action-button"
          onClick={action.onClick}
          aria-label={action.ariaLabel}
          aria-describedby={action.tooltip && isFileSizeHovered ? "file-size-sort-tooltip" : undefined}
          onMouseEnter={action.tooltip ? () => setIsFileSizeHovered(true) : undefined}
          onMouseLeave={action.tooltip ? () => setIsFileSizeHovered(false) : undefined}
        >
          <span className="utility-action-button__icon utility-action-button__icon--sort" aria-hidden="true">
            {action.icon}
          </span>
          <span className="utility-action-button__label">{action.label}</span>
        </button>
      ))}

      {/* Reuse the Delete Mode notification slot so hover text matches its styling and placement. */}
      {(isFileSizeHovered || (isDeleteMode && booksCount > 0)) && (
        <p
          id={isFileSizeHovered ? "file-size-sort-tooltip" : undefined}
          className="utility-column__hint"
          role="status"
        >
          {isFileSizeHovered ? FILE_SIZE_TOOLTIP_TEXT : "Select a book to delete"}
        </p>
      )}
      {statusMessage && (
        <p className="utility-column__status" role="alert">
          {statusMessage}
        </p>
      )}
    </aside>
  );
}
