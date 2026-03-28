"use client"

import { closestCenter, type CollisionDetection } from "@dnd-kit/core"
import {
  restrictToHorizontalAxis,
  restrictToParentElement,
  restrictToVerticalAxis
} from "@dnd-kit/modifiers"
import { horizontalListSortingStrategy, SortableContext, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { rankItem } from "@tanstack/match-sorter-utils"
import {
  type Cell,
  type FilterFn,
  flexRender,
  type Header,
  type Row,
  type SortingState,
  type Table
} from "@tanstack/react-table"
import {
  ChevronDown,
  ChevronsUpDown,
  ChevronUp,
  GripHorizontal,
  GripVertical,
  Search,
  X
} from "lucide-react"
import React, {
  type CSSProperties,
  type ReactNode,
  type RefObject,
  useCallback,
  useMemo
} from "react"

import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { ColumnsDropdown } from "./columns-dropdown"

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    shrink?: boolean
  }
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
}

export const fuzzyFilter: FilterFn<unknown> = (row, columnId, value) =>
  rankItem(row.getValue(columnId), value).passed

export function applyTableSortingChange(
  updaterOrValue: ((prev: SortingState) => SortingState) | SortingState,
  prev: SortingState
): SortingState {
  const next = typeof updaterOrValue === "function" ? updaterOrValue(prev) : updaterOrValue
  if (next.length === 2) {
    const prevSecondId = prev.length === 2 ? prev[1].id : null
    if (prevSecondId === next[1].id) return [next[0]]
    return [next[0], { desc: false, id: next[1].id }]
  }
  return next
}

export function DraggableCell<T>({
  cell,
  className
}: {
  cell: Cell<T, unknown>
  className?: string
}) {
  const { isDragging, setNodeRef, transform } = useSortable({
    data: { type: "column" },
    id: cell.column.id
  })
  const style: CSSProperties = {
    opacity: isDragging ? 0.5 : undefined,
    position: "relative",
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 1 : undefined
  }
  return (
    <td className={className} ref={setNodeRef} style={style}>
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </td>
  )
}

export function DraggableHeader<T>({
  fixedCols,
  header,
  isRatioPartner = false
}: {
  fixedCols: Set<string>
  header: Header<T, unknown>
  isRatioPartner?: boolean
}) {
  const { attributes, isDragging, listeners, setNodeRef, transform } = useSortable({
    data: { type: "column" },
    disabled: fixedCols.has(header.column.id),
    id: header.column.id
  })
  const style: CSSProperties = {
    opacity: isDragging ? 0.5 : 1,
    position: "relative",
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 1 : undefined
  }
  const shrink = header.column.columnDef.meta?.shrink
  const thClass =
    [fixedCols.has(header.column.id) && "!px-0", shrink && "w-px"].filter(Boolean).join(" ") ||
    undefined
  return (
    <th className={thClass} ref={setNodeRef} style={style}>
      {header.isPlaceholder ? null : (
        <div
          className={`flex items-center gap-1 ${header.column.getCanSort() ? "cursor-pointer select-none" : ""}`}
          onClick={header.column.getToggleSortingHandler()}
        >
          {!fixedCols.has(header.column.id) && (
            <span
              className="cursor-grab text-[#444] hover:text-[#777] active:cursor-grabbing"
              onClick={(e) => e.stopPropagation()}
              {...attributes}
              {...listeners}
            >
              <GripHorizontal size={13} />
            </span>
          )}
          <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
          {header.column.getCanSort() && (
            <span className="text-[#444]">
              {isRatioPartner ? (
                <span className="text-[11px] font-semibold leading-none">÷</span>
              ) : header.column.getIsSorted() === "asc" ? (
                <ChevronUp size={13} />
              ) : header.column.getIsSorted() === "desc" ? (
                <ChevronDown size={13} />
              ) : (
                <ChevronsUpDown size={13} />
              )}
            </span>
          )}
        </div>
      )}
    </th>
  )
}

export function normalizeColumnOrder(
  order: string[],
  middleCols: string[],
  fixedStart: string[],
  fixedEnd: string[] = []
): string[] {
  const middle = order.filter((id) => middleCols.includes(id))
  const missing = middleCols.filter((id) => !middle.includes(id))
  return [...fixedStart, ...middle, ...missing, ...fixedEnd]
}

export function Pct({ total, value }: { total?: number; value: number }) {
  if (!total || total <= 0) return null
  return <span className="ml-1.5 text-xs text-[#555]">{Math.round((value / total) * 100)}%</span>
}

export { formatNumber } from "../utils"

