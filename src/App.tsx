import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import "./App.css";

const bookshelf = new URL("../assets/icons/bookshelf-empty.png", import.meta.url).href;

const DESKTOP_ITEMS = [
  { id: "book", name: "Book", icon: "📓" },
];

const BOOKSHELF_WIDTH = 662;
const BOOKSHELF_HEIGHT = 696;
const SLOT_WIDTH = 90;
const SLOT_GAP = 1;
const SHELF_ROWS = [
  { top: 8, bottom: 240 },
  { top: 248, bottom: 472 },
  { top: 488, bottom: 688 },
];
const DRAG_THRESHOLD = 4;

type ViewportSize = {
  width: number;
  height: number;
};

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

type Slot = {
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

function findNearestSlot(slots: Slot[], x: number, y: number): Slot | undefined {
  return slots.reduce<Slot | undefined>((nearest, slot) => {
    if (!nearest) return slot;

    const slotDistance = (slot.x - x) ** 2 + (slot.y - y) ** 2;
    const nearestDistance = (nearest.x - x) ** 2 + (nearest.y - y) ** 2;
    return slotDistance < nearestDistance ? slot : nearest;
  }, undefined);
}

export default function App() {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState<ViewportSize>({ width: 0, height: 0 });
  const [positions, setPositions] = useState<Record<string, number>>({ book: 0 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);

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

  const draggedItem = drag?.moved ? DESKTOP_ITEMS.find((item) => item.id === drag.id) : undefined;
  const occupiedSlots = new Set(
    Object.entries(positions)
      .filter(([id]) => id !== draggedItem?.id)
      .map(([, slot]) => slot),
  );
  const availableSlots = slots.filter((slot) => !occupiedSlots.has(slot.index));
  const previewSlot = drag?.moved ? findNearestSlot(availableSlots, drag.x, drag.y) : undefined;

  const getItemPosition = (id: string) => {
    const itemDrag = drag?.id === id && drag.moved ? drag : null;
    if (itemDrag) return { x: itemDrag.x, y: itemDrag.y };

    const slot = slots[positions[id] ?? 0];
    return slot ? { x: slot.x, y: slot.y } : { x: 0, y: 0 };
  };

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

  return (
    <main
      className="desktop"
      style={{ backgroundImage: `url(${bookshelf})` }}
      aria-label="Apothecary Projects desktop"
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

        {DESKTOP_ITEMS.map((item) => {
          const { x, y } = getItemPosition(item.id);
          const isDragged = drag?.id === item.id && drag.moved;

          return (
            <button
              key={item.id}
              type="button"
              className={`desktop-item${isDragged ? " desktop-item--dragging" : ""}`}
              style={{
                left: x,
                top: y,
                width: slots[positions[item.id] ?? 0]?.width,
                height: slots[positions[item.id] ?? 0]?.height,
              }}
              onPointerDown={(event) => {
                if (event.button !== 0) return;

                const slot = slots[positions[item.id] ?? 0];
                if (!slot) return;

                event.preventDefault();
                event.currentTarget.setPointerCapture(event.pointerId);
                setDrag({
                  id: item.id,
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
              aria-label={`${item.name} desktop icon`}
              aria-pressed={selectedId === item.id}
            >
              <span className="desktop-item__icon" aria-hidden="true">
                {item.icon}
              </span>
              <span className="desktop-item__tooltip" role="tooltip">
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </main>
  );
}
