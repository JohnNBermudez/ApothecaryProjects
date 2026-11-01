import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import {
  BOOKSHELF_HEIGHT,
  BOOKSHELF_WIDTH,
  DRAG_THRESHOLD,
  SHELF_ROWS,
  SLOT_GAP,
  SLOT_WIDTH,
} from "./constants";
import { createSlots, findNearestSlot } from "./geometry";
import {
  loadBookPositions,
  loadBooks,
  saveBookPositions,
  saveBooks,
} from "./storage";
import type { Book, DragState, Slot, ViewportSize } from "./types";

/* Get the file extension from a file name */
function getFileExtension(name: string): string {
  const extensionStart = name.lastIndexOf(".");
  return extensionStart > 0 && extensionStart < name.length - 1
    ? name.slice(extensionStart).toLocaleLowerCase()
    : "";
}

/* Custom hook for managing the bookshelf state and interactions */
export function useBookshelf() {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState<ViewportSize>({ width: 0, height: 0 });
  const [books, setBooks] = useState<Book[]>(loadBooks);
  const [positions, setPositions] = useState<Record<string, number>>(() =>
    loadBookPositions(books),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [isAddHovered, setIsAddHovered] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  /* Persist the bookshelf state to local storage whenever books or positions change */
  useEffect(() => {
    // Persist the Book records and stable-ID position map together, including on window close.
    const persistBookshelf = (isClosing = false) => {
      let saveFailed = false;
      try {
        saveBooks(books);
      } catch (error) {
        console.error("Could not save books.", error);
        saveFailed = true;
      }

      try {
        saveBookPositions(positions);
      } catch (error) {
        console.error("Could not save book positions.", error);
        saveFailed = true;
      }

      if (saveFailed && !isClosing) {
        setStatusMessage("Books or their positions could not be saved on this device.");
      }
    };

    // Persist the bookshelf state on window close.
    const handleBeforeUnload = () => persistBookshelf(true);
    persistBookshelf();
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [books, positions]);

  /* Update the viewport size when the surface element is resized */
  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return;

    /* Update the viewport size based on the surface's current size */
    const updateSize = () => {
      setViewportSize({
        width: surface.clientWidth,
        height: surface.clientHeight,
      });
    };

    /* Observe changes to the surface element's size and update the viewport size accordingly */
    const observer = new ResizeObserver(updateSize);
    observer.observe(surface);
    updateSize();

    return () => observer.disconnect();
  }, []);

  /* Calculate the image scale and utility column positioning based on the viewport size */
  const imageScale = Math.min(
    viewportSize.width / BOOKSHELF_WIDTH,
    viewportSize.height / BOOKSHELF_HEIGHT,
  );
  // Match the toolbar's right edge to the left edge of the centered, scaled bookshelf image.
  const utilityColumnLeft = (viewportSize.width - BOOKSHELF_WIDTH * imageScale) / 2;
  const utilityColumnTop = (viewportSize.height - BOOKSHELF_HEIGHT * imageScale) / 2;
  const utilityColumnScale = imageScale || 1;
  const slots = createSlots(viewportSize, imageScale);

  /* Create the slots for the bookshelf based on the viewport size and image scale */
  const draggedItem = drag?.moved ? books.find((book) => book.id === drag.id) : undefined;
  const occupiedSlots = new Set(
    Object.entries(positions)
      .filter(([id]) => id !== draggedItem?.id)
      .map(([, slotIndex]) => slotIndex),
  );
  const availableSlots = slots.filter((slot) => !occupiedSlots.has(slot.index));
  const previewSlot = drag?.moved ? findNearestSlot(availableSlots, drag.x, drag.y) : undefined;

  /* Get the position of an item on the bookshelf, either from the current drag state or from the stored positions */
  const getItemPosition = (id: string) => {
    const itemDrag = drag?.id === id && drag.moved ? drag : null;
    if (itemDrag) {
      return { x: itemDrag.x, y: itemDrag.y };
    }
    /* If the item is not currently being dragged, retrieve its position from the stored positions */
    const slot = slots[positions[id] ?? 0];
    return slot ? { x: slot.x, y: slot.y } : { x: 0, y: 0 };
  };

  /* Handle pointer move events for dragging items on the bookshelf */
  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    setDrag((current) => {
      if (!current || current.pointerId !== event.pointerId) {
        return current;
      }

      const deltaX = event.clientX - current.pointerX;
      const deltaY = event.clientY - current.pointerY;
      const moved = current.moved || Math.hypot(deltaX, deltaY) >= DRAG_THRESHOLD;

      return {
        ...current,
        x: current.startX + deltaX,
        y: current.startY + deltaY,
        moved,
      };
    });
  };

  /* Handle pointer up events for dragging items on the bookshelf */
  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag || drag.pointerId !== event.pointerId) return;

    /* Calculate the delta between the current pointer position and the initial pointer position */
    const deltaX = event.clientX - drag.pointerX;
    const deltaY = event.clientY - drag.pointerY;
    const moved = drag.moved || Math.hypot(deltaX, deltaY) >= DRAG_THRESHOLD;

    /* If the item has been moved beyond the drag threshold, update its position on the bookshelf */
    if (moved) {
      const x = drag.startX + deltaX;
      const y = drag.startY + deltaY;
      /* Find the free slots on the bookshelf */
      const freeSlots = slots.filter((slot) =>
        Object.entries(positions).every(([id, index]) => id === drag.id || index !== slot.index),
      );
      /* Find the nearest free slot to the current drag position */
      const nearestSlot = findNearestSlot(freeSlots, x, y);

      /* If a nearest free slot is found, update the item's position on the bookshelf */
      if (nearestSlot) {
        setPositions((previousPosition) => ({ ...previousPosition, [drag.id]: nearestSlot.index }));
      }
    }

    setSelectedId(drag.id);
    setDrag(null);
  };

  /* Handle the addition of a new book to the bookshelf */
  const handleAddBook = async () => {
    try {
      const selection = await window.apothecary.selectFile();
      const { filePath, fileName } = selection;
      if (selection.canceled || !filePath || !fileName) return;

      /* Find the next available slot on the bookshelf */
      const nextSlot = slots.find((slot) => !Object.values(positions).includes(slot.index));
      /* If no available slot is found, display an error message */
      if (!nextSlot) {
        setStatusMessage("There is no empty space on the bookshelf.");
        return;
      }

      /* Create a new book object with a unique ID, name, and file path */
      const newBook: Book = {
        id: crypto.randomUUID(),
        name: fileName,
        filePath,
      };
      /* Add the new book to the bookshelf and update its position */
      setBooks((current) => [...current, newBook]);
      setPositions((current) => ({ ...current, [newBook.id]: nextSlot.index }));
      setSelectedId(newBook.id);
      setStatusMessage("");
    } catch (error) {
      console.error("Could not select a file for the new book.", error);
      setStatusMessage("The file could not be added to this book.");
    }
  };

  /* Handle the toggle of delete mode for the bookshelf */
  const handleDeleteMode = () => {
    const nextDeleteMode = !isDeleteMode;
    setIsDeleteMode(nextDeleteMode);
    setStatusMessage(
      nextDeleteMode && books.length === 0 ? "There are no books to delete." : "",
    );
  };

  /* Handle the deletion of a book from the bookshelf */
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

  /* Apply a new order to the books on the bookshelf */
  const applyBookOrder = (sortedBooks: Book[]) => {
    setBooks(sortedBooks);
    setPositions(Object.fromEntries(sortedBooks.map((book, index) => [book.id, index])));
    setDrag(null);
    setStatusMessage("");
  };

  /* Handle the alphabetical sorting of books on the bookshelf */
  const handleAlphabeticalSort = () => {
    const sortedBooks = [...books].sort((first, second) =>
      first.name.localeCompare(second.name, undefined, { sensitivity: "base" }),
    );
    applyBookOrder(sortedBooks);
  };

  /* Handle the sorting of books by file size on the bookshelf */
  const handleFileSizeSort = async () => {
    try {
      // Fetch sizes in the main process, but sort the original Book objects to preserve their metadata.
      const fileSizes = new Map<string, number>(
        await Promise.all(
          books.map(async (book) =>
            book.filePath
              ? ([book.id, await window.apothecary.getFileSize(book.filePath)] as const)
              : ([book.id, Number.POSITIVE_INFINITY] as const),
          ),
        ),
      );
      const sortedBooks = [...books].sort(
        (first, second) => fileSizes.get(first.id)! - fileSizes.get(second.id)!,
      );
      applyBookOrder(sortedBooks);
    } catch (error) {
      console.error("Could not sort books by file size.", error);
      setStatusMessage("Books could not be sorted by file size. Check that their files are still available.");
    }
  };

  /* Handle the sorting of books by file type on the bookshelf */
  const handleFileTypeSort = () => {
    const sortedBooks = [...books].sort((first, second) => {
      const firstType = getFileExtension(first.name);
      const secondType = getFileExtension(second.name);
      if (!firstType && secondType) return 1;
      if (firstType && !secondType) return -1;

      /* If both books have the same file type, sort by name as a secondary criterion */
      return (
        firstType.localeCompare(secondType, undefined, { sensitivity: "base" }) ||
        first.name.localeCompare(second.name, undefined, { sensitivity: "base" })
      );
    });
    applyBookOrder(sortedBooks);
  };

  /* Handle the opening of a book file from the bookshelf */
  const handleOpenBook = async (book: Book) => {
    if (!book.filePath) return;

    /* Attempt to open the book file using the system's default application */
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

  /* Return the bookshelf state and event handlers */
  return {
    books,
    positions,
    slots,
    drag,
    previewSlot,
    selectedId,
    isAddHovered,
    isDeleteMode,
    statusMessage,
    surfaceRef,
    utilityColumnLeft,
    utilityColumnTop,
    utilityColumnScale,
    setIsAddHovered,
    getItemPosition,
    handlePointerMove,
    handlePointerUp,
    handleAddBook,
    handleDeleteMode,
    handleDeleteBook,
    handleAlphabeticalSort,
    handleFileSizeSort,
    handleFileTypeSort,
    handleOpenBook,
    setDrag,
    setSelectedId,
  };
}