export function SortableRow<T extends { id: string }>({
  canReorder,
  columnOrder,
  dimmed = false,
  fixedCols = new Set(),
  row
}: {
  canReorder: boolean
  columnOrder: string[]
  dimmed?: boolean
  fixedCols?: Set<string>
  row: Row<T>
}) {
  const { attributes, isDragging, listeners, setNodeRef, transform } = useSortable({
    data: { type: "row" },
    disabled: !canReorder,
    id: row.original.id
  })

  return (
    <tr
      data-row-id={row.original.id}
      ref={setNodeRef}
      style={{
        opacity: isDragging ? 0.5 : 1,
        position: "relative",
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 1 : undefined
      }}
    >
      <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
        {row.getVisibleCells().map((cell) => {
          if (cell.column.id === "handle") {
            return (
              <td className={`px-0! w-px${dimmed ? " opacity-40" : ""}`} key={cell.id}>
                <span
                  className={`flex w-14 items-center justify-center ${canReorder ? "cursor-grab text-[#444] hover:text-[#777] active:cursor-grabbing" : "invisible pointer-events-none"}`}
                  {...(canReorder
                    ? {
                        ...attributes,
                        ...listeners,
                        onClick: (e: React.MouseEvent) => e.stopPropagation()
                      }
                    : {})}
                >
                  <GripVertical size={14} />
                </span>
              </td>
            )
          }
          const shouldDim = dimmed && cell.column.id !== "actions"
          const compact = fixedCols.has(cell.column.id)
          const shrink = !!cell.column.columnDef.meta?.shrink
          const cellClass =
            [shouldDim && "opacity-40", compact && "!px-0", shrink && "w-px"]
              .filter(Boolean)
              .join(" ") || undefined
          return <DraggableCell cell={cell} className={cellClass} key={cell.id} />
        })}
      </SortableContext>
    </tr>
  )
}

export function sortTableRows<T>(
  rows: T[],
  sorting: SortingState,
  getName: (row: T) => string,
  getNumeric: (row: T, columnId: string) => number
): T[] {
  if (sorting.length === 0) return rows
  if (sorting.length === 1) {
    const { desc, id } = sorting[0]
    return [...rows].sort((a, b) => {
      if (id === "name") {
        const cmp = getName(a).localeCompare(getName(b))
        return desc ? -cmp : cmp
      }
      const diff = getNumeric(a, id) - getNumeric(b, id)
      return desc ? -diff : diff
    })
  }
  const [s1, s2] = sorting
  return [...rows].sort((a, b) => {
    const aDen = getNumeric(a, s2.id)
    const bDen = getNumeric(b, s2.id)
    const numA = getNumeric(a, s1.id)
    const numB = getNumeric(b, s1.id)
    const ratioA = aDen !== 0 ? numA / aDen : numA > 0 ? Infinity : 0
    const ratioB = bDen !== 0 ? numB / bDen : numB > 0 ? Infinity : 0
    return s1.desc ? ratioB - ratioA : ratioA - ratioB
  })
}

export function TableToolbar<T>({
  globalFilter,
  onClearSort,
  onGlobalFilterChange,
  rightControls,
  showClearSort,
  table,
  title
}: {
  globalFilter: string
  onClearSort: () => void
  onGlobalFilterChange: (value: string) => void
  rightControls?: ReactNode
  showClearSort: boolean
  table: Table<T>
  title: string
}) {
  return (
    <div className="flex h-16 shrink-0 items-center gap-4 border-b border-[#1a1a1a] px-6">
      <span className="text-[12px] font-semibold uppercase tracking-wider text-[#888]">
        {title}
      </span>
      <div className="relative">
        <Input
          className={`w-40 md:w-56${globalFilter ? " [&_input]:pr-7" : ""}`}
          icon={<Search size={14} />}
          iconPosition="left"
          onChange={(e) => onGlobalFilterChange(e.target.value)}
          placeholder="Search…"
          type="text"
          value={globalFilter}
        />
        {globalFilter && (
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-[#555] hover:text-[#888]"
            onClick={() => onGlobalFilterChange("")}
            tabIndex={-1}
            type="button"
          >
            <X size={14} />
          </button>
        )}
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button
          className={`gap-1.5 font-semibold uppercase tracking-wider ${showClearSort ? "" : "invisible pointer-events-none"}`}
          onClick={onClearSort}
          size="sm"
          type="button"
        >
          <X size={13} />
          Clear sort
        </Button>
        {rightControls}
        <ColumnsDropdown table={table} />
      </div>
    </div>
  )
}

export function useTableDnd(
  activeTypeRef: RefObject<"column" | "row" | null>,
  fixedCols: Set<string>
) {
  const modifiers = useMemo(
    () => [
      (args: Parameters<typeof restrictToVerticalAxis>[0]) => {
        if (activeTypeRef.current === "column") {
          return restrictToParentElement({ ...args, transform: restrictToHorizontalAxis(args) })
        }
        if (activeTypeRef.current === "row") return restrictToVerticalAxis(args)
        return args.transform
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const collisionDetection = useCallback<CollisionDetection>(
    (args) => {
      const type = activeTypeRef.current
      if (type === "column") {
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(
            (c) => c.data.current?.type === "column" && !fixedCols.has(c.id as string)
          )
        })
      }
      if (type === "row") {
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(
            (c) => c.data.current?.type === "row"
          )
        })
      }
      return closestCenter(args)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return { collisionDetection, modifiers }
}
