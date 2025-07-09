    // app/actions/insertCard.ts
    'use server';

    import { neon } from '@neondatabase/serverless';

    const sql = neon(process.env.DATABASE_URL!);

    export async function insertCard(formData: FormData) {
    const email = formData.get("email") as string;
    const primary = formData.get("primary") as string;
    const secondary = formData.get("secondary") as string;
    const pronunciation = formData.get("pronunciation") as string;
    const group = formData.get("group") as string;

    if (!email || !primary || !secondary) return;

    await sql`
        INSERT INTO "fCard" (email, "pLanguageWord", "sLanguageWord", "pronunciation", "group")
        VALUES (${email}, ${primary}, ${secondary}, ${pronunciation}, ${group})
    `;
    }
