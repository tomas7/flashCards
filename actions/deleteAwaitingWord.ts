'use server';

import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);

export async function deleteAwaitingWord(id: string) {
   await sql`DELETE FROM "saved_words" WHERE id = ${id}`;

}