import type { Slot, ViewportSize } from "./types";
import { SLOT_GAP, SLOT_WIDTH, SHELF_ROWS } from "./constants";

/* Find the nearest slot to a given point on the bookshelf */
export function findNearestSlot(slots: Slot[], x: number, y: number): Slot | undefined {
  return slots.reduce<Slot | undefined>((nearestSlot, slot) => {
    if (!nearestSlot) {
      return slot;
    }
    
    /* Calculate the squared distance from the given point to the current slot and the nearest slot */
    const slotDistance = (slot.x - x) ** 2 + (slot.y - y) ** 2;
    const nearestDistance = (nearestSlot.x - x) ** 2 + (nearestSlot.y - y) ** 2;
    return slotDistance < nearestDistance ? slot : nearestSlot;
  }, undefined);
}

/* Create the slots for the bookshelf based on the viewport size and image scale */
export function createSlots(viewportSize: ViewportSize, imageScale: number): Slot[] {
  if (imageScale <= 0) {
    return [];
  }
  /* Calculate the position and dimensions of the image on the viewport */
  const imageLeft = (viewportSize.width - 662 * imageScale) / 2;
  const imageTop = (viewportSize.height - 696 * imageScale) / 2;
  /* Calculate the position and width of the shelf within the image */
  const shelfLeft = imageLeft + 8 * imageScale;
  const shelfWidth = 646 * imageScale;
  const slotWidth = SLOT_WIDTH * imageScale;
  const columns = Math.max(1, Math.floor((shelfWidth + SLOT_GAP) / (slotWidth + SLOT_GAP)));
  const rowSlotsWidth = columns * slotWidth + (columns - 1) * SLOT_GAP;
  /* Calculate the position of the first slot on the shelf */
  const firstSlotLeft = shelfLeft + (shelfWidth - rowSlotsWidth) / 2;

  /* Generate the slots for each row on the shelf */
  return SHELF_ROWS.flatMap((row, rowIndex) =>
    Array.from({ length: columns }, (_, columnIndex) => {
      const width = slotWidth;
      const height = (row.bottom - row.top) * imageScale;
      
      /* Calculate the position of the current slot within the row */
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
