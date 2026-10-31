import type { Book } from "./types";

export const BOOKS_STORAGE_KEY = "apothecary-books";
export const INITIAL_BOOK: Book = { id: "book", name: "Book" };
export const BOOKSHELF_WIDTH = 662;
export const BOOKSHELF_HEIGHT = 696;
export const SLOT_WIDTH = 90;
export const SLOT_GAP = 1;
export const DRAG_THRESHOLD = 4;
export const SHELF_ROWS = [
  { top: 9, bottom: 237 },
  { top: 260, bottom: 470 },
  { top: 490, bottom: 686 },
];
export const BOOKSHELF_IMAGE = new URL("../../../assets/icons/bookshelf-empty.png", import.meta.url).href;
