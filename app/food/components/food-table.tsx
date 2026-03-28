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
import { Eye, EyeOff, Plus } from "lucide-react"
import { useEffect, useMemo, useRef, useState, useTransition } from "react"

import type { DailyTarget, Food } from "@/db/schema"

import { Button } from "../../components/ui/button"
import { FormattedNumberInput } from "../../components/ui/formatted-number-input"
import { Toggle } from "../../components/ui/toggle"
import { addFoodToPlan, reorderFoods } from "../actions"
import { FoodActionsMenu } from "./food-actions-menu"
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

function getFoodNumericVal(food: Food, columnId: string, amounts: Record<string, number>): number {
  const amount = amounts[food.id] ?? food.baseAmount
  const ratio = Number(food.baseAmount) > 0 ? Number(amount) / Number(food.baseAmount) : 1
  switch (columnId) {
    case "calories":
      return Number(food.calories) * ratio
    case "carbohydrates":
      return Number(food.carbohydrates) * ratio
    case "fat":
      return Number(food.fat) * ratio
    case "protein":
      return Number(food.protein) * ratio
    default:
      return 0
  }
}

export const FOODS_TABLE_DEFAULT_ORDER = [
  "handle",
  "add",
  "amount",
  "name",
  "calories",
  "protein",
  "fat",
  "carbohydrates",
  "notes",
  "actions"
]

const FIXED_START = ["handle", "add"]
const FIXED_END = ["actions"]
const FIXED_COLS = new Set([...FIXED_START, ...FIXED_END])
const MIDDLE_COLS = ["amount", "name", "calories", "protein", "fat", "carbohydrates", "notes"]

type FoodsTableProps = {
  date: string
  foods: Food[]
  initialOrder?: string[]
  initialShowHidden?: boolean
  initialSorting?: SortingState
  initialVisibility?: Record<string, boolean>
  target: DailyTarget | undefined
}

