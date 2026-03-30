"use client"

import { CheckCircle, XCircle } from "lucide-react"
import { Toaster as HotToaster } from "react-hot-toast"

export function Toaster() {
  return (
    <HotToaster
      toastOptions={{
        duration: 40000,
        error: {
          icon: <XCircle className="text-red-400" size={14} />
        },
        style: {
          background: "#0a0a0a",
          border: "1px solid #2a2a2a",
          borderRadius: "0",
          color: "#ededed",
          fontSize: "14px",
          gap: "12px",
          padding: "12px 16px"
        },
        success: {
          icon: <CheckCircle className="text-green-400" size={14} />
        }
      }}
    />
  )
}
