import { Heart, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import styles from "./page.module.scss";

type FlipCardProps = {
  currentCards: {pLanguageWord: string,
    sLanguageWord: string,
    pronunciation: string
  };
  filteredCards: any,
  handleToggleFavourite: (e: React.MouseEvent) => Promise<void>,
  index: number,
    isTopCard: boolean;

};

export default function CardsStack({currentCards, filteredCards, handleToggleFavourite, index, isTopCard}: FlipCardProps) {
const router = useRouter();

const handleEdit = () => {
  const word = encodeURIComponent(currentCards.sLanguageWord);
  router.push(`/admin?prefill=${word}`);
};
  return (
           <div className={styles.inner}>
                 {filteredCards[index] && isTopCard && (
  <div className={styles.favoriteIconWrapper}>
    <div onClick={handleToggleFavourite} className={styles.icon}>
      {filteredCards[index].favourite ? (
        <Heart color="red" fill="red" size={20} />
      ) : (
        <Heart color="gray" size={20} />
      )}
    </div>

    <div onClick={handleEdit} className={styles.icon}>
      <Pencil size={20} color="gray" />
    </div>
  </div>
)}

        <div className={styles.front}>
            <h1>{currentCards ? currentCards.pLanguageWord : "No cards/loading"}</h1>
          </div>
          <div className={styles.back}>
            <h1>{currentCards ? currentCards.sLanguageWord : "No cards/loading"}</h1>
            <p>{currentCards?.pronunciation ? `[${currentCards.pronunciation}]` : ``}</p>
          </div>  
        </div>
  )
}
