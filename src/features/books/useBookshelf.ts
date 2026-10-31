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
import { loadBooks } from "./storage";
import type { Book, DragState, Slot, ViewportSize } from "./types";

export function useBookshelf() {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState<ViewportSize>({ width: 0, height: 0 });
  const [books, setBooks] = useState<Book[]>(loadBooks);
  const [positions, setPositions] = useState<Record<string, number>>(() =>
    Object.fromEntries(books.map((book, index) => [book.id, index])),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [isAddHovered, setIsAddHovered] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    try {
      window.localStorage.setItem("apothecary-books", JSON.stringify(books));
    } catch (error) {
      console.error("Could not save books.", error);
      setStatusMessage("Books could not be saved on this device.");
    }
  }, [books]);

  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return;

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

  const imageScale = Math.min(
    viewportSize.width / BOOKSHELF_WIDTH,
    viewportSize.height / BOOKSHELF_HEIGHT,
  );
  const slots = createSlots(viewportSize, imageScale);

  const draggedItem = drag?.moved ? books.find((book) => book.id === drag.id) : undefined;
  const occupiedSlots = new Set(
    Object.entries(positions)
      .filter(([id]) => id !== draggedItem?.id)
      .map(([, slotIndex]) => slotIndex),
  );
  const availableSlots = slots.filter((slot) => !occupiedSlots.has(slot.index));
  const previewSlot = drag?.moved ? findNearestSlot(availableSlots, drag.x, drag.y) : undefined;

  const getItemPosition = (id: string) => {
    const itemDrag = drag?.id === id && drag.moved ? drag : null;
    if (itemDrag) {
      return { x: itemDrag.x, y: itemDrag.y };
    }

    const slot = slots[positions[id] ?? 0];
    return slot ? { x: slot.x, y: slot.y } : { x: 0, y: 0 };
  };

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

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag || drag.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - drag.pointerX;
    const deltaY = event.clientY - drag.pointerY;
    const moved = drag.moved || Math.hypot(deltaX, deltaY) >= DRAG_THRESHOLD;

    if (moved) {
      const x = drag.startX + deltaX;
      const y = drag.startY + deltaY;
      const freeSlots = slots.filter((slot) =>
        Object.entries(positions).every(([id, index]) => id === drag.id || index !== slot.index),
      );
      const nearestSlot = findNearestSlot(freeSlots, x, y);

      if (nearestSlot) {
        setPositions((previousPosition) => ({ ...previousPosition, [drag.id]: nearestSlot.index }));
      }
    }

    setSelectedId(drag.id);
    setDrag(null);
  };

  const handleAddBook = async () => {
    try {
      const selection = await window.apothecary.selectFile();
      const { filePath, fileName } = selection;
      if (selection.canceled || !filePath || !fileName) return;

      const nextSlot = slots.find((slot) => !Object.values(positions).includes(slot.index));
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

  const handleDeleteMode = () => {
    const nextDeleteMode = !isDeleteMode;
    setIsDeleteMode(nextDeleteMode);
    setStatusMessage(
      nextDeleteMode && books.length === 0 ? "There are no books to delete." : "",
    );
  };

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

  const handleAlphabeticalSort = () => {
    const sortedBooks = [...books].sort((first, second) =>
      first.name.localeCompare(second.name, undefined, { sensitivity: "base" }),
    );

    setBooks(sortedBooks);
    setPositions(Object.fromEntries(sortedBooks.map((book, index) => [book.id, index])));
    setDrag(null);
    setStatusMessage("");
  };

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
    setIsAddHovered,
    getItemPosition,
    handlePointerMove,
    handlePointerUp,
    handleAddBook,
    handleDeleteMode,
    handleDeleteBook,
    handleAlphabeticalSort,
    handleOpenBook,
    setDrag,
    setSelectedId,
  };
}
