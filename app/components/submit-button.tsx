"use client"

import { Loader2 } from "lucide-react"
import { ComponentProps } from "react"
import { useFormStatus } from "react-dom"

import { Button } from "./ui/button"

type Props = Omit<ComponentProps<typeof Button>, "disabled"> & {
  pendingLabel?: string
}

export function SubmitButton({ children, pendingLabel, variant = "primary", ...rest }: Props) {
  const { pending } = useFormStatus()

  return (
    <Button disabled={pending} variant={variant} {...rest}>
      {pending ? (
        <>
          <Loader2 className="animate-spin" size={14} />
          {pendingLabel ?? children}
        </>
      ) : (
        children
      )}
    </Button>
  )
}
