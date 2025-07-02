'use client';

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import words from "../data/words.json";
import { Session } from "next-auth";
import { getCards } from "../actions/getCards"; // adjust path if needed

type FlipCardProps = {
  session: Session;
};

export default function FlipCard({ session }: FlipCardProps) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [userCards, setUserCards] = useState<any[]>([]); // state for DB results

  const currentWord = words[index];

  const handleNext = () => {
    setFlipped(false);
    setTimeout(() => 
      setIndex((prev) => (  (prev + 1) % userCards.length)), 400);
  };

  const handleLoadUserCards = async () => {
    if (!session.user?.email) return;
    const data = await getCards(session.user.email);
    setUserCards(data);
  };

    useEffect(() => {
    // only run if email exists
    if (!session.user?.email) return;

    const loadCards = async () => {
            if (!session.user?.email) return;

      const data = await getCards(session.user.email);
      setUserCards(data);
    };

    loadCards();
  }, [session.user?.email]); // runs once on mount or when email changes


  return (
    <div className={styles.container}>
      <h1>Welcome: {session?.user?.name}</h1>
        
      <div
        className={`${styles.card} ${flipped ? styles.flipped : ""}`}
        onClick={() => setFlipped(!flipped)}
      >
        <div className={styles.inner}>
          <div className={styles.front}>
            <h2>{userCards[index] ? userCards[index].pLanguageWord : "loading"}</h2>
          </div>
          <div className={styles.back}>
            <h1>{userCards[index] ? userCards[index].sLanguageWord : " loading"}</h1>
          </div>
        </div>
      </div>
        <button  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={handleNext}>
          Next
        </button>
    </div>
  );
}
