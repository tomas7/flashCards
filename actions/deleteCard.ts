'use server';

import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);

export async function deleteCard(id: string) {
   await sql`DELETE FROM "fCard" WHERE id = ${id}`;

}