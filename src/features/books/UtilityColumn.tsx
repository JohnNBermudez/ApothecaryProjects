import { useState } from "react";
import { BOOKSHELF_HEIGHT } from "./constants";

/* Tooltip text for the file size sort button */
const FILE_SIZE_TOOLTIP_TEXT = "Sort books by file size from smallest to largest.";
const COPY_FILEPATH_TOOLTIP_TEXT = "Copy a book's file path to your clipboard.";

/* Props for the UtilityColumn component */
type UtilityColumnProps = {
  booksCount: number;
  isAddHovered: boolean;
  isDeleteMode: boolean;
  isCopyFilepathMode: boolean;
  statusMessage: string;
  left: number;
  top: number;
  scale: number;
  onAddBook: () => void;
  onDeleteMode: () => void;
  onCopyFilepathMode: () => void;
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
  isCopyFilepathMode,
  statusMessage,
  left,
  top,
  scale,
  onAddBook,
  onDeleteMode,
  onCopyFilepathMode,
  onAlphabeticalSort,
  onFileSizeSort,
  onFileTypeSort,
  onSetAddHovered,
}: UtilityColumnProps) {
  const [hoveredTooltipId, setHoveredTooltipId] = useState<string | null>(null);

  /* Shared action descriptors keep toolbar additions consistent and easy to extend. */
  const toolbarActions = [
    {
      id: "delete-book",
      label: isDeleteMode ? "Cancel Delete" : "Delete Book",
      ariaLabel: isDeleteMode ? "Exit delete mode" : "Delete book",
      icon: (
        <span className="utility-action-button__icon" aria-hidden="true">
          ×
        </span>
      ),
      onClick: onDeleteMode,
      isActive: isDeleteMode,
    },
    {
      id: "copy-filepath",
      label: isCopyFilepathMode ? "Cancel Copy" : "Copy Filepath",
      ariaLabel: isCopyFilepathMode ? "Exit copy filepath mode" : "Copy filepath",
      icon: (
        <svg
          className="utility-action-button__book-copy-icon"
          viewBox="0 0 32 32"
          aria-hidden="true"
        >
          <path d="M17 3h11v23H17z" fill="#9b6634" stroke="#f0c77e" strokeWidth="1.5" />
          <path d="M20 7h5M20 11h5" stroke="#f5deb3" strokeWidth="1.2" />
          <path d="M4 7h16v22H4z" fill="#754621" stroke="#ffe0a0" strokeWidth="1.7" />
          <path d="M8 8v20M11 12h6M11 16h6" stroke="#f5deb3" strokeWidth="1.3" />
        </svg>
      ),
      onClick: onCopyFilepathMode,
      isActive: isCopyFilepathMode,
      tooltip: COPY_FILEPATH_TOOLTIP_TEXT,
    },
    {
      id: "alphabetical-sort",
      label: "Alphabetical Sort",
      ariaLabel: "Sort books by name alphabetically",
      icon: "A↕",
      onClick: onAlphabeticalSort,
    },
    {
      id: "file-size-sort",
      label: "File Size",
      ariaLabel: "Sort books by file size",
      icon: "↕",
      tooltip: FILE_SIZE_TOOLTIP_TEXT,
      onClick: onFileSizeSort,
    },
    {
      id: "file-type-sort",
      label: "File Type",
      ariaLabel: "Sort books by file type",
      icon: ".↕",
      onClick: onFileTypeSort,
    },
  ];

  const modeNotification = isDeleteMode
    ? booksCount > 0
      ? "Select a book to delete"
      : ""
    : isCopyFilepathMode
      ? "Select a book to copy its file path."
      : "";

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

      {toolbarActions.map((action) => {
        const isHovered = hoveredTooltipId === action.id;
        return (
          <button
            key={action.id}
            type="button"
            className={`utility-action-button${action.isActive ? " utility-action-button--active" : ""}`}
            onClick={action.onClick}
            aria-label={action.ariaLabel}
            aria-pressed={action.isActive}
            aria-describedby={action.tooltip && isHovered ? `${action.id}-tooltip` : undefined}
            onMouseEnter={() => setHoveredTooltipId(action.tooltip ? action.id : null)}
            onMouseLeave={() => setHoveredTooltipId(null)}
          >
            {typeof action.icon === "string" ? (
              <span
                className="utility-action-button__icon utility-action-button__icon--sort"
                aria-hidden="true"
              >
                {action.icon}
              </span>
            ) : action.icon}
            <span className="utility-action-button__label">{action.label}</span>
          </button>
        );
      })}

      {/* Hover descriptions replace the persistent mode message in the same notification slot. */}
      {(hoveredTooltipId || modeNotification) && (
        <p
          id={hoveredTooltipId ? `${hoveredTooltipId}-tooltip` : undefined}
          className="utility-column__hint"
          role="status"
        >
          {hoveredTooltipId === "copy-filepath"
            ? COPY_FILEPATH_TOOLTIP_TEXT
            : hoveredTooltipId === "file-size-sort"
              ? FILE_SIZE_TOOLTIP_TEXT
              : modeNotification}
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
