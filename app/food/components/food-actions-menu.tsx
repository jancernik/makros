"use client"

import { Copy, Eye, EyeOff, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { useRouter } from "nextjs-toploader/app"
import { useTransition } from "react"
import toast from "react-hot-toast"

import { Button } from "../../components/ui/button"
import {
  Float,
  FloatContent,
  FloatItem,
  FloatLink,
  FloatSeparator,
  FloatTrigger
} from "../../components/ui/float"
import { deleteFood, duplicateFood, setFoodHidden } from "../actions"

type Props = {
  foodId: string
  isHidden: boolean
}

export function FoodActionsMenu({ foodId, isHidden }: Props) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleDuplicate() {
    startTransition(async () => {
      const result = await duplicateFood(foodId)
      if ("error" in result) {
        toast.error(result.error)
        return
      }
      toast.success("Food duplicated")
      router.push(`/food/${result.id}/edit`)
    })
  }

  function handleToggleHidden() {
    startTransition(async () => {
      await setFoodHidden(foodId, !isHidden)
      toast.success(isHidden ? "Food unhidden" : "Food hidden")
    })
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteFood(foodId)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Food deleted")
      }
    })
  }

  return (
    <div className="food-actions-trigger relative mr-1">
      <Float>
        <FloatTrigger>
          <Button
            aria-label="Open food actions"
            className="text-[#666] hover:text-[#ededed]"
            disabled={isPending}
            iconOnly
            type="button"
            variant="ghost"
          >
            <MoreHorizontal size={15} />
          </Button>
        </FloatTrigger>

        <FloatContent align="center" className="min-w-35" estimatedWidth={140}>
          <FloatLink className="flex items-center gap-2" href={`/food/${foodId}/edit`}>
            <Pencil size={13} /> Edit
          </FloatLink>

          <FloatItem
            className="flex items-center gap-2"
            disabled={isPending}
            onClick={handleDuplicate}
          >
            <Copy size={13} /> Duplicate
          </FloatItem>

          <FloatItem
            className="flex items-center gap-2"
            disabled={isPending}
            onClick={handleToggleHidden}
          >
            {isHidden ? <Eye size={13} /> : <EyeOff size={13} />}
            {isHidden ? "Unhide" : "Hide"}
          </FloatItem>

          <FloatSeparator />

          <FloatItem
            className="flex items-center gap-2"
            danger
            disabled={isPending}
            onClick={handleDelete}
          >
            <Trash2 size={13} /> Delete
          </FloatItem>
        </FloatContent>
      </Float>
    </div>
  )
}
