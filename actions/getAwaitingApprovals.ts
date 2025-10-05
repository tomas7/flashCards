// app/actions/getCards.ts
'use server';

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function getAwaitingApprovals(email: string) {
  
    const result = await sql`
      SELECT * FROM "saved_words"
      WHERE "email" = ${email}
    `;
    return result as {id:string, word: string, email: string}[];
}
