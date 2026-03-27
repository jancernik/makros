import type { ComponentProps } from "react"

export type InputFieldProps = BaseInputProps &
  CommonProps & {
    multiline?: false
    rows?: never
  }

export type InputProps = InputFieldProps | TextareaFieldProps

type BaseInputProps = Omit<ComponentProps<"input">, "size" | "type"> & {
  type?: InputType
}

type CommonProps = {
  className?: string
  description?: string
  error?: string
  label?: string
  size?: "lg" | "md" | "sm"
  textAlign?: "center" | "left" | "right"
  unit?: string
  unitPosition?: "left" | "right"
}

type InputType = "date" | "email" | "number" | "password" | "search" | "tel" | "text" | "url"

type TextareaFieldProps = CommonProps &
  ComponentProps<"textarea"> & {
    multiline: true
    rows?: number
  }

const omitCommon = <T extends InputProps>({
  className: _className,
  description: _description,
  error: _error,
  label: _label,
  multiline: _multiline,
  rows: _rows,
  size: _size,
  textAlign: _textAlign,
  unit: _unit,
  unitPosition: _unitPosition,
  ...rest
}: T) => rest

export function Input(props: InputProps) {
  const {
    className,
    description,
    error,
    label,
    size = "md",
    textAlign = "left",
    unit,
    unitPosition = "right"
  } = props

  const id = props.id
  const unitPositionClass = unitPosition === "left" ? "left-[0.6rem]" : "right-[0.6rem]"
  const unitStyle = unit
    ? unitPosition === "left"
      ? { paddingLeft: `calc(${unit.length}ch + 0.9rem)` }
      : { paddingRight: `calc(${unit.length}ch + 0.9rem)` }
    : undefined
  const errorBorder = error ? "border-red-900! focus:border-red-700!" : "focus:border-[#555]"

  const textAlignClass =
    textAlign === "center" ? "text-center" : textAlign === "right" ? "text-right" : "text-left"

  const sizeClass =
    size === "lg" ? "h-11 text-[15px]" : size === "sm" ? "h-7 text-[13px]" : "h-9 text-[14px]"

  const inputClass = [
    "w-full bg-(--bg-surface) border border-[#2a2a2a] text-(--text)",
    props.multiline ? "py-[0.4rem] text-[14px]" : sizeClass,
    "px-[0.6rem] font-[inherit]",
    textAlignClass,
    "outline-none appearance-none transition-colors duration-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-[#0a0a0a]",
    errorBorder
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <div className={["flex flex-col gap-1.5", className].filter(Boolean).join(" ")}>
      {label && (
        <label className="m-0" htmlFor={id}>
          {label}
        </label>
      )}

      <div className="relative flex">
        {props.multiline ? (
          <textarea {...omitCommon(props)} className={inputClass} style={unitStyle} />
        ) : (
          <input {...omitCommon(props)} className={inputClass} style={unitStyle} />
        )}

        {unit && (
          <span
            className={`pointer-events-none absolute ${unitPositionClass} top-1/2 -translate-y-1/2 select-none font-mono text-sm text-[#555]`}
          >
            {unit}
          </span>
        )}
      </div>

      {error ? (
        <p className="text-xs m-0 text-red-400">{error}</p>
      ) : description ? (
        <p className="text-xs m-0 text-(--text-muted)">{description}</p>
      ) : null}
    </div>
  )
}
