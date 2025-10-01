import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { jwtVerify } from "jose"

const sql = neon(process.env.DATABASE_URL!)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // you can restrict to your extension ID later
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

function withCORS(body: any, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      ...corsHeaders,
      ...(init?.headers || {}),
    },
  })
}

export async function OPTIONS() {
  return withCORS({})
}

async function verifyToken(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  if (!authHeader) return null

  const token = authHeader.split(" ")[1]
  if (!token) return null

  try {
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET)
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch (err) {
    console.error("JWT verification failed:", err)
    return null
  }
}

export async function POST(req: NextRequest) {
  const payload = await verifyToken(req)

  if (!payload?.email) {
    return withCORS({ error: "Unauthorized", payload }, { status: 401 })
  }

  try {
    const { word } = await req.json()
    if (!word || typeof word !== "string") {
      return withCORS({ error: "Invalid word" }, { status: 400 })
    }

    await sql`
      INSERT INTO saved_words (email, word)
      VALUES (${payload.email}, ${word})
    `

    return withCORS({ success: true })
  } catch (err) {
    console.error("DB error:", err)
    return withCORS({ error: "Internal server error" }, { status: 500 })
  }
}
