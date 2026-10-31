import { BOOKS_STORAGE_KEY, INITIAL_BOOK } from "./constants";
import type { Book } from "./types";
import { isBook } from "./validation";

export function loadBooks(): Book[] {
  try {
    const storedBooks = window.localStorage.getItem(BOOKS_STORAGE_KEY);
    if (storedBooks === null) {
      return [INITIAL_BOOK];
    }

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
