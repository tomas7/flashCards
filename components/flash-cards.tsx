'use client';

import { useState, useEffect, useMemo, useLayoutEffect, useRef } from "react";
import styles from "./page.module.css";
import words from "../data/words.json";
import { Session } from "next-auth";
import { getCards } from "../actions/getCards"; // adjust path if needed
import { Heart } from "lucide-react"; // or any icon library you prefer
import { toggleFavourite } from "@/actions/toggleFavourite";
import Link from "next/link";

type FlipCardProps = {
  session: Session;
};

export default function FlipCard({ session }: FlipCardProps) {
const [citats, setCitats] = useState<string[]>([]);

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [userCards, setUserCards] = useState<any[]>([]); // state for DB results
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedWord, setSelectedWord] = useState(null);

const filteredCards = useMemo(() => {
  return showOnlyFavorites
    ? userCards.filter((card) => card.favourite)
    : userCards;
}, [userCards, showOnlyFavorites]);

const currentCard = filteredCards[index] ?? null;

  const handleNext = () => {
    setFlipped(false);
    setTimeout(() => 
      setIndex((prev) => (  (prev + 1) % filteredCards.length)), 400);
  };

    const handlePrevious = () => {
    setFlipped(false);
    setTimeout(() => 
      setIndex((prev) => (  (prev - 1) % filteredCards.length)), 400);
  };

const handleToggleFavourite = async (e: React.MouseEvent) => {
  e.stopPropagation();

  const globalIndex = userCards.findIndex((card) => card.id === currentCard?.id);
  if (globalIndex === -1 || !currentCard) return;

  // Toggle favourite in DB
  await toggleFavourite(currentCard.id, currentCard.favourite);

  // Update state
  setUserCards((prev) => {
    const updated = [...prev];
    updated[globalIndex] = {
      ...currentCard,
      favourite: !currentCard.favourite,
    };

    // After update, recalculate filtered list
    const updatedFiltered = showOnlyFavorites
      ? updated.filter((c) => c.favourite)
      : updated;

    // If current card is removed (was favourite, now not), shift index
    if (
      showOnlyFavorites &&
      currentCard.favourite && // was favourite
      updatedFiltered.length <= index
    ) {
      setIndex(Math.max(0, updatedFiltered.length - 1));
    }

    return updated;
  });
};



  const handleLoadUserCards = async () => {
    if (!session.user?.email) return;
    const data = await getCards(session.user.email, undefined);
    setUserCards(data);
  };

    useEffect(() => {
    // only run if email exists
    if (!session.user?.email) return;

    const loadCards = async () => {
            if (!session.user?.email) return;

      const data = await getCards(session.user.email, selectedCategory ?? undefined);
      setUserCards(data);
    };

    loadCards();
  }, [session.user?.email, selectedCategory]); // runs once on mount or when email changes

const hasInitializedCategories = useRef(false);



useEffect(() => {
  if (!hasInitializedCategories.current && userCards.length > 0) {
    const uniqueCategories = Array.from(
      new Set(userCards.map(card => card.group).filter(Boolean))
    );
    setCategories(uniqueCategories);
    hasInitializedCategories.current = true; // prevent re-running
  }
}, [userCards]);

