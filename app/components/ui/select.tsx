"use client"

import type { DropdownIndicatorProps, StylesConfig } from "react-select"

import { ChevronDown, ChevronUp } from "lucide-react"
import { useId, useMemo } from "react"
import ReactSelect, { components } from "react-select"

export type SelectOption = { label: string; value: string }

type Size = "lg" | "md" | "sm"

const sizeConfig: Record<Size, { fontSize: string; height: number; optionPadding: string }> = {
  lg: { fontSize: "15px", height: 44, optionPadding: "8px 12px" },
  md: { fontSize: "14px", height: 36, optionPadding: "6px 12px" },
  sm: { fontSize: "13px", height: 28, optionPadding: "4px 10px" }
}

const iconSize: Record<Size, number> = { lg: 16, md: 14, sm: 12 }

type Props = {
  className?: string
  defaultValue?: string
  description?: string
  error?: boolean | string
  id?: string
  isDisabled?: boolean
  label?: string
  name?: string
  onChange?: (value: string) => void
  options: SelectOption[]
  size?: Size
  value?: string
}

export function Select({
  className,
  defaultValue,
  description,
  error,
  id,
  isDisabled,
  label,
  name,
  onChange,
  options,
  size = "md",
  value
}: Props) {
  const generatedId = useId()
  const resolvedId = id ?? generatedId

  const selectedDefaultOption = options.find((o) => o.value === defaultValue) ?? null
  const selectedValueOption =
    value !== undefined ? (options.find((o) => o.value === value) ?? null) : undefined
  const errorMessage = typeof error === "string" ? error : undefined

  const { fontSize, height, optionPadding } = sizeConfig[size]

  const styles = useMemo<StylesConfig<SelectOption, false>>(
    () => ({
      control: (base, state) => ({
        ...base,
        "&:hover": {
          borderColor: error ? "#7f1d1d" : state.isFocused ? "#555" : "#2a2a2a"
        },
        backgroundColor: "var(--bg-surface)",
        border: `1px solid ${error ? "#7f1d1d" : state.isFocused ? "#555" : "#2a2a2a"}`,
        borderRadius: 0,
        boxShadow: "none",
        color: "var(--text)",
        cursor: isDisabled ? "not-allowed" : "pointer",
        fontSize,
        minHeight: height,
        opacity: isDisabled ? 0.4 : 1,
        transition: "border-color 100ms"
      }),
      dropdownIndicator: (base) => ({
        ...base,
        color: "#555",
        padding: "0 8px"
      }),
      indicatorSeparator: () => ({ display: "none" }),
      input: (base) => ({
        ...base,
        color: "var(--text)",
        fontFamily: "inherit",
        margin: 0,
        padding: 0
      }),
      menu: (base) => ({
        ...base,
        backgroundColor: "var(--bg-surface)",
        border: "1px solid #2a2a2a",
        borderRadius: 0,
        boxShadow: "none",
        marginTop: 2
      }),
      menuList: (base) => ({
        ...base,
        padding: 0
      }),
      option: (base, state) => ({
        ...base,
        ":active": { backgroundColor: "#333" },
        backgroundColor: state.isSelected ? "#2a2a2a" : state.isFocused ? "#111" : "transparent",
        color: "var(--text)",
        cursor: "pointer",
        fontSize,
        padding: optionPadding
      }),
      singleValue: (base) => ({
        ...base,
        color: "var(--text)",
        fontFamily: "inherit"
      }),
      valueContainer: (base) => ({
        ...base,
        padding: "0 0.6rem"
      })
    }),
    [error, fontSize, height, isDisabled, optionPadding]
  )

  const DropdownIndicator = (props: DropdownIndicatorProps<SelectOption, false>) => {
    const Icon = props.selectProps.menuIsOpen ? ChevronUp : ChevronDown

    return (
      <components.DropdownIndicator {...props}>
        <Icon size={iconSize[size]} />
      </components.DropdownIndicator>
    )
  }

  return (
    <div className={["flex flex-col gap-1.5", className].filter(Boolean).join(" ")}>
      {label && (
        <label className="m-0" htmlFor={resolvedId}>
          {label}
        </label>
      )}

      <ReactSelect<SelectOption, false>
        components={{ DropdownIndicator }}
        defaultValue={selectedDefaultOption}
        inputId={resolvedId}
        instanceId={resolvedId}
        isDisabled={isDisabled}
        name={name}
        onChange={(opt) => onChange?.(opt?.value ?? "")}
        options={options}
        styles={styles}
        value={selectedValueOption}
      />

      {errorMessage ? (
        <p className="m-0 text-xs text-red-400">{errorMessage}</p>
      ) : description ? (
        <p className="m-0 text-xs text-(--text-muted)">{description}</p>
      ) : null}
    </div>
  )
}
