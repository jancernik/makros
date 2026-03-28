"use client"

import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core"
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  verticalListSortingStrategy
} from "@dnd-kit/sortable"
import {
  type ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  type SortingState,
  useReactTable
} from "@tanstack/react-table"
import { Eye, EyeOff, X } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"

import type { DailyTarget } from "@/db/schema"

import type { getDayPlanByDate } from "../queries"

import { SubmitButton } from "../../components/submit-button"
import { Toggle } from "../../components/ui/toggle"
import { removePlanItem, reorderPlanItems } from "../actions"
import { PlanAmountInputs } from "./plan-amount-inputs"
import {
  applyTableSortingChange,
  DraggableHeader,
  formatNumber,
  fuzzyFilter,
  normalizeColumnOrder,
  Pct,
  SortableRow,
  sortTableRows,
  TableToolbar,
  useTableDnd
} from "./table-utils"

type PlanItem = NonNullable<Awaited<ReturnType<typeof getDayPlanByDate>>>["items"][number]

function getPlanItemNumericVal(item: PlanItem, columnId: string): number {
  const ratio = item.food.baseAmount > 0 ? item.amount / item.food.baseAmount : 0
  switch (columnId) {
    case "calories":
      return ratio * item.food.calories
    case "carbohydrates":
      return ratio * item.food.carbohydrates
    case "fat":
      return ratio * item.food.fat
    case "protein":
      return ratio * item.food.protein
    default:
      return 0
  }
}

export const PLAN_TABLE_DEFAULT_ORDER = [
  "handle",
  "delete",
  "amounts",
  "name",
  "calories",
  "protein",
  "fat",
  "carbohydrates",
  "notes"
]

const FIXED_START = ["handle", "delete"]
const FIXED_END: string[] = []
const FIXED_COLS = new Set([...FIXED_START, ...FIXED_END])
const MIDDLE_COLS = ["amounts", "name", "calories", "protein", "fat", "carbohydrates", "notes"]

type Props = {
  initialOrder?: string[]
  initialShowConsumed?: boolean
  initialSorting?: SortingState
  initialVisibility?: Record<string, boolean>
  plan: Awaited<ReturnType<typeof getDayPlanByDate>>
  target: DailyTarget | undefined
}

