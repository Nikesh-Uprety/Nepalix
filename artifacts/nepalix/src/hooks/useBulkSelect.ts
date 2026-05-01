import { useMemo, useState } from "react";

export function useBulkSelect(initialSelectedIds?: Iterable<string>) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(initialSelectedIds ?? []),
  );

  const selectedCount = selectedIds.size;

  const selectedArray = useMemo(() => Array.from(selectedIds), [selectedIds]);

  function toggleOne(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleAll(ids: string[]) {
    setSelectedIds((current) => {
      const next = new Set(current);
      const everySelected = ids.length > 0 && ids.every((id) => next.has(id));

      if (everySelected) {
        for (const id of ids) {
          next.delete(id);
        }
      } else {
        for (const id of ids) {
          next.add(id);
        }
      }

      return next;
    });
  }

  function clearAll() {
    setSelectedIds(new Set());
  }

  function isAllSelected(ids: string[]) {
    return ids.length > 0 && ids.every((id) => selectedIds.has(id));
  }

  return {
    selectedIds,
    selectedArray,
    selectedCount,
    toggleOne,
    toggleAll,
    clearAll,
    isAllSelected,
  };
}
