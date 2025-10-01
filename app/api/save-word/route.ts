import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function OPTIONS() {
  // Preflight response
  return NextResponse.json({}, {
    headers: {
      "Access-Control-Allow-Origin": "chrome-extension://jddcomodfaipifkbdfhkenbhbccmcebf",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  if (!token?.email) {
    return NextResponse.json(
      { error: "Unauthorized" },
      {
        status: 401,
        headers: {
          "Access-Control-Allow-Origin": "chrome-extension://jddcomodfaipifkbdfhkenbhbccmcebf",
        },
      }
    )
  }

  try {
    const { word } = await req.json()
    if (!word) {
      return NextResponse.json(
        { error: "Invalid word" },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "chrome-extension://jddcomodfaipifkbdfhkenbhbccmcebf",
          },
        }
      )
    }

    await sql`
      INSERT INTO saved_words (email, word)
      VALUES (${token.email}, ${word})
    `

    return NextResponse.json(
      { success: true },
      {
        headers: {
          "Access-Control-Allow-Origin": "chrome-extension://jddcomodfaipifkbdfhkenbhbccmcebf",
        },
      }
    )
  } catch (err) {
    console.error("DB error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "chrome-extension://jddcomodfaipifkbdfhkenbhbccmcebf",
        },
      }
    )
  }
}