export function DayPlanTable({
  initialOrder = PLAN_TABLE_DEFAULT_ORDER,
  initialShowConsumed = true,
  initialSorting = [],
  initialVisibility = {},
  plan,
  target
}: Props) {
  const items = useMemo(() => plan?.items ?? [], [plan])
  const [globalFilter, setGlobalFilter] = useState("")
  const [sorting, setSorting] = useState<SortingState>(initialSorting)
  const [columnVisibility, setColumnVisibility] =
    useState<Record<string, boolean>>(initialVisibility)
  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    normalizeColumnOrder(initialOrder, MIDDLE_COLS, FIXED_START)
  )

  const [showConsumed, setShowConsumed] = useState(initialShowConsumed)
  const [rowOrder, setRowOrder] = useState<string[]>(() => items.map((i) => i.id))
  const [prevItems, setPrevItems] = useState(items)
  const activeTypeRef = useRef<"column" | "row" | null>(null)

  if (items !== prevItems) {
    setPrevItems(items)
    setRowOrder(items.map((i) => i.id))
  }

  useEffect(() => {
    const id = setTimeout(() => {
      document.cookie = `plan-table=${encodeURIComponent(JSON.stringify({ columnOrder, columnVisibility, showConsumed, sorting }))}; path=/; max-age=31536000; SameSite=Lax`
    }, 200)
    return () => clearTimeout(id)
  }, [sorting, columnVisibility, columnOrder, showConsumed])

  const displayItems = useMemo(() => {
    const visible = showConsumed ? items : items.filter((i) => i.consumedAmount < i.amount)
    if (sorting.length > 0)
      return sortTableRows(visible, sorting, (i) => i.food.name, getPlanItemNumericVal)
    const itemMap = new Map(visible.map((i) => [i.id, i]))
    return rowOrder.map((id) => itemMap.get(id)).filter((i): i is PlanItem => i !== undefined)
  }, [items, sorting, rowOrder, showConsumed])

  const columns = useMemo<ColumnDef<PlanItem>[]>(
    () => [
      {
        cell: () => null,
        enableHiding: false,
        enableSorting: false,
        header: "",
        id: "handle"
      },
      {
        cell: ({ row }) => (
          <form action={removePlanItem.bind(null, row.original.id)}>
            <SubmitButton iconOnly variant="secondary">
              <X className="text-red-400" size={14} />
            </SubmitButton>
          </form>
        ),
        enableHiding: false,
        enableSorting: false,
        header: "",
        id: "delete",
        meta: { shrink: true }
      },
      {
        cell: ({ row }) => {
          const item = row.original
          return (
            <PlanAmountInputs
              amount={item.amount}
              consumedAmount={item.consumedAmount}
              itemId={item.id}
              unit={item.food.unit}
            />
          )
        },
        enableHiding: false,
        enableSorting: false,
        header: "Amount / Consumed",
        id: "amounts",
        meta: { shrink: true }
      },
      {
        accessorFn: (item) => item.food.name,
        cell: ({ getValue, row }) => {
          const done = row.original.consumedAmount >= row.original.amount
          return (
            <span className={`font-medium${done ? " line-through" : ""}`}>
              {getValue() as string}
            </span>
          )
        },
        enableHiding: false,
        filterFn: "fuzzy",
        header: "Name",
        id: "name"
      },
      {
        accessorFn: (item) => getPlanItemNumericVal(item, "calories"),
        cell: ({ getValue }) => {
          const v = getValue() as number
          return (
            <>
              {formatNumber(v)}
              <Pct total={target?.calories} value={v} />
            </>
          )
        },
        header: "Cals",
        id: "calories"
      },
      {
        accessorFn: (item) => getPlanItemNumericVal(item, "protein"),
        cell: ({ getValue }) => {
          const v = getValue() as number
          return (
            <>
              {formatNumber(v)}
              <Pct total={target?.protein} value={v} />
            </>
          )
        },
        header: "Prot",
        id: "protein"
      },
      {
        accessorFn: (item) => getPlanItemNumericVal(item, "fat"),
        cell: ({ getValue }) => {
          const v = getValue() as number
          return (
            <>
              {formatNumber(v)}
              <Pct total={target?.fat} value={v} />
            </>
          )
        },
        header: "Fat",
        id: "fat"
      },
      {
        accessorFn: (item) => getPlanItemNumericVal(item, "carbohydrates"),
        cell: ({ getValue }) => {
          const v = getValue() as number
          return (
            <>
              {formatNumber(v)}
              <Pct total={target?.carbohydrates} value={v} />
            </>
          )
        },
        header: "Carbs",
        id: "carbohydrates"
      },
      {
        accessorFn: (item) => item.food.notes,
        cell: ({ getValue }) => (
          <span className="max-w-35 overflow-hidden text-ellipsis text-[#888]">
            {(getValue() as null | string) ?? "—"}
          </span>
        ),
        enableSorting: false,
        header: "Notes",
        id: "notes"
      }
    ],
    [target]
  )

  function handleSortingChange(
    updaterOrValue: ((prev: SortingState) => SortingState) | SortingState
  ) {
    setSorting((prev) => applyTableSortingChange(updaterOrValue, prev))
  }

  const table = useReactTable({
    autoResetPageIndex: false,
    columns,
    data: displayItems,
    filterFns: { fuzzy: fuzzyFilter },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "fuzzy",
    isMultiSortEvent: (e) => (e as MouseEvent).shiftKey,
    manualSorting: true,
    maxMultiSortColCount: 2,
    onColumnOrderChange: setColumnOrder,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: handleSortingChange,
    state: { columnOrder, columnVisibility, globalFilter, sorting }
  })

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor)
  )
  const { collisionDetection, modifiers } = useTableDnd(activeTypeRef, FIXED_COLS)

  function handleDragStart(event: DragStartEvent) {
    activeTypeRef.current = event.active.data.current?.type ?? null
  }

  function handleDragEnd(event: DragEndEvent) {
    const type = event.active.data.current?.type
    const { active, over } = event

    if (active && over && active.id !== over.id) {
      if (type === "column") {
        setColumnOrder((order) => {
          const oldIndex = order.indexOf(active.id as string)
          const newIndex = order.indexOf(over.id as string)
          return normalizeColumnOrder(
            arrayMove(order, oldIndex, newIndex),
            MIDDLE_COLS,
            FIXED_START
          )
        })
      } else if (type === "row") {
        const oldIndex = rowOrder.indexOf(active.id as string)
        const newIndex = rowOrder.indexOf(over.id as string)
        if (oldIndex !== -1 && newIndex !== -1) {
          const next = arrayMove(rowOrder, oldIndex, newIndex)
          setRowOrder(next)
          reorderPlanItems(next)
        }
      }
    }

    activeTypeRef.current = null
  }

  const tableRows = table.getRowModel().rows
  const tableRowIds = useMemo(() => tableRows.map((r) => r.original.id), [tableRows])
  const canReorderRows = sorting.length === 0

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <TableToolbar
        globalFilter={globalFilter}
        onClearSort={() => setSorting([])}
        onGlobalFilterChange={setGlobalFilter}
        rightControls={
          <Toggle
            icon={showConsumed ? <Eye size={12} /> : <EyeOff size={12} />}
            onPressedChange={setShowConsumed}
            pressed={showConsumed}
          >
            Consumed
          </Toggle>
        }
        showClearSort={sorting.length > 0}
        table={table}
        title="Plan"
      />

      <div className="min-h-0 flex-1 overflow-auto [&_td]:px-6 [&_th]:px-6">
        <DndContext
          collisionDetection={collisionDetection}
          id="plan-dnd"
          modifiers={modifiers}
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
          sensors={sensors}
        >
          <table>
            <thead className="sticky top-0 z-10 bg-black">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
                    {headerGroup.headers.map((header) => (
                      <DraggableHeader
                        fixedCols={FIXED_COLS}
                        header={header}
                        isRatioPartner={sorting.length === 2 && sorting[1].id === header.column.id}
                        key={header.id}
                      />
                    ))}
                  </SortableContext>
                </tr>
              ))}
            </thead>
            <tbody>
              <SortableContext items={tableRowIds} strategy={verticalListSortingStrategy}>
                {tableRows.length === 0 ? (
                  <tr>
                    <td className="text-[#888]" colSpan={columnOrder.length}>
                      {globalFilter
                        ? "No items match your search."
                        : "No items yet. Add foods from the list."}
                    </td>
                  </tr>
                ) : (
                  tableRows.map((row) => (
                    <SortableRow
                      canReorder={canReorderRows}
                      columnOrder={columnOrder}
                      dimmed={row.original.consumedAmount >= row.original.amount}
                      fixedCols={FIXED_COLS}
                      key={row.id}
                      row={row}
                    />
                  ))
                )}
              </SortableContext>
            </tbody>
          </table>
        </DndContext>
      </div>
    </div>
  )
}
