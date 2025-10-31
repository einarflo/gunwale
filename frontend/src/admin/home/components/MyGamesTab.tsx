import styled from "styled-components";
import { Game, Spinner } from "../../../tv/selectGame";
import GameCard from "../../components/GameCard";
import { ViewMode, Translate } from "../types";
import { buildGameCardLabels } from "../../utils/gameCardLabels";
import { toGameCardGame } from "../../utils/toGameCardGame";

const ListSpinner = styled(Spinner)`
  border: 3px solid rgba(59, 130, 246, 0.25);
  border-top-color: #3b82f6;
`;

type MyGamesTabProps = {
  loading: boolean;
  error: boolean;
  games: Array<Game> | undefined;
  filteredGames: Array<Game> | undefined;
  viewMode: ViewMode;
  searchTerm: string;
  t: Translate;
  onOpenGame: (id: string) => void;
  onEditGame: (id: string) => void;
  onCreateGame: () => void;
  onDiscover: () => void;
};

const MyGamesTab = ({
  loading,
  error,
  games,
  filteredGames,
  viewMode,
  searchTerm,
  t,
  onOpenGame,
  onEditGame,
  onCreateGame,
  onDiscover,
}: MyGamesTabProps) => (
  <>
    <div className="text-xl font-semibold text-white mb-4">
      {t("home.yourGames") || "Your games"}
    </div>
    {(() => {
      if (loading) {
        return (
          <div className="flex justify-center items-center h-32">
            <ListSpinner />
          </div>
        );
      }

      if (error) {
        return <div className="text-red-500">{t("common.error") || "An error occurred"}</div>;
      }

      if (!games || games.length === 0) {
        return (
          <div className="rounded-2xl bg-white/10 backdrop-blur-md p-6 sm:p-8 border border-white/10 text-center shadow">
            <div className="text-xl sm:text-2xl font-bold text-white mb-2">
              {t("home.noGames.title") || "No games yet"}
            </div>
            <div className="text-white/70 mb-4 sm:mb-6">
              {t("home.noGames.subtitle") ||
                "Create your first quiz or discover examples to get started."}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={onCreateGame}
                className="rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 py-2 text-sm text-white font-bold shadow hover:shadow-lg active:scale-95 transition md:px-3 md:py-1.5 md:text-sm"
              >
                {t("home.create") || "New quiz"}
              </button>
              <button
                onClick={onDiscover}
                className="rounded-xl bg-white/10 px-4 py-2 text-sm text-white font-semibold shadow border border-white/10 hover:bg-white/20 transition md:px-3 md:py-1.5 md:text-sm"
              >
                {t("home.discover") || "Discover"}
              </button>
            </div>
          </div>
        );
      }

      if (filteredGames && filteredGames.length === 0) {
        return (
          <div className="text-center text-gray-300">
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
            });

            const actions = [
              {
                label: t("home.startGame") || "Start game",
                kind: "primary" as const,
                onClick: (gameCard: any) => onOpenGame(gameCard.id),
              },
              {
                label: t("home.edit") || "Edit",
                kind: "secondary" as const,
                onClick: (gameCard: any) => onEditGame(gameCard.id),
              },
            ];

            return (
              <GameCard
                key={cardGame.id}
                game={cardGame}
                labels={labels}
                actions={actions}
                onClick={(gameCard) => onOpenGame(gameCard.id)}
              />
            );
          })}
        </div>
      );
    })()}
  </>
);

export default MyGamesTab;
