import { z } from "zod"

export const loginSchema = z.object({
  password: z.string().min(1, "Password is required"),
  username: z.string().min(1, "Username is required")
})

export const signupSchema = z
  .object({
    confirmPassword: z.string().min(1, "Confirm your password"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(32, "Username must be 32 characters or fewer")
      .regex(/^[a-zA-Z0-9_-]+$/, "Use only letters, numbers, hyphens and underscores")
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  })

export type LoginInput = z.infer<typeof loginSchema>
