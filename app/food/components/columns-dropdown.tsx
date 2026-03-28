"use client"

import type { Column, Table } from "@tanstack/react-table"
import type { ReactNode } from "react"

import { Columns2, Square, SquareCheckBig } from "lucide-react"

import { Button } from "@/app/components/ui/button"
import { Float, FloatContent, FloatItem, FloatTrigger } from "@/app/components/ui/float"

type Props<TData> = {
  buttonLabel?: ReactNode
  className?: string
  getColumnLabel?: (column: Column<TData, unknown>) => string
  table: Table<TData>
}

export function ColumnsDropdown<TData>({
  buttonLabel = "Columns",
  className,
  getColumnLabel,
  table
}: Props<TData>) {
  const columns = table.getAllColumns().filter((column) => column.getCanHide())

  if (columns.length === 0) return null

  return (
    <Float>
      <FloatTrigger>
        <Button className="font-semibold uppercase tracking-wider" size="sm" type="button">
          <Columns2 size={13} />
          {buttonLabel}
        </Button>
      </FloatTrigger>

      <FloatContent align="center" className={["min-w-35", className].filter(Boolean).join(" ")}>
        {columns.map((column) => {
          const visible = column.getIsVisible()
          const label =
            getColumnLabel?.(column) ??
            (typeof column.columnDef.header === "string" ? column.columnDef.header : column.id)

          return (
            <FloatItem
              className={["flex items-center gap-2", visible ? "" : "text-[#555]"]
                .filter(Boolean)
                .join(" ")}
              closeOnSelect={false}
              key={column.id}
              onClick={column.getToggleVisibilityHandler()}
            >
              {visible ? (
                <SquareCheckBig className="shrink-0" size={13} />
              ) : (
                <Square className="shrink-0 text-[#555]" size={13} />
              )}
              <span>{label}</span>
            </FloatItem>
          )
        })}
      </FloatContent>
    </Float>
  )
}
