'use client';

import { useEffect, useState } from "react";
import { Session } from "next-auth";
import { insertCard } from "../actions/insertCards";
import { getCards } from "../actions/getCards";
import { updateCard } from "../actions/updateCard";
import { deleteCard } from "../actions/deleteCard";
import { useSearchParams } from 'next/navigation'; // for client-side search params

type Props = {
  session: Session;
};

export default function AdminForm({ session }: Props) {
  const [cards, setCards] = useState<any[]>([]);
  
  const [updatedCards, setUpdatedCards] = useState<Record<string, { primary: string; secondary: string; pronunciation: string, group: string}>>({});

 const searchParams = useSearchParams();
  const prefill = searchParams.get('prefill') || '';

  useEffect(() => {
    const fetchCards = async () => {
      if (!session?.user?.email) return;
      const data = await getCards(session.user.email, undefined);
      setCards(data);
    };
    fetchCards();
  }, [session?.user?.email]);

  const handleUpdate = async (id: string) => {
    const updates = updatedCards[id];
    if (!updates) return;

    await updateCard(id, updates.primary, updates.secondary, updates.pronunciation, updates.group);

    setCards((prev) =>
      prev.map((card) =>
        card.id === id
          ? { ...card, pLanguageWord: updates.primary, sLanguageWord: updates.secondary }
          : card
      )
    );

    // Clear updated state for that card
    setUpdatedCards((prev) => {
      const newUpdates = { ...prev };
      delete newUpdates[id];
      return newUpdates;
    });
  };

  const handleDelete = async (id: string) => {
    await deleteCard(id);
    setCards((prev) => prev.filter((card) => card.id !== id));
  };

  if (!session?.user) {
    return <div className="p-6 text-red-500">Access denied. Please sign in.</div>;
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto p-4">
      {/* Add Flashcard Form */}
      <form action={insertCard} className="space-y-4 bg-gray-50 p-4 rounded shadow">
        <input type="hidden" name="email" value={session.user.email!} />
        <div>
          <label className="block font-medium mb-1">English</label>
<input
  name="primary"
  type="text"
  required
  className="w-full p-2 border rounded"
/>        </div>

        <div>
          <label className="block font-medium mb-1">Danish</label>
          <input name="secondary" type="text" required className="w-full p-2 border rounded"   defaultValue={prefill}
/>
        </div>

          <div>
          <label className="block font-medium mb-1">Pronunciation</label>
          <input name="pronunciation" type="text" className="w-full p-2 border rounded" />
        </div>
          <div>
          <label className="block font-medium mb-1">Group</label>
          <input name="group" type="text" className="w-full p-2 border rounded" />
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Add Flashcard
        </button>
      </form>

      {/* Flashcard List for Editing */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Your Flashcards</h2>
        {cards.map((card) => (
          <div key={card.id} className="border p-3 rounded bg-white shadow-sm space-y-2">
            <label>English</label>

            <input
              type="text"
              defaultValue={card.pLanguageWord}
              className="border p-2 w-full rounded"
              onChange={(e) =>
                setUpdatedCards((prev) => ({
                  ...prev,
                  [card.id]: {
                    ...(prev[card.id] || { primary: card.pLanguageWord, secondary: card.sLanguageWord }),
                    primary: e.target.value,
                  },
                }))
              }
            />
              <label>Danish</label>

            <input
              type="text"
              defaultValue={card.sLanguageWord}
              className="border p-2 w-full rounded"
              onChange={(e) =>
                setUpdatedCards((prev) => ({
                  ...prev,
                  [card.id]: {
                    ...(prev[card.id] || { primary: card.pLanguageWord, secondary: card.sLanguageWord }),
                    secondary: e.target.value,
                  },
                }))
              }
            />
               <label>Pronunciation</label>
          <input
              type="text"
              defaultValue={card.pronunciation}
              className="border p-2 w-full rounded"
              onChange={(e) =>
                setUpdatedCards((prev) => ({
                  ...prev,
                  [card.id]: {
                    ...(prev[card.id] || { primary: card.pLanguageWord, secondary: card.sLanguageWord }),
                    pronunciation: e.target.value,
                  },
                }))
              }
            />
            <label>Group</label>
              <input
              type="text"
              defaultValue={card.group}
              className="border p-2 w-full rounded"
              onChange={(e) =>
                setUpdatedCards((prev) => ({
                  ...prev,
                  [card.id]: {
                    ...(prev[card.id] || { primary: card.pLanguageWord, secondary: card.sLanguageWord }),
                    group: e.target.value,
                  },
                }))
              }
            />
            <button
              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 mr-2"
              onClick={() => handleUpdate(card.id)}
            >
              Update
            </button>

               <button
              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              onClick={() => handleDelete(card.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
