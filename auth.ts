import NextAuth from "next-auth"
import "next-auth/jwt"

import Apple from "next-auth/providers/apple"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"

import { createStorage } from "unstorage"
import memoryDriver from "unstorage/drivers/memory"
import { UnstorageAdapter } from "@auth/unstorage-adapter"

const storage = createStorage({
  driver: memoryDriver(),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  debug: !!process.env.AUTH_DEBUG,
  theme: { logo: "https://authjs.dev/img/logo-sm.png" },
  adapter: UnstorageAdapter(storage),
  providers: [
    Apple,
    GitHub,
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  basePath: "/auth",
  session: { strategy: "jwt" },

  callbacks: {
    authorized({ request, auth }) {
      const { pathname } = request.nextUrl
      if (pathname === "/middleware-example") return !!auth
      return true
    },

    async jwt({ token, user, account }) {
      // Persist email in the JWT
      if (user?.email) {
        token.email = user.email
      }

      if (account?.provider === "keycloak") {
        return { ...token, accessToken: account.access_token }
      }

      return token
    },

    async session({ session, token }) {
      // Expose email + accessToken to session
      if (token?.email) {
        session.user.email = token.email as string
      }
      if (token?.accessToken) {
        session.accessToken = token.accessToken
      }
      return session
    },
  },

  experimental: { enableWebAuthn: true },
})

declare module "next-auth" {
  interface Session {
    accessToken?: string
    user: {
      email: string
      name?: string | null
      image?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    email?: string
  }
}
