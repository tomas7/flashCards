'use server'

import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function toggleFavourite(cardId: number, currentState: boolean) {
  try {
    await sql`
      UPDATE "fCard"
      SET "favourite" = ${!currentState}
      WHERE "id" = ${cardId}
    `
  } catch (error) {
    console.error('Failed to toggle favourite:', error)
  }
}
