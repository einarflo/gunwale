import GameCard from "../../components/GameCard";
import { Translate } from "../types";
import { Game } from "../../../tv/selectGame";
import { buildGameCardLabels } from "../../utils/gameCardLabels";
import { toGameCardGame } from "../../utils/toGameCardGame";

type TrashTabProps = {
  deletedGames: Array<Game>;
  onRestore: (selector: string) => void;
  t: Translate;
};

const TrashTab = ({ deletedGames, onRestore, t }: TrashTabProps) => {
  const labels = buildGameCardLabels(t);

  return (
    <div className="rounded-2xl p-6 shadow-sm bg-white border border-slate-200">
      <div className="text-xl font-semibold text-slate-900 mb-2">Papirkurv</div>
      {deletedGames.length === 0 ? (
        <div className="text-slate-600">{t("home.trash.empty") || "No deleted quizzes"}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deletedGames.map((raw: any) => {
            const selector = String(raw.uuid ?? raw.id);
            const cardGame = toGameCardGame(raw, {
              description:
                raw.description ||
                `${raw.qcount || 0} ${t("home.questions") || "questions"}`,
              questionCount: raw.qcount ?? 0,
              playCount: raw.plays ?? null,
              participantCount: raw.participants ?? null,
              favoriteCount: raw.favCount ?? null,
              isPublic: ((raw.isPublic ?? 0) === 1) || raw.isPublic === true,
              tags: Array.isArray(raw.tags) ? raw.tags : undefined,
            });

            const actions = [
              {
                label: t("home.trash.restore") || "Restore",
                kind: "primary" as const,
                onClick: () => onRestore(selector),
              },
            ];

            return <GameCard key={cardGame.id} game={cardGame} labels={labels} actions={actions} />;
          })}
        </div>
      )}
    </div>
  );
};

export default TrashTab;
