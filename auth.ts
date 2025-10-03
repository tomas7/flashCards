import NextAuth from "next-auth";
import "next-auth/jwt";

import Apple from "next-auth/providers/apple";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

import { createStorage } from "unstorage";
import memoryDriver from "unstorage/drivers/memory";
import { UnstorageAdapter } from "@auth/unstorage-adapter";

import { SignJWT, jwtVerify } from "jose";

const storage = createStorage({
  driver: memoryDriver(),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  debug: !!process.env.AUTH_DEBUG,
  theme: {
    logo: "[https://authjs.dev/img/logo-sm.png](https://authjs.dev/img/logo-sm.png)",
  },
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

  // Force signed JWTs instead of encrypted JWEs
  jwt: {
    async encode({ token, secret }) {
      if (!token) return "";
      return new SignJWT(token as any)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("1h")
        .sign(new TextEncoder().encode(secret as string));
    },
    async decode({ token, secret }) {
      if (!token) return null;
      try {
        const { payload } = await jwtVerify(
          token,
          new TextEncoder().encode(secret as string)
        );
        return payload;
      } catch (err) {
        console.error("JWT verification failed:", err);
        return null;
      }
    },
  },

  callbacks: {
    authorized({ request, auth }) {
      const { pathname } = request.nextUrl;
      if (pathname === "/middleware-example") return !!auth;
      return true;
    },
  },

  experimental: { enableWebAuthn: true },
});

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      email: string;
      name?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    email?: string;
  }
}
