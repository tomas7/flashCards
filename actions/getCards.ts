// app/actions/getCards.ts
'use server';

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function getCards(email: string) {
  const result = await sql`SELECT * FROM "fCard" WHERE "email" = ${email}`;
  return result; // result.rows is an array of DB records
}
