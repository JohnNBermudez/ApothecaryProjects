import type { Book } from "./types";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isBook(value: unknown): value is Book {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    (value.filePath === undefined || typeof value.filePath === "string") &&
    (value.coverImage === undefined || typeof value.coverImage === "string") &&
    (value.metadata === undefined ||
      (isRecord(value.metadata) && Object.values(value.metadata).every((entry) => typeof entry === "string")))
  );
}
