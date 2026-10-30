import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import "./App.css";

const bookshelf = new URL("../assets/icons/bookshelf-empty.png", import.meta.url).href;

const BOOKS_STORAGE_KEY = "apothecary-books";
const INITIAL_BOOK: Book = { id: "book", name: "Book" };

const BOOKSHELF_WIDTH = 662;
const BOOKSHELF_HEIGHT = 696;
const SLOT_WIDTH = 90;
const SLOT_GAP = 1;
const SHELF_ROWS = [
  { top: 9, bottom: 237 },
  { top: 260, bottom: 470 },
  { top: 490, bottom: 686 },
];
const DRAG_THRESHOLD = 4;

/*Defines the size of the viewport */
type ViewportSize = {
  width: number;
  height: number;
};

/*Establishes the structure of a book object */
type Book = {
  id: string;
  name: string;
  filePath?: string;
  coverImage?: string;
  metadata?: Record<string, string>;
};

/*Defines the state of a drag operation */
type DragState = {
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

/* Defines the structure of a slot on the bookshelf */
type Slot = {
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

/* Checks if a value is a Record object by verifying the type and ensuring it's not null or an array. */
function isRecord(value: unknown): value is Record<string, unknown> 
{
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/* Checks if a value is a Book object by validating its properties */
function isBook(value: unknown): value is Book 
{
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    (value.filePath === undefined || typeof value.filePath === "string") &&
    (value.coverImage === undefined || typeof value.coverImage === "string") &&
    (value.metadata === undefined ||
      (isRecord(value.metadata) &&
        Object.values(value.metadata).every((entry) => typeof entry === "string")))
  );
}

/* Loads the books from local storage, returning an array of Book objects. 
   If no books are found or if the data is invalid, it returns an array with the INITIAL_BOOK. 
*/
function loadBooks(): Book[] {
  try {
    const storedBooks = window.localStorage.getItem(BOOKS_STORAGE_KEY);
    if (storedBooks === null) return [INITIAL_BOOK];

    const parsedBooks: unknown = JSON.parse(storedBooks);
    if (Array.isArray(parsedBooks) && parsedBooks.every(isBook)) {
      return parsedBooks;
    }
    throw new Error("Saved book data has an invalid format.");
  } catch (error) {
    console.error("Could not load saved books.", error);
    return [INITIAL_BOOK];
  }
}

/* Finds the nearest slot to a given (x, y) coordinate from an array of slots.
   It calculates the squared distance to avoid unnecessary square root calculations and returns the closest slot. 
   If no slots are available, it returns undefined.
*/
function findNearestSlot(slots: Slot[], x: number, y: number): Slot | undefined {
  return slots.reduce<Slot | undefined>((nearest, slot) => {
    if (!nearest) return slot;

    const slotDistance = (slot.x - x) ** 2 + (slot.y - y) ** 2;
    const nearestDistance = (nearest.x - x) ** 2 + (nearest.y - y) ** 2;
    return slotDistance < nearestDistance ? slot : nearest;
  }, undefined);
}

/* Renders the main application component by displaying the bookshelf */
export default function App() {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState<ViewportSize>({ width: 0, height: 0 });
  const [books, setBooks] = useState<Book[]>(loadBooks);
  const [positions, setPositions] = useState<Record<string, number>>(() =>
    Object.fromEntries(books.map((book, index) => [book.id, index])),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [isAddHovered, setIsAddHovered] = useState(false); /* Tracks whether the "Add Book" button is being hovered over */
  const [isDeleteMode, setIsDeleteMode] = useState(false); /* Tracks whether delete mode is enabled */
  const [statusMessage, setStatusMessage] = useState("");  /* Holds a status message to display to the user, such as errors or instructions */

  /* Triggers when the books state changes, saving the current list of books to local storage. 
     If an error occurs during saving, it logs the error and sets a status message. 
  */
  useEffect(() => {
    try {
      window.localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(books));
    } catch (error) {
      console.error("Could not save books.", error);
      setStatusMessage("Books could not be saved on this device.");
    }
  }, [books]);

  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return;

    /* Updates the viewport size when the surface is resized */
    const updateSize = () => {
      setViewportSize({
        width: surface.clientWidth,
        height: surface.clientHeight,
      });
    };

    const observer = new ResizeObserver(updateSize);
    observer.observe(surface);
    updateSize();

    return () => observer.disconnect();
  }, []);
/* Calculates the scaling and positioning of the bookshelf image and its slots based on the current viewport size.
   It determines the number of columns that can fit on the shelf and generates an array of Slot objects representing each slot's position and size.
*/
  const imageScale = Math.min(
    viewportSize.width / BOOKSHELF_WIDTH,
    viewportSize.height / BOOKSHELF_HEIGHT,
  );
  const imageLeft = (viewportSize.width - BOOKSHELF_WIDTH * imageScale) / 2;
  const imageTop = (viewportSize.height - BOOKSHELF_HEIGHT * imageScale) / 2;
  const shelfLeft = imageLeft + 8 * imageScale;
  const shelfWidth = 646 * imageScale;
  const slotWidth = SLOT_WIDTH * imageScale;
  const columns = Math.max(
    1,
    Math.floor((shelfWidth + SLOT_GAP) / (slotWidth + SLOT_GAP)),
  );
  const rowSlotsWidth = columns * slotWidth + (columns - 1) * SLOT_GAP;
  const firstSlotLeft = shelfLeft + (shelfWidth - rowSlotsWidth) / 2;
  const slots: Slot[] =
    imageScale > 0
      ? SHELF_ROWS.flatMap((row, rowIndex) =>
          Array.from({ length: columns }, (_, columnIndex) => {
            const width = slotWidth;
            const height = (row.bottom - row.top) * imageScale;
            return {
              index: rowIndex * columns + columnIndex,
              x: firstSlotLeft + columnIndex * (slotWidth + SLOT_GAP) + width / 2,
              y: imageTop + row.bottom * imageScale - height / 2,
              width,
              height,
            };
          }),
        )
      : [];

  /* Determines the currently dragged item (if any) and calculates the available slots for dropping.
      It filters out occupied slots and finds the nearest available slot to the current drag position.
  */
  const draggedItem = drag?.moved ? books.find((book) => book.id === drag.id) : undefined;
  const occupiedSlots = new Set(
    Object.entries(positions)
      .filter(([id]) => id !== draggedItem?.id)
      .map(([, slot]) => slot),
  );
  const availableSlots = slots.filter((slot) => !occupiedSlots.has(slot.index));
  const previewSlot = drag?.moved ? findNearestSlot(availableSlots, drag.x, drag.y) : undefined;

  /* Calculates the position of a book item based on its ID.
     If the item is currently being dragged, it returns the drag position.
     Otherwise, it returns the position of the slot assigned to the book.
  */
  const getItemPosition = (id: string) => {
    const itemDrag = drag?.id === id && drag.moved ? drag : null;
    if (itemDrag) return { x: itemDrag.x, y: itemDrag.y };

    const slot = slots[positions[id] ?? 0];
    return slot ? { x: slot.x, y: slot.y } : { x: 0, y: 0 };
  };

  /* Handles pointer events for dragging and dropping items.
     It updates the drag state based on the event type and position, and calculates the available slots for dropping.
  */
  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    setDrag((current) => {
      if (!current || current.pointerId !== event.pointerId) return current;

      const deltaX = event.clientX - current.pointerX;
      const deltaY = event.clientY - current.pointerY;
      const moved =
        current.moved || Math.hypot(deltaX, deltaY) >= DRAG_THRESHOLD;

      return {
        ...current,
        x: current.startX + deltaX,
        y: current.startY + deltaY,
        moved,
      };
    });
  };

  /* Handles the pointer up event, finalizing the drag operation.
     It checks if the dragged item has moved and finds the nearest available slot to drop it into.
     If a valid slot is found, it updates the positions state and sets the selected item.
  */
  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag || drag.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - drag.pointerX;
    const deltaY = event.clientY - drag.pointerY;
    const moved = drag.moved || Math.hypot(deltaX, deltaY) >= DRAG_THRESHOLD;

    if (moved) {
      const x = drag.startX + deltaX;
      const y = drag.startY + deltaY;
      const freeSlots = slots.filter((slot) => {
        return Object.entries(positions).every(
          ([id, index]) => id === drag.id || index !== slot.index,
        );
      });
      const nearestSlot = findNearestSlot(freeSlots, x, y);

      if (nearestSlot) {
        setPositions((previous) => ({ ...previous, [drag.id]: nearestSlot.index }));
      }
    }

    setSelectedId(drag.id);
    setDrag(null);
  };

  /* Handles the addition of a new book to the bookshelf.
     It prompts the user to select a file, creates a new book object, and updates the state accordingly.
   */
  const handleAddBook = async () => {
    try {
      const selection = await window.apothecary.selectFile();
      const { filePath, fileName } = selection;
      if (selection.canceled || !filePath || !fileName) return;

      const nextSlot = slots.find(
        (slot) => !Object.values(positions).includes(slot.index),
      );
      if (!nextSlot) {
        setStatusMessage("There is no empty space on the bookshelf.");
        return;
      }

      const newBook: Book = {
        id: crypto.randomUUID(),
        name: fileName,
        filePath,
      };
      setBooks((current) => [...current, newBook]);
      setPositions((current) => ({ ...current, [newBook.id]: nextSlot.index }));
      setSelectedId(newBook.id);
      setStatusMessage("");
    } catch (error) {
      console.error("Could not select a file for the new book.", error);
      setStatusMessage("The file could not be added to this book.");
    }
  };

  /* Toggles the delete mode and updates the status message accordingly. */
  const handleDeleteMode = () => {
    const nextDeleteMode = !isDeleteMode;
    setIsDeleteMode(nextDeleteMode);
    setStatusMessage(
      nextDeleteMode && books.length === 0 ? "There are no books to delete." : "",
    );
  };

  /* Handles the deletion of a book from the bookshelf. */
  const handleDeleteBook = (id: string) => {
    const remainingBooks = books.filter((book) => book.id !== id);
    if (remainingBooks.length === books.length) return;

    const remainingPositions = Object.fromEntries(
      [...remainingBooks]
        .sort((first, second) => positions[first.id] - positions[second.id])
        .map((book, index) => [book.id, index]),
    );

    setBooks(remainingBooks);
    setPositions(remainingPositions);
    setSelectedId((current) => (current === id ? null : current));
    setIsDeleteMode(false);
    setStatusMessage("");
  };

  /* Handles the alphabetical sorting of books on the bookshelf. */
  const handleAlphabeticalSort = () => {
    const sortedBooks = [...books].sort((first, second) =>
      first.name.localeCompare(second.name, undefined, { sensitivity: "base" }),
    );

    setBooks(sortedBooks);
    setPositions(Object.fromEntries(sortedBooks.map((book, index) => [book.id, index])));
    setDrag(null);
    setStatusMessage("");
  };

  /* Handles opening a book file in the default application. */
  const handleOpenBook = async (book: Book) => {
    if (!book.filePath) return;

    try {
      const error = await window.apothecary.openFile(book.filePath);
      if (error) {
        console.error("Could not open the selected book file.", error);
        setStatusMessage(`Could not open ${book.name}: ${error}`);
      } else {
        setStatusMessage("");
      }
    } catch (error) {
      console.error("Could not open the selected book file.", error);
      setStatusMessage(`Could not open ${book.name}.`);
    }
  };
  /* Renders the main application interface, including the utility column and the bookshelf workspace.
     It displays buttons for adding, deleting, and sorting books, as well as the current status message. */
  return (
    <main className="desktop" aria-label="Apothecary Projects desktop">
      <aside className="utility-column" aria-label="Desktop utilities">
        <button
          type="button"
          className="add-book-button"
          onClick={handleAddBook}
          onMouseEnter={() => setIsAddHovered(true)}
          onMouseLeave={() => setIsAddHovered(false)}
          aria-label="Add book"
        >
          {isAddHovered ? (
            <img
              key="animated"
              className="add-book-button__icon"
              src={new URL("../assets/icons/add-book-hover.svg", import.meta.url).href} /* This is where Add Book icon idle animation is located */
              alt=""
            />
          ) : (
            <img
              key="default"
              className="add-book-button__icon"
              src={new URL("../assets/icons/add-book.svg", import.meta.url).href} /* This is where Add Book button icon is located */
              alt=""
            />
          )}
          <span className="add-book-button__label">Add Book</span>
        </button>
        <button
          type="button"
          className={`utility-action-button${isDeleteMode ? " utility-action-button--active" : ""}`}
          onClick={handleDeleteMode}
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
          onClick={handleAlphabeticalSort}
          aria-label="Sort books alphabetically"
        >
          <span className="utility-action-button__icon utility-action-button__icon--sort" aria-hidden="true">
            A↕
          </span>
          <span className="utility-action-button__label">Alphabetical Sort</span>
        </button>
        {isDeleteMode && books.length > 0 && (
          <p className="utility-column__hint">Select a book to delete</p>
        )}
        {statusMessage && (
          <p className="utility-column__status" role="alert">
            {statusMessage}
          </p>
        )}
      </aside>
      <section
        className="desktop-workspace"
        style={{ backgroundImage: `url(${bookshelf})` }}
        aria-label="Bookshelf"
      >
        <div
          ref={surfaceRef}
          className="desktop-surface"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => setDrag(null)}
        >
          {drag?.moved &&
            availableSlots.map((slot) => (
              <div
                key={slot.index}
                className={`drop-slot${previewSlot?.index === slot.index ? " drop-slot--target" : ""}`}
                style={{ left: slot.x, top: slot.y, width: slot.width, height: slot.height }}
                aria-hidden="true"
              />
            ))}

          {books.map((book) => {
            const { x, y } = getItemPosition(book.id);
            const isDragged = drag?.id === book.id && drag.moved;

            return (
              <button
                key={book.id}
                type="button"
                className={`desktop-item${isDragged ? " desktop-item--dragging" : ""}${isDeleteMode ? " desktop-item--deletable" : ""}`}
                style={{
                  left: x,
                  top: y,
                  width: slots[positions[book.id] ?? 0]?.width,
                  height: slots[positions[book.id] ?? 0]?.height,
                }}
                onPointerDown={(event) => {
                  if (event.button !== 0) return;
                  if (isDeleteMode) return;

                  const slot = slots[positions[book.id] ?? 0];
                  if (!slot) return;

                  event.preventDefault();
                  event.currentTarget.setPointerCapture(event.pointerId);
                  setDrag({
                    id: book.id,
                    pointerId: event.pointerId,
                    pointerX: event.clientX,
                    pointerY: event.clientY,
                    startX: slot.x,
                    startY: slot.y,
                    x: slot.x,
                    y: slot.y,
                    moved: false,
                  });
                }}
                onClick={() => {
                  if (isDeleteMode) handleDeleteBook(book.id);
                }}
                onDoubleClick={(event) => {
                  if (isDeleteMode) {
                    event.preventDefault();
                    return;
                  }
                  void handleOpenBook(book);
                }}
                aria-label={`${book.name} desktop icon`}
                aria-pressed={selectedId === book.id}
              >
                <span className="desktop-item__icon" aria-hidden="true">
                  📓
                </span>
                <span className="desktop-item__tooltip" role="tooltip">
                  {book.name}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}
