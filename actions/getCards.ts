// app/actions/getCards.ts
'use server';

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function getCards(email: string, group: string | undefined) {
  if (group) {
    const result = await sql`
      SELECT * FROM "fCard"
      WHERE "email" = ${email} AND "group" = ${group}
    `;
    return result;
  } else {
    const result = await sql`
      SELECT * FROM "fCard"
      WHERE "email" = ${email}
    `;
    return result;
  }
}
