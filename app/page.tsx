import FlipCard from "@/components/flash-cards"
import { auth } from "auth"
import { TokenBroadcaster } from "@/components/token-broadcater"

export default async function Index() {
  const session = await auth()

  if (session?.user) {
    return (
      <>
        <FlipCard session={session} />
        <TokenBroadcaster /> {/* ✅ sends JWT to extension */}
      </>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Please log in</h1>
    </div>
  )
}
