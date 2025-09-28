'use client';

import { useState, useEffect, useMemo, useLayoutEffect, useRef, useCallback } from "react";
import styles from "./page.module.scss";
import words from "../data/words.json";
import { Session } from "next-auth";
import { getCards } from "../actions/getCards"; // adjust path if needed
import { Heart } from "lucide-react"; // or any icon library you prefer
import { toggleFavourite } from "@/actions/toggleFavourite";
import Link from "next/link";
import CardsStack from "./flash-cards-stack";
import { useSearchParams, useRouter } from "next/navigation";

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
const [visibleCards, setVisibleCards] = useState<any[]>([]);

const filteredCards = useMemo(() => {
  return showOnlyFavorites
    ? userCards.filter((card) => card.favourite)
    : userCards;
}, [userCards, showOnlyFavorites]);

const currentCards = filteredCards[index] ?? null;

const handleNext = () => {
  if (index >= filteredCards.length - 1) return;

  setFlipped(false);

  // Animate card out
  const cardElement = document.querySelector(`#card-${visibleCards[0]?.id}`);
  if (cardElement) {
    (cardElement as HTMLElement).style.transform = "translateX(150%) rotate(10deg)";
    (cardElement as HTMLElement).style.opacity = "0";
  }

  setTimeout(() => {
    setIndex((prev) => prev + 1);
  }, 300); // Delay must match the CSS transition duration
};


    const handlePrevious = () => {
    setFlipped(false);
    setTimeout(() => 
      setIndex((prev) => (  (prev - 1) % filteredCards.length)), 400);
  };

const handleToggleFavourite = async (e: React.MouseEvent, card: any) => {
  e.stopPropagation();

  const globalIndex = userCards.findIndex((c) => c.id === card.id);
  if (globalIndex === -1 || !card) return;

  await toggleFavourite(card.id, card.favourite);

  setUserCards((prev) => {
    const updated = [...prev];
    updated[globalIndex] = {
      ...card,
      favourite: !card.favourite,
    };

    const updatedFiltered = showOnlyFavorites
      ? updated.filter((c) => c.favourite)
      : updated;

    if (
      showOnlyFavorites &&
      card.favourite &&
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
  const router = useRouter();
  const hasInitializedCategories = useRef(false);

// useEffect(() => {
//   const nextCards = filteredCards.slice(index, index + 4);
//   setVisibleCards(nextCards);
// }, [filteredCards, index]);
useEffect(() => {
  const nextCards = filteredCards.slice(index, index + 4);
  setVisibleCards(nextCards);
  console.log(1)
  if (nextCards[index]?.pLanguageWord) {
    const word = encodeURIComponent(nextCards[index].pLanguageWord);
    const newUrl = `?word=${word}&group=${selectedCategory ? selectedCategory : categories[1]}`;
    router.replace(newUrl);
  }
}, [index, filteredCards, router, categories]);

const loadCards = useCallback(async () => {
  if (!session.user?.email) return;
  const data = await getCards(session.user.email, selectedCategory ?? undefined);
  setUserCards(data);
}, [session.user?.email, selectedCategory]);

useEffect(() => {
  loadCards();
}, [loadCards]);


useEffect(() => {
    console.log(3)
  if (!hasInitializedCategories.current && userCards.length > 0) {
    const uniqueCategories = Array.from(
      new Set(userCards.map(card => card.group).filter(Boolean))
    );
    setCategories(uniqueCategories);
    hasInitializedCategories.current = true; // prevent re-running
  }
}, [userCards]);

useEffect(() => {
    console.log(4)
  const fetchCitats = async () => {
    try {
      const res = await fetch(`/api/ordnet?query=${currentCards?.sLanguageWord}`);
      const data = await res.json();
 
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

  if (currentCards?.sLanguageWord) {
    fetchCitats();
  }
}, [currentCards?.sLanguageWord]);

const searchParams = useSearchParams();

// Initialize index from the URL
useEffect(() => {
    console.log(5)
  const paramWord = searchParams.get("word");
  const paramCategory = searchParams.get("category");
  if (!paramWord || !filteredCards.length || !paramCategory) return;
let filteredCardsTemp = filteredCards.filter(e => e.group)
  const cardIndex = filteredCardsTemp.findIndex(
    (card) => card.pLanguageWord === paramWord
  );
  if (cardIndex !== -1) {
    setIndex(cardIndex);
  }
}, [searchParams, filteredCards]);


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
     
                
   <h3>{`${index + 1}/${userCards.length }`}</h3>
<div className={styles.stackContainer}>

  {visibleCards.map((card, i) => (
    <div
      id={`card-${card.id}`}
      key={card.id}
      className={`${styles.card} ${i === 0 && flipped ? styles.flipped : ""}`}
      style={{
        zIndex: 10 - i,
        transform: `translate(${i * 20}px, ${i * 5}px) scale(${1 - i * 0.05})`,
        transition: "all 0.3s ease",
        position: "absolute",
        top: 0,
        left: 0,
      }}
      onClick={() => {
        if (i === 0) setFlipped(!flipped);
      }}
    >
      <CardsStack
        currentCards={card}
        
        filteredCards={filteredCards}
  handleToggleFavourite={(e) => handleToggleFavourite(e, card)}
        index={index}
        isTopCard={i === 0}
      />
    </div>
  ))}
</div>

        <div className={styles.btnWrapper}>
          <button 
           disabled={index === 0}
          onClick={handlePrevious}>
            Back
          </button>

         <button
  disabled={!currentCards?.sLanguageWord}
  onClick={() => {
    const url = `https://ordnet.dk/ddo/ordbog?query=${encodeURIComponent(currentCards?.sLanguageWord ?? "")}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }}
>
            To Ornet
          </button>
          <button
          
          onClick={handleNext}>
            Next
          </button>
          
        </div>
 
 {flipped && Array.isArray(citats) && citats.length > 0 &&
  citats
    .filter(c => typeof c === 'string' && c.trim() !== '') // ✅ Safe check
    .map((c, idx) => (
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
}

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