export function FoodsTable({
  date,
  foods,
  initialOrder = FOODS_TABLE_DEFAULT_ORDER,
  initialShowHidden = false,
  initialSorting = [],
  initialVisibility = {},
  target
}: FoodsTableProps) {
  const [showHidden, setShowHidden] = useState(initialShowHidden)
  const [globalFilter, setGlobalFilter] = useState("")
  const [sorting, setSorting] = useState<SortingState>(initialSorting)
  const [columnVisibility, setColumnVisibility] =
    useState<Record<string, boolean>>(initialVisibility)
  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    normalizeColumnOrder(initialOrder, MIDDLE_COLS, FIXED_START, FIXED_END)
  )

  const [rowOrder, setRowOrder] = useState<string[]>(() => foods.map((f) => f.id))
  const [prevFoods, setPrevFoods] = useState(foods)
  const [amounts, setAmounts] = useState<Record<string, number>>(() =>
    Object.fromEntries(foods.map((f) => [f.id, Number(f.baseAmount)]))
  )
  const amountsRef = useRef(amounts)
  amountsRef.current = amounts
  const activeTypeRef = useRef<"column" | "row" | null>(null)

  if (foods !== prevFoods) {
    setPrevFoods(foods)
    setRowOrder(foods.map((f) => f.id))
  }

  useEffect(() => {
    setAmounts((prev) => {
      const additions: Record<string, number> = {}
      for (const f of foods) {
        if (!(f.id in prev)) additions[f.id] = Number(f.baseAmount)
      }
      return Object.keys(additions).length > 0 ? { ...prev, ...additions } : prev
    })
  }, [foods])

  useEffect(() => {
    const id = setTimeout(() => {
      document.cookie = `food-table=${encodeURIComponent(JSON.stringify({ columnOrder, columnVisibility, showHidden, sorting }))}; path=/; max-age=31536000; SameSite=Lax`
    }, 200)
    return () => clearTimeout(id)
  }, [sorting, columnVisibility, columnOrder, showHidden])

  const visibleFoods = useMemo(
    () => (showHidden ? foods : foods.filter((f) => !f.hidden)),
    [foods, showHidden]
  )

  const displayFoods = useMemo(() => {
    if (sorting.length > 0)
      return sortTableRows(
        visibleFoods,
        sorting,
        (f) => f.name,
        (f, col) => getFoodNumericVal(f, col, amounts)
      )
    const foodMap = new Map(visibleFoods.map((f) => [f.id, f]))
    return rowOrder.map((id) => foodMap.get(id)).filter((f): f is Food => f !== undefined)
  }, [visibleFoods, sorting, rowOrder, amounts])

  const columns = useMemo<ColumnDef<Food>[]>(
    () => [
      {
        cell: () => null,
        enableHiding: false,
        enableSorting: false,
        header: "",
        id: "handle"
      },
      {
        cell: ({ row }) => {
          const food = row.original
          return (
            <AddButtonCell
              amount={amountsRef.current[food.id] ?? Number(food.baseAmount)}
              date={date}
              food={food}
            />
          )
        },
        enableHiding: false,
        enableSorting: false,
        header: "",
        id: "add",
        meta: { shrink: true }
      },
      {
        cell: ({ row }) => {
          const food = row.original
          return (
            <AmountInputCell
              amount={amountsRef.current[food.id] ?? Number(food.baseAmount)}
              food={food}
              onAmountChange={(v) => {
                setAmounts((prev) => ({ ...prev, [food.id]: v }))
              }}
            />
          )
        },
        enableHiding: false,
        enableSorting: false,
        header: "Amount",
        id: "amount",
        meta: { shrink: true }
      },
      {
        accessorKey: "name",
        cell: ({ getValue }) => <span className="font-medium">{getValue() as string}</span>,
        enableHiding: false,
        filterFn: "fuzzy",
        header: "Name",
        id: "name"
      },
      {
        accessorFn: (food) => getFoodNumericVal(food, "calories", amountsRef.current),
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
        accessorFn: (food) => getFoodNumericVal(food, "protein", amountsRef.current),
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
        accessorFn: (food) => getFoodNumericVal(food, "fat", amountsRef.current),
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
        accessorFn: (food) => getFoodNumericVal(food, "carbohydrates", amountsRef.current),
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
        accessorKey: "notes",
        cell: ({ getValue }) => (
          <span className="max-w-35 overflow-hidden text-ellipsis text-[#888]">
            {(getValue() as null | string) ?? "—"}
          </span>
        ),
        enableSorting: false,
        header: "Notes",
        id: "notes"
      },
      {
        cell: ({ row }) => (
          <FoodActionsMenu foodId={row.original.id} isHidden={row.original.hidden} />
        ),
        enableHiding: false,
        enableSorting: false,
        filterFn: "fuzzy",
        header: "",
        id: "actions",
        meta: { shrink: true }
      }
    ],
    [date, target]
  )

  function handleSortingChange(
    updaterOrValue: ((prev: SortingState) => SortingState) | SortingState
  ) {
    setSorting((prev) => applyTableSortingChange(updaterOrValue, prev))
  }

  const table = useReactTable({
    autoResetPageIndex: false,
    columns,
    data: displayFoods,
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
            FIXED_START,
            FIXED_END
          )
        })
      } else if (type === "row") {
        const oldIndex = rowOrder.indexOf(active.id as string)
        const newIndex = rowOrder.indexOf(over.id as string)
        if (oldIndex !== -1 && newIndex !== -1) {
          const next = arrayMove(rowOrder, oldIndex, newIndex)
          setRowOrder(next)
          reorderFoods(next)
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
            icon={showHidden ? <Eye size={12} /> : <EyeOff size={12} />}
            onPressedChange={setShowHidden}
            pressed={showHidden}
          >
            Hidden
          </Toggle>
        }
        showClearSort={sorting.length > 0}
        table={table}
        title="Foods"
      />

      <div className="min-h-0 flex-1 overflow-auto [&_td]:px-6 [&_th]:px-6">
        <DndContext
          collisionDetection={collisionDetection}
          id="foods-dnd"
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
                      {globalFilter ? "No foods match your search." : "No foods yet."}
                    </td>
                  </tr>
                ) : (
                  tableRows.map((row) => (
                    <SortableRow
                      canReorder={canReorderRows}
                      columnOrder={columnOrder}
                      dimmed={row.original.hidden}
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

function AddButtonCell({ amount, date, food }: { amount: number; date: string; food: Food }) {
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      disabled={isPending}
      iconOnly
      onClick={() => {
        startTransition(async () => {
          await addFoodToPlan(food.id, date, amount)
        })
      }}
      type="button"
      variant="secondary"
    >
      <Plus className="text-green-400" size={15} />
    </Button>
  )
}

function AmountInputCell({
  amount,
  food,
  onAmountChange
}: {
  amount: number
  food: Food
  onAmountChange: (v: number) => void
}) {
  return (
    <FormattedNumberInput
      className="w-16"
      onCommit={(v) => {
        if (v > 0) onAmountChange(v)
      }}
      unit={food.unit !== "unit" ? food.unit : undefined}
      value={amount}
    />
  )
}
