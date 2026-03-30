import { resetAndSeedDemoDatabase } from "./lib"

export const maxDuration = 60

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return Response.json(
      { date: new Date().toISOString(), error: "CRON_SECRET not configured", ok: false },
      { status: 500 }
    )
  }

  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json(
      { date: new Date().toISOString(), error: "Unauthorized", ok: false },
      { status: 401 }
    )
  }

  if (process.env.APP_ENV !== "demo") {
    return Response.json(
      { date: new Date().toISOString(), error: "Forbidden", ok: false },
      { status: 403 }
    )
  }

  try {
    await resetAndSeedDemoDatabase()
    return Response.json({ date: new Date().toISOString(), ok: true })
  } catch (error) {
    return Response.json(
      { date: new Date().toISOString(), error: (error as Error).message, ok: false },
      { status: 500 }
    )
  }
}
