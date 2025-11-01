import { Spinner } from "../../../tv/selectGame";
import GameCard from "../../components/GameCard";
import { Translate } from "../types";
import { buildGameCardLabels } from "../../utils/gameCardLabels";
import { toGameCardGame } from "../../utils/toGameCardGame";
import { useKeycloak } from "../../../auth/KeycloakProvider";

type FavoritesTabProps = {
  isLoading: boolean;
  favorites: any[];
  t: Translate;
  onDiscover: () => void;
  onOpenGame: (id: string) => void;
  onEditGame: (id: string) => void;
  onViewCreator: (creatorUserId: string) => void;
};

const FavoritesTab = ({
  isLoading,
  favorites,
  t,
  onDiscover,
  onOpenGame,
  onEditGame,
  onViewCreator,
}: FavoritesTabProps) => {
  const { userId: currentUserId } = useKeycloak();

  if (isLoading) {
    return (
      <div className="mt-6 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!favorites || favorites.length === 0) {
    return (
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/80">
        <div className="text-3xl mb-2">⭐️</div>
        <div className="text-white font-medium mb-1">
          {t("home.favorites.emptyTitle") || "No favorites yet"}
        </div>
        <div className="text-white/70 mb-4">
          {t("home.favorites.emptySubtitle") ||
            "Mark quizzes as favorites or browse Discover to find something new."}
        </div>
        <button
          onClick={onDiscover}
          className="rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 px-4 py-2 text-white text-sm font-semibold shadow hover:shadow-lg active:scale-95 transition"
        >
          {t("home.favorites.goDiscover") || "Go to Discover"}
        </button>
      </div>
    );
  }

  const labels = buildGameCardLabels(t);

  return (
    <>
      <div className="text-xl font-semibold text-white mb-2 mt-4">
        {t("home.favorites") || "Favorites"}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        {favorites.map((raw: any) => {
          const ownerId =
            raw.created_by ??
            raw.createdBy ??
            raw.creator_profile?.userId ??
            null;
          const ownedByCurrentUser =
            currentUserId != null && ownerId != null
              ? String(ownerId) === String(currentUserId)
              : false;
          const cardGame = toGameCardGame(raw, {
            description: raw.description || t("home.noDescription") || "No description",
            questionCount: raw.qcount ?? 0,
            playCount: raw.plays ?? raw.playthroughs ?? 0,
            favoriteCount: raw.favCount ?? null,
            participantCount: raw.participants ?? null,
            isPublic: ((raw.isPublic ?? 0) === 1) || raw.isPublic === true,
            creatorName:
              raw.creator_profile?.username ||
              raw.creator_username ||
              raw.created_by_name ||
              null,
            creatorUserId: raw.creator_profile?.userId || raw.created_by || null,
            creatorLevel:
              raw.creator_profile?.level ??
              raw.creator_level ??
              raw.level ??
              null,
            creatorIsPremium:
              raw.creator_profile?.isPremium ??
              raw.creator_profile?.premium ??
              (raw.creator_profile?.premiumSince ? true : undefined) ??
              null,
            tags: Array.isArray(raw.tags) ? raw.tags : undefined,
            isFavorite: true,
            lastPlayedAt: raw.lastPlayedAt ?? null,
            ownedByCurrentUser,
          });

          const actions = [
            {
              label: t("home.startGame") || "Start game",
              kind: "primary" as const,
              onClick: (gameCard: any) => onOpenGame(gameCard.id),
            },
          ];

          return (
            <GameCard
              key={cardGame.id}
              game={cardGame}
              labels={labels}
              actions={actions}
              onClick={(gameCard) => onOpenGame(gameCard.id)}
              onEdit={(gameCard) => onEditGame(gameCard.id)}
              onCreatorClick={(gameCard) => {
                if (gameCard.creatorUserId) {
                  onViewCreator(gameCard.creatorUserId);
                }
              }}
            />
          );
        })}
      </div>
    </>
  );
};

export default FavoritesTab;
