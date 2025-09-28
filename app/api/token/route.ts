import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { auth } from "@/auth"

export async function GET(req: NextRequest) {
  // First check session for convenience (optional)
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 })
  }

  // Extract the raw JWT
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  if (!token) {
    return NextResponse.json({ error: "token missing" }, { status: 401 })
  }

  return NextResponse.json({
    token,   // contains email, etc.
    session, // keep session info too if you want
  })
}
