'use client';

import { useEffect, useState } from "react";
import { Session } from "next-auth";
import { insertCard } from "../actions/insertCards";
//clean this up
import { getAwaitingApprovals } from "../actions/getAwaitingApprovals";
import { updateCard } from "../actions/updateCard";
import { deleteCard } from "../actions/deleteCard";
import { useSearchParams } from 'next/navigation'; // for client-side search params
import { deleteAwaitingWord } from "@/actions/deleteAwaitingWord";

type Props = {
  session: Session;
};

export default function AwaitingApproval({ session }: Props) {
  const [awaitingApprovals, setAwaitingApprovals] = useState<{ id: string, word: string, email: string }[]>([]);

  useEffect(() => {
    const fetchCards = async () => {
      if (!session?.user?.email) return;
      const data = await getAwaitingApprovals(session.user.email);
      setAwaitingApprovals(data);
    };
    fetchCards();
  }, [session?.user?.email]);

  const handleInsert = async (formData: FormData) => {
    const data = {
      id:formData.get("id")?.toString() || "",
      primary: formData.get("id")?.toString() || "",
      secondary: formData.get("secondary")?.toString() || "",
    };
    if (!data.id) {
       return
    }
    await insertCard(formData);
    await deleteAwaitingWord(data.id)
    setAwaitingApprovals((prev) =>
      prev.filter((card) => card.id != data.id
      )
    );
  };
const handleDelete = async (id: string) => {
  console.log("Deleting", id);
  await deleteAwaitingWord(id);
  setAwaitingApprovals((prev) => {
    console.log("Before:", prev);
    const next = prev.filter((card) => String(card.id) !== String(id));
    console.log("After:", next);
    return next;
  });
};



  if (!session?.user) {
    return <div className="p-6 text-red-500">Access denied. Please sign in.</div>;
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto p-4">


      <h2 className="text-lg font-semibold">Your Flashcards</h2>
      {awaitingApprovals.map((card) => (

        <form action={handleInsert} className="space-y-4 bg-gray-50 p-4 rounded shadow" key={card.id}>
          <input type="hidden" name="id" value={card.id} />
          <input type="hidden" name="email" value={session.user.email!} />
          <div>
            <label className="block font-medium mb-1">English</label>
            <input
              name="primary"
              type="text"
              required
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Danish</label>
            <input name="secondary" type="text" defaultValue={card.word} required className="w-full p-2 border rounded"
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

          <button type="submit" className="bg-blue-600 text-white m-1 ml-0 px-3 py-1 rounded hover:bg-red-700">
            Add Flashcard
          </button>
          <button
           type="button" // <--- prevents form submit
            className="bg-red-600 text-white m-1 px-3 py-1 rounded hover:bg-red-700"
            onClick={() => handleDelete(card.id)}
          >
            Delete
          </button>
   
            <a
                href={`https://translate.google.com/?sl=da&tl=en&text=${card.word}&op=translate`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-600 text-white m-1 px-3 py-1 rounded hover:bg-red-700"
              >
                Google Translate
              </a>
        </form>
      ))}
    </div>
  );
}
