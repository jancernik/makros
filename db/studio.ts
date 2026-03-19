import { spawn } from "child_process"

const studio = spawn("pnpm", ["drizzle-kit", "studio"], {
  cwd: process.cwd(),
  stdio: "inherit"
})

studio.on("close", (code) => process.exit(code ?? 0))
studio.on("error", (error) => {
  console.error("Failed to start drizzle-kit studio:", error)
  process.exit(1)
})
