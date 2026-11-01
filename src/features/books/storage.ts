import {
  BOOKS_STORAGE_KEY,
  BOOK_POSITIONS_STORAGE_KEY,
} from "./constants";
import type { Book } from "./types";
import { isBook, isRecord } from "./validation";

/* Load books from local storage */
export function loadBooks(): Book[] {
  try {
    const storedBooks = window.localStorage.getItem(BOOKS_STORAGE_KEY);
    if (storedBooks === null) {
      return [];
    }
    
    /* Parse the stored books from JSON */
    const parsedBooks: unknown = JSON.parse(storedBooks);
    if (Array.isArray(parsedBooks) && parsedBooks.every(isBook)) {
      // Discard the legacy built-in placeholder while retaining all saved user books.
      return parsedBooks.filter((book) => book.id !== "book" || book.name !== "Book");
    }

    throw new Error("Saved book data has an invalid format.");
  } catch (error) {
    console.error("Could not load saved books.", error);
    return [];
  }
}

/* Load book positions from local storage */
/* Keep locations keyed by stable Book IDs so sorting and future Book fields remain independent. */
export function loadBookPositions(books: Book[]): Record<string, number> {
  const defaultPositions = Object.fromEntries(books.map((book, index) => [book.id, index]));
  
  /* Attempt to load saved book positions from local storage */
  try {
    const storedPositions = window.localStorage.getItem(BOOK_POSITIONS_STORAGE_KEY);
    if (storedPositions === null) return defaultPositions;
    /* Parse the stored positions from JSON */
    const parsedPositions: unknown = JSON.parse(storedPositions);
    if (!isRecord(parsedPositions)) {
      throw new Error("Saved book positions have an invalid format.");
    }
    /* Initialize the positions object and track occupied slots */
    const positions: Record<string, number> = {};
    const occupiedSlots = new Set<number>();
    for (const book of books) {
      const slotIndex = parsedPositions[book.id];
      if (
        typeof slotIndex === "number" &&
        Number.isSafeInteger(slotIndex) &&
        slotIndex >= 0 &&
        !occupiedSlots.has(slotIndex)
      ) {
        positions[book.id] = slotIndex;
        occupiedSlots.add(slotIndex);
      }
    }

    /* Give new or invalidly positioned books the first available slots without moving saved books. */
    let nextSlot = 0;
    for (const book of books) {
      if (positions[book.id] !== undefined) continue;
      while (occupiedSlots.has(nextSlot)) nextSlot += 1;
      positions[book.id] = nextSlot;
      occupiedSlots.add(nextSlot);
    }

    /* Return the final positions object */
    return positions;
  } catch (error) {
    console.error("Could not load saved book positions.", error);
    return defaultPositions;
  }
}

/* Save books to local storage */
export function saveBooks(books: Book[]): void {
  window.localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(books));
}

/* Save book positions to local storage */
export function saveBookPositions(positions: Record<string, number>): void {
  window.localStorage.setItem(BOOK_POSITIONS_STORAGE_KEY, JSON.stringify(positions));
}
