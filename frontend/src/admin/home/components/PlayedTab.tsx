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

type PlayedTabProps = {
  active: boolean;
  onOpenGame: (game: any) => void;
};

const PlayedTab = ({
  active,
  onOpenGame,
}: PlayedTabProps) => {
  const { userId: currentUserId } = useKeycloak();
  const navigate = useNavigate();
  const [playedGames, setPlayedGames] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const { t } = useI18n();

  const loadPlayed = () => {
    if (!currentUserId) return;
    setIsLoading(true);
    setError(false);
    get("/games/recent-played")
      .then((res) => {
        setPlayedGames(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        setError(true);
        setPlayedGames([]);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (!active || !currentUserId) return;
    loadPlayed();
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
        title={t("home.played.errorTitle") || "Kunne ikke laste spilte quizer"}
        description={t("home.played.errorBody") || "Prøv igjen for å hente historikken din."}
        actionLabel={t("common.retry") || "Prøv igjen"}
        onRetry={loadPlayed}
      />
    );
  }

  if (!playedGames || playedGames.length === 0) {
    return (
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-600 shadow-sm">
        <div className="text-3xl mb-2">🎮</div>
        <div className="text-slate-900 font-medium mb-1">
          {t("home.played.emptyTitle") || "Ingen spilte quizer ennå"}
        </div>
        <div className="text-slate-600">
          {t("home.played.emptySubtitle") || "Start et spill for å se historikken din her."}
        </div>
      </div>
    );
  }

  const labels = buildGameCardLabels(t);

  return (
    <>
      <div className="text-xl font-semibold text-slate-900 pt-8"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {playedGames.map((raw: any) => {
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
            participantCount: raw.participants ?? null,
            favoriteCount: raw.favCount ?? null,
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

export default PlayedTab;
