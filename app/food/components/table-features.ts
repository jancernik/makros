import { rankItem } from "@tanstack/match-sorter-utils"
import {
  columnFilteringFeature,
  columnOrderingFeature,
  columnVisibilityFeature,
  createFilteredRowModel,
  globalFilteringFeature,
  metaHelper,
  rowSortingFeature,
  tableFeatures
} from "@tanstack/react-table"

function fuzzyFilter(
  row: { getValue: (columnId: string) => unknown },
  columnId: string,
  value: string
) {
  return rankItem(row.getValue(columnId), value).passed
}

export const tableFeatureSet = tableFeatures({
  columnFilteringFeature,
  columnMeta: metaHelper<{ shrink?: boolean }>(),
  columnOrderingFeature,
  columnVisibilityFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: { fuzzy: fuzzyFilter },
  globalFilteringFeature,
  rowSortingFeature
})

export type TableFeatureSet = typeof tableFeatureSet
