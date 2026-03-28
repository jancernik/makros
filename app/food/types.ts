export type FoodActionState = {
  errors: Record<string, string[] | undefined>
  fields?: Record<string, string>
  message: null | string
  success: boolean
}
