import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GameCard from "../../components/GameCard";
import { buildGameCardLabels } from "../../utils/gameCardLabels";
import { toGameCardGame } from "../../utils/toGameCardGame";
import { useKeycloak } from "../../../auth/KeycloakProvider";
import { get } from "../../../api";
import LogoLoader from "../../../components/utils/LogoLoader";
import ErrorNotice from "./ErrorNotice";
import { useI18n } from "../../../i18n/I18nProvider";

type FavoritesTabProps = {
  active: boolean;
  onOpenGame: (game: any) => void;
  onCountChange?: (count: number) => void;
};

const FavoritesTab = ({
  active,
  onOpenGame,
  onCountChange,
}: FavoritesTabProps) => {
  const { userId: currentUserId } = useKeycloak();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const { t } = useI18n();

  const loadFavorites = () => {
    if (!currentUserId) return;
    setIsLoading(true);
    setError(false);
    get("/favorites/details")
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setFavorites(list);
        onCountChange?.(list.length);
      })
      .catch(() => {
        setFavorites([]);
        setError(true);
        onCountChange?.(0);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (!active || !currentUserId) return;
    loadFavorites();
  }, [active, currentUserId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32 pt-16">
        <LogoLoader />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorNotice
        lead={t("common.errorLead") || "Uff da …"}
        title={t("home.favorites.errorTitle") || "Kunne ikke laste favoritter"}
        description={t("home.favorites.errorBody") || "Prøv igjen, så henter vi listen på nytt."}
        actionLabel={t("common.retry") || "Prøv igjen"}
        onRetry={loadFavorites}
      />
    );
  }

  if (!favorites || favorites.length === 0) {
    return (
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-600 shadow-sm">
        <div className="text-3xl mb-2">⭐️</div>
        <div className="text-slate-900 font-medium mb-1">
          {t("home.favorites.emptyTitle") || "No favorites yet"}
        </div>
        <div className="text-slate-600 mb-4">
          {t("home.favorites.emptySubtitle") ||
            "Mark quizzes as favorites or browse Discover to find something new."}
        </div>
        <button
          onClick={() => navigate("/discover")}
          className="rounded-full bg-gradient-to-r from-[#6a71fa] to-[#9c8afa] px-4 py-2 text-white text-sm font-semibold shadow hover:shadow-lg active:scale-95 transition"
        >
          {t("home.favorites.goDiscover") || "Go to Discover"}
        </button>
      </div>
    );
  }

  const labels = buildGameCardLabels(t);

  return (
    <>
      <div className="text-xl font-semibold text-slate-900 pt-8"></div>
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

          return (
            <GameCard
              key={cardGame.id}
              game={cardGame}
              labels={labels}
              onClick={() => onOpenGame(raw)}
              onEdit={() => navigate(`/home/edit/${cardGame.id}`)}
              onCreatorClick={(gameCard) => {
                if (gameCard.creatorUserId) {
                  navigate(`/creator/${encodeURIComponent(gameCard.creatorUserId)}`);
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
