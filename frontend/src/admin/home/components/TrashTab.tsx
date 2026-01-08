import { useEffect, useState } from "react";
import GameCard from "../../components/GameCard";
import { Game } from "../../../tv/selectGame";
import { buildGameCardLabels } from "../../utils/gameCardLabels";
import { toGameCardGame } from "../../utils/toGameCardGame";
import { get, put } from "../../../api";
import LogoLoader from "../../../components/utils/LogoLoader";
import ErrorNotice from "./ErrorNotice";
import { useI18n } from "../../../i18n/I18nProvider";

type TrashTabProps = {
  active: boolean;
  onRestored?: () => void;
};

const TrashTab = ({ active, onRestored }: TrashTabProps) => {
  const [deletedGames, setDeletedGames] = useState<Array<Game>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const { t } = useI18n();

  const loadDeletedGames = () => {
    setLoading(true);
    setError(false);
    get(`/games/trash`)
      .then((res) => setDeletedGames(res.data || []))
      .catch(() => {
        setDeletedGames([]);
        setError(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!active) return;
    loadDeletedGames();
  }, [active]);

  const restoreGame = (selector: string) => {
    put(`/games/${selector}/restore`).then(() => {
      loadDeletedGames();
      onRestored?.();
    });
  };

  const labels = buildGameCardLabels(t);

  if (loading) {
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
        title={t("home.trash.errorTitle") || "Kunne ikke laste papirkurven"}
        description={t("home.trash.errorBody") || "Prøv igjen for å hente slettede quizer."}
        actionLabel={t("common.retry") || "Prøv igjen"}
        onRetry={loadDeletedGames}
      />
    );
  }

  return (
    <div className="rounded-2xl p-6 shadow-sm bg-white border border-slate-200 mt-8">
      <div className="text-xl font-semibold text-slate-900 mb-2">Papirkurv</div>
      {loading ? (
        <div className="text-slate-600">{t("common.loading") || "Laster..."}</div>
      ) : deletedGames.length === 0 ? (
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
                onClick: () => restoreGame(selector),
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
