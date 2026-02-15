

## Add Drag-and-Drop Reordering to Media Links

Add the ability to reorder media link cards by dragging them, using the same `@dnd-kit` library already installed and used elsewhere in the project (e.g., sortable links, sortable resources).

### What changes

**`src/components/rundown/MediaLinksSection.tsx`**

1. Import `DndContext`, `closestCenter`, `KeyboardSensor`, `PointerSensor`, `useSensor`, `useSensors` from `@dnd-kit/core`, and `SortableContext`, `rectSortingStrategy`, `arrayMove` from `@dnd-kit/sortable`.
2. Wrap the grid in a `DndContext` + `SortableContext` using the media link IDs.
3. Replace the plain `<a>` card with a new sortable wrapper component.
4. On `DragEnd`, compute the new order with `arrayMove` and call `onUpdate` with the reordered array.

**`src/components/rundown/SortableMediaCard.tsx`** (new file)

A small wrapper component using `useSortable` from `@dnd-kit/sortable`. It renders the existing media card content (thumbnail, title, remove button) inside a sortable container with a drag handle (grip icon) that appears on hover, matching the existing drag-handle pattern used in `SortableLink` and `SortableResourceCard`.

### Interaction

- A grip handle appears on hover in the top-left corner of each card.
- Drag a card to reorder; the new order persists immediately via `onUpdate`.
- Cards remain clickable links -- the grip handle is the drag target, so clicking the card still opens the URL.

