import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  // Try cookie first
  let token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, raw:true })
  if (!token) token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, cookieName: "__Secure-authjs.session-token", raw:true })
  if (!token) {
    return NextResponse.json({ error: "token missing" }, { status: 401 })
  }

  return NextResponse.json({ token })
}