useEffect(() => {
  const fetchCitats = async () => {
    try {
      const res = await fetch(`/api/ordnet?query=${currentCard?.sLanguageWord}`);
      const data = await res.json();
 
      console.log(data.citat);
      if (Array.isArray(data.citat)) {
        setCitats(data.citat);
        
      } else {
        setCitats([data.citat]);
      }
    } catch (error) {
      console.error("Failed to fetch citats:", error);
      setCitats([]);
    }
  };

  if (currentCard?.sLanguageWord) {
    fetchCitats();
  }
}, [currentCard?.sLanguageWord]);


  const handleWordClick = (word: any) => {
    setSelectedWord(word);
  };

  const closeModal = () => {
    setSelectedWord(null);
  };
  return (
    <div className={styles.container}>
      <h1>Welcome: {session?.user?.name}</h1>
      <div className="mb-4">
  <label className="mr-2 font-medium">Filter by Category:</label>
  <select
    value={selectedCategory ?? ""}
    onChange={(e) => setSelectedCategory(e.target.value || null)}
    className="p-2 border rounded"
  >
    {categories.map((category) => (
      <option key={category} value={category}>
        {category}
      </option>
    ))}
  </select>
</div>
        <div className={styles.wrapper}>

        <div className="mb-4 flex items-center gap-2">
  <label className="font-medium">Show only favorites</label>
  <button
    className={`px-3 py-1 rounded ${
      showOnlyFavorites ? 'bg-yellow-500 text-white' : 'bg-gray-300'
    }`}
    onClick={() => {
      setIndex(0); // Reset index to avoid out-of-range issues
      setShowOnlyFavorites((prev) => !prev);
    }}
  >
    {showOnlyFavorites ? 'On' : 'Off'}
  </button>
</div>
      <div
        className={`${styles.card} ${flipped ? styles.flipped : ""}`}
        onClick={() => setFlipped(!flipped)}
      >
                
       {filteredCards[index] && (
    <div
      className={styles.favoriteIcon}
     onClick={handleToggleFavourite}
    >
      {filteredCards[index].favourite ? (
        <Heart color="red" fill="red" size={20} />
      ) : (
        <Heart color="gray" size={20} />
      )}
    </div>
  )}
        <div className={styles.inner}>
          <div className={styles.front}>
            <h1>{currentCard ? currentCard.pLanguageWord : "No cards/loading"}</h1>
          </div>
          <div className={styles.back}>
            <h1>{currentCard ? currentCard.sLanguageWord : "No cards/loading"}</h1>
            <p>{currentCard?.pronunciation ? `[${currentCard.pronunciation}]` : ``}</p>
          </div>  
        </div>
      </div>
        <div className={styles.btnWrapper}>
          <button  className={`mt-4 px-4 py-2 rounded ${
    index === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
  }`}
           disabled={index === 0}
          onClick={handlePrevious}>
            previous
          </button>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          
          onClick={handleNext}>
            Next
          </button>
          
        </div><Link   target="_blank"
  rel="noopener noreferrer"
  className="text-blue-600 hover:underline font-medium" href={`https://ordnet.dk/ddo/ordbog?query=${currentCard?.sLanguageWord}`}
 >To ordnet</Link>
 
   {flipped && (
        citats.length > 0 ? (
          citats.map((c, idx) => (
            <p key={idx} className="italic text-gray-800 mb-2">
              {c.split(' ').map((word, i) => (
                <button
                  key={i}
                  onClick={() => handleWordClick(word)}
                  className="text-blue-600 hover:underline mr-1"
                >
                  {word}
                </button>
              ))}
            </p>
          ))
        ) : (
          <p className="italic text-gray-500">Loading or no citations found...</p>
        )
      )}

      {/* Modal */}
      {selectedWord && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-xs w-full text-center">
            <h2 className="text-lg font-semibold mb-4">What do you want to do with <span className="text-blue-700">{selectedWord}</span>?</h2>
            <div className="flex flex-col gap-3">
              <a
                href={`https://translate.google.com/?sl=da&tl=en&text=${encodeURIComponent(selectedWord)}%0A&op=translate`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Translate on Google
              </a>
              <a
                href={`https://ordnet.dk/ddo/ordbog?query=${encodeURIComponent(selectedWord)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
              >
                Look up in Ordbog
              </a>
              <button
                onClick={closeModal}
                className="text-sm text-gray-500 mt-2 hover:underline"
              >
                Cancel
              </button>
                <a
              href={`/admin?prefill=${encodeURIComponent(selectedWord)}`}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              Add to Flashcards
            </a>
            </div>
          </div>
        </div>
      )}

        </div>
    </div>
  );
}
