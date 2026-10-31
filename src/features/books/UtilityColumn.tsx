type UtilityColumnProps = {
  booksCount: number;
  isAddHovered: boolean;
  isDeleteMode: boolean;
  statusMessage: string;
  onAddBook: () => void;
  onDeleteMode: () => void;
  onAlphabeticalSort: () => void;
  onSetAddHovered: (value: boolean) => void;
};

export function UtilityColumn({
  booksCount,
  isAddHovered,
  isDeleteMode,
  statusMessage,
  onAddBook,
  onDeleteMode,
  onAlphabeticalSort,
  onSetAddHovered,
}: UtilityColumnProps) {
  return (
    <aside className="utility-column" aria-label="Desktop utilities">
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

      <button
        type="button"
        className="utility-action-button"
        onClick={onAlphabeticalSort}
        aria-label="Sort books alphabetically"
      >
        <span className="utility-action-button__icon utility-action-button__icon--sort" aria-hidden="true">
          A↕
        </span>
        <span className="utility-action-button__label">Alphabetical Sort</span>
      </button>

      {isDeleteMode && booksCount > 0 && <p className="utility-column__hint">Select a book to delete</p>}
      {statusMessage && (
        <p className="utility-column__status" role="alert">
          {statusMessage}
        </p>
      )}
    </aside>
  );
}
