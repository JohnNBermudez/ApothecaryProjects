import type { Slot, ViewportSize } from "./types";
import { SLOT_GAP, SLOT_WIDTH, SHELF_ROWS } from "./constants";

export function findNearestSlot(slots: Slot[], x: number, y: number): Slot | undefined {
  return slots.reduce<Slot | undefined>((nearestSlot, slot) => {
    if (!nearestSlot) {
      return slot;
    }

    const slotDistance = (slot.x - x) ** 2 + (slot.y - y) ** 2;
    const nearestDistance = (nearestSlot.x - x) ** 2 + (nearestSlot.y - y) ** 2;
    return slotDistance < nearestDistance ? slot : nearestSlot;
  }, undefined);
}

export function createSlots(viewportSize: ViewportSize, imageScale: number): Slot[] {
  if (imageScale <= 0) {
    return [];
  }

  const imageLeft = (viewportSize.width - 662 * imageScale) / 2;
  const imageTop = (viewportSize.height - 696 * imageScale) / 2;
  const shelfLeft = imageLeft + 8 * imageScale;
  const shelfWidth = 646 * imageScale;
  const slotWidth = SLOT_WIDTH * imageScale;
  const columns = Math.max(1, Math.floor((shelfWidth + SLOT_GAP) / (slotWidth + SLOT_GAP)));
  const rowSlotsWidth = columns * slotWidth + (columns - 1) * SLOT_GAP;
  const firstSlotLeft = shelfLeft + (shelfWidth - rowSlotsWidth) / 2;

  return SHELF_ROWS.flatMap((row, rowIndex) =>
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
  );
}
