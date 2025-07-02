// components/admin-form.tsx
'use client';

import { insertCard } from "../actions/insertCards";
import { Session } from "next-auth";

type Props = {
  session: Session;
};

export default function AdminForm({ session }: Props) {
      if (!session?.user) {
    return <div className="p-6 text-red-500">Access denied. Please sign in.</div>;
  }

  
        
  return (
    <form action={insertCard} className="space-y-4 max-w-md bg-gray-50 p-4 rounded">
      <input type="hidden" name="email" value={session.user.email!} />

      <div>
        <label className="block font-medium mb-1">Primary Language</label>
        <input
          name="primary"
          type="text"
          required
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Secondary Language</label>
        <input
          name="secondary"
          type="text"
          required
          className="w-full p-2 border rounded"
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Add Flashcard
      </button>
    </form>
  );
}
