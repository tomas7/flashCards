import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(req: NextRequest) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return NextResponse.json("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*", // or chrome-extension://<YOUR_ID>
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    })
  }

  // Extract token from header
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { word } = await req.json()
    await sql`
      INSERT INTO "saved_words" (email, word)
      VALUES (${token.email}, ${word})
    `
    return NextResponse.json(
      { success: true },
      {
        headers: {
          "Access-Control-Allow-Origin": "*", // allow cross-origin
        },
      }
    )
  } catch (err) {
    console.error("DB error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
