const required = ["DB_USER", "DB_HOST", "DB_PORT", "DB_NAME", "DB_PASSWORD"] as const

for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`)
}

export const dbEnv = {
  user: process.env.DB_USER!,
  host: process.env.DB_HOST!,
  port: Number(process.env.DB_PORT!),
  name: process.env.DB_NAME!,
  password: process.env.DB_PASSWORD!,
  url: `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
}
