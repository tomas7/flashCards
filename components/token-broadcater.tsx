"use client"

import { useEffect } from "react"

export function TokenBroadcaster() {
  useEffect(() => {
    const sendToken = async () => {
      try {
        const res = await fetch("/api/token")
        if (!res.ok) {
          console.error("Failed to fetch token")
          return
        }

        const data = await res.json()
        console.log("Got token:", data.token)

        // Broadcast to extension
        window.postMessage(
          { type: "SET_AUTH_TOKEN", token: data.token },
          "*"
        )
      } catch (err) {
        console.error("Error fetching token:", err)
      }
    }

    sendToken()
  }, [])

  return null // nothing visible in UI
}
