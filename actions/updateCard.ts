'use server';

import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);

export async function updateCard(id: string, primary: string, secondary: string, pronunciation: string, group: string) {
  await sql`
    UPDATE "fCard"
    SET "pLanguageWord" = ${primary}, "sLanguageWord" = ${secondary} , "pronunciation" = ${pronunciation} , "group" = ${group}
    WHERE id = ${id}
  `;
}