import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Game } from "../../../tv/selectGame";
import GameCard from "../../components/GameCard";
import { ViewMode } from "../types";
import { buildGameCardLabels } from "../../utils/gameCardLabels";
import { toGameCardGame } from "../../utils/toGameCardGame";
import LogoLoader from "../../../components/utils/LogoLoader";
import ErrorNotice from "./ErrorNotice";
import { useKeycloak } from "../../../auth/KeycloakProvider";
import { get } from "../../../api";
import { useI18n } from "../../../i18n/I18nProvider";

type MyGamesTabProps = {
  searchTerm: string;
  viewMode: ViewMode;
  onOpenGame: (game: Game | any) => void;
  onStatsChange?: (stats: { gameCount: number; totalPlays: number }) => void;
  refreshKey?: number;
};

const MyGamesTab = ({
  searchTerm,
  viewMode,
  onOpenGame,
  onStatsChange,
  refreshKey,
}: MyGamesTabProps) => {
  const { userId } = useKeycloak();
  const navigate = useNavigate();
  const [games, setGames] = useState<Array<Game>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { t } = useI18n();

  const loadGames = () => {
    if (!userId) return;
    setLoading(true);
    setError(false);
    get(`/games/`)
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setGames(list);
        const totalPlays = list.reduce(
          (acc: number, g: any) => acc + (g.plays ?? g.playthroughs ?? 0),
          0,
        );
        onStatsChange?.({ gameCount: list.length, totalPlays });
      })
      .catch(() => {
        setGames([]);
        setError(true);
        onStatsChange?.({ gameCount: 0, totalPlays: 0 });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadGames();
  }, [userId, refreshKey]);

  const filteredGames = useMemo(() => {
    if (!searchTerm) return games;
    return games.filter((game) =>
      game.name?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [games, searchTerm]);

  return (
    <>
      <div className="text-xl font-semibold text-slate-900 pt-8"></div>
      {(() => {
        if (loading) {
          return (
            <div className="flex justify-center items-center h-32">
              <LogoLoader />
            </div>
          );
        }

        if (error) {
          return (
            <ErrorNotice
              lead={t("common.errorLead") || "Uff da …"}
              title={t("common.error") || "Noe gikk galt"}
              description={t("common.tryAgain") || "Kunne ikke laste spillene dine akkurat nå."}
              actionLabel={t("common.retry") || "Prøv igjen"}
              onRetry={loadGames}
            />
          );
        }

        if (!games || games.length === 0) {
          return (
            <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 text-center shadow-sm">
              <div className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                {t("home.noGames.title") || "No games yet"}
              </div>
              <div className="text-slate-600 mb-4 sm:mb-6">
                {t("home.noGames.subtitle") ||
                  "Create your first quiz or discover examples to get started."}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate("/home/create")}
                  className="rounded-xl bg-gradient-to-r from-[#6a71fa] to-[#9c8afa] px-4 py-2 text-sm text-white font-bold shadow hover:shadow-lg active:scale-95 transition md:px-3 md:py-1.5 md:text-sm"
                >
                  {t("home.create") || "New quiz"}
                </button>
                <button
                  onClick={() => navigate("/discover")}
                  className="rounded-xl bg-white px-4 py-2 text-sm text-[#2f2f55] font-semibold shadow border border-slate-200 hover:bg-slate-50 transition md:px-3 md:py-1.5 md:text-sm"
                >
                  {t("home.discover") || "Discover"}
                </button>
              </div>
            </div>
          );
        }

        if (filteredGames && filteredGames.length === 0) {
          return (
            <div className="text-center text-slate-500">
              {t("home.search.noMatches", { term: `«${searchTerm}»` }) ||
                `No results for ${searchTerm}`}
            </div>
          );
        }

        const labels = buildGameCardLabels(t);
        const gridClass =
          viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "grid grid-cols-1 gap-4";

        return (
          <div className={gridClass}>
            {filteredGames?.map((raw: any) => {
              const cardGame = toGameCardGame(raw, {
                description: raw.description || t("home.noDescription") || "No description",
                questionCount: raw.qcount ?? 0,
                playCount: raw.plays ?? raw.playthroughs ?? 0,
                favoriteCount: raw.favCount ?? null,
                participantCount: raw.participants ?? null,
                isPublic: ((raw.isPublic ?? 0) === 1) || raw.isPublic === true,
                tags: Array.isArray(raw.tags) ? raw.tags : undefined,
                ownedByCurrentUser: true,
              });

              return (
                <GameCard
                  key={cardGame.id}
                  game={cardGame}
                  labels={labels}
                  onClick={() => onOpenGame(raw)}
                  onEdit={() => navigate(`edit/${cardGame.id}`)}
                />
              );
            })}
          </div>
        );
      })()}
    </>
  );
};

export default MyGamesTab;
