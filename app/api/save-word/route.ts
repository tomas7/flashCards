import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
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
  // Preflight needs to return the headers too
  return withCORS({})
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  if (!token?.email) {
    return withCORS({ error: "Unauthorized", token: token }, { status: 401 })
  }

  try {
    const { word } = await req.json()
    if (!word || typeof word !== "string") {
      return withCORS({ error: "Invalid word" }, { status: 400 })
    }

    await sql`
      INSERT INTO saved_words (email, word)
      VALUES (${token.email}, ${word})
    `

    return withCORS({ success: true })
  } catch (err) {
    console.error("DB error:", err)
    return withCORS({ error: "Internal server error" }, { status: 500 })
  }
}
