import "./App.css";
import { BOOKSHELF_IMAGE } from "./features/books/constants";
import { BookshelfSurface } from "./features/books/BookshelfSurface";
import { UtilityColumn } from "./features/books/UtilityColumn";
import { useBookshelf } from "./features/books/useBookshelf";

/* This is the main application component that renders the desktop layout with the utility column and bookshelf surface. */
export default function App() {
  const {
    books,
    positions,
    slots,
    drag,
    previewSlot,
    selectedId,
    isAddHovered,
    isDeleteMode,
    statusMessage,
    utilityColumnLeft,
    utilityColumnTop,
    utilityColumnScale,
    surfaceRef,
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
  } = useBookshelf();

  /* Render the main desktop layout with the utility column and bookshelf surface. */
  return (
    /* Main desktop layout */
    <main className="desktop" aria-label="Apothecary Projects desktop">
      <UtilityColumn
        booksCount={books.length}
        isAddHovered={isAddHovered}
        isDeleteMode={isDeleteMode}
        statusMessage={statusMessage}
        left={utilityColumnLeft}
        top={utilityColumnTop}
        scale={utilityColumnScale}
        onAddBook={handleAddBook}
        onDeleteMode={handleDeleteMode}
        onAlphabeticalSort={handleAlphabeticalSort}
        onFileSizeSort={handleFileSizeSort}
        onFileTypeSort={handleFileTypeSort}
        onSetAddHovered={setIsAddHovered}
      />
      
      <section
        className="desktop-workspace"
        style={{ backgroundImage: `url(${BOOKSHELF_IMAGE})` }}
        aria-label="Bookshelf"
      >
        <BookshelfSurface
          surfaceRef={surfaceRef}
          books={books}
          positions={positions}
          slots={slots}
          drag={drag}
          previewSlot={previewSlot}
          isDeleteMode={isDeleteMode}
          selectedId={selectedId}
          getItemPosition={getItemPosition}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => setDrag(null)}
          onDeleteBook={handleDeleteBook}
          onOpenBook={handleOpenBook}
          onBookPointerDown={(event, book) => {
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
        />
      </section>
    </main>
  );
}
