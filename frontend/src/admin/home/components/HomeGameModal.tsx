import Modal from "react-modal";
import { Game } from "../../../tv/selectGame";
import placeholderImg from "../../../images/tavl-placeholder.jpg";
import { useI18n } from "../../../i18n/I18nProvider";

type HomeGameModalProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedGame: Game | (Game & Record<string, any>) | undefined;
  newGamePin: string;
  isStarting: boolean;
  onStartGame: () => void;
  onEditGame: () => void;
  onCopyPin: () => void;
  onCopyLink: () => void;
};

// --- helpers ---

const getGameExtra = (game: HomeGameModalProps["selectedGame"]) => {
  const g = game as any;
  return {
    cover:
      (g?.cover_image_url as string | undefined) ||
      (g?.coverImageUrl as string | undefined) ||
      null,
    qcount: (g?.qcount as number | undefined) || 0,
    plays: (g?.plays as number | undefined) ?? (g?.playthroughs as number | undefined) ?? 0,
    createdBy: (g?.created_by_name as string | undefined) || "—",
    isPublic: (g?.isPublic as number | boolean | undefined) ?? 0,
  };
};

const getCoverUrl = (raw?: string | null) => {
  if (typeof raw === "string" && raw.trim().length > 0) return raw.trim();
  return placeholderImg;
};

const HomeGameModal = ({
  isOpen,
  onClose,
  selectedGame,
  newGamePin,
  isStarting,
  onStartGame,
  onEditGame,
  onCopyPin,
  onCopyLink,
}: HomeGameModalProps) => {
  const hasGame = Boolean(selectedGame);
  const extras = hasGame ? getGameExtra(selectedGame) : null;
  const { t } = useI18n();

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={{
        overlay: {
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(15, 23, 42, 0.65)", // mørkere bakgrunn, ikke glass
          zIndex: 50,
        },
        content: {
          top: "50%",
          left: "50%",
          right: "auto",
          bottom: "auto",
          transform: "translate(-50%, -50%)",
          borderRadius: "24px",
          border: "1px solid #E0E2FF",
          padding: 0,
          background:
            "linear-gradient(135deg, #FFFFFF 0%, #F4F3FF 50%, #FFFFFF 100%)", // lys, lilla-ish
          boxShadow: "0 24px 60px rgba(15,23,42,0.35)",
          width: "90%",
          maxWidth: "720px",
          overflow: "hidden",
        },
      }}
      contentLabel="Game options"
    >
      {hasGame && extras && selectedGame && (
        <div className="flex flex-col gap-5 p-5 sm:p-6 text-slate-900">
          {/* Bilde / header */}
          <div className="relative h-40 sm:h-48 rounded-2xl overflow-hidden shadow-md">
            <img
              src={getCoverUrl(extras.cover)}
              alt={selectedGame.name}
              className="h-full w-full object-cover"
            />
            {/* Litt mer “dybde”, men ikke glassy */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />

            <div className="absolute top-3 left-3 flex gap-2">
              <span className="bg-black/60 text-white text-xs font-semibold rounded-full px-2 py-0.5">
                {extras.qcount} {t("home.questions") || "questions"}
              </span>
              <span className="bg-black/60 text-white text-xs font-semibold rounded-full px-2 py-0.5">
                {extras.plays} {t("home.plays") || "plays"}
              </span>
            </div>
          </div>

          {/* Tittel + creator + privacy */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-2xl font-bold text-slate-900 truncate">
                {selectedGame.name}
              </div>
              <div className="text-sm text-slate-600">
                {t("home.by", { name: extras.createdBy }) ||
                  `By ${extras.createdBy}`}
              </div>
            </div>

            <span className="shrink-0 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold bg-[#F4F3FF] text-[#4B4D99] border border-[#E0E2FF]">
              {extras.isPublic === 1 || extras.isPublic === true
                ? t("home.public") || "Public"
                : t("home.private") || "Private"}
            </span>
          </div>

          {/* Beskrivelse */}
          {selectedGame.description && (
            <div className="text-sm leading-relaxed text-slate-700">
              {selectedGame.description}
            </div>
          )}

          {/* Stats-rad */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 8l6 6H6z" />
              </svg>
              {extras.qcount} {t("home.questions") || "questions"}
            </span>
            <span className="inline-flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 12a9 9 0 1118 0 9 9 0 01-18 0zm9-5a5 5 0 100 10 5 5 0 000-10z" />
              </svg>
              {extras.plays} {t("home.plays") || "plays"}
            </span>
          </div>

          {/* PIN-kort */}
          <div className="rounded-2xl bg-white border border-slate-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div>
              <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                {t("home.pin") || "PIN"}
              </div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-[0.12em]">
                {newGamePin}
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto justify-end">
              <button
                className="rounded-lg bg-[#6A71FA0F] border border-[#6A71FA44] px-3 py-1.5 text-sm font-semibold text-[#2F2F55] shadow-sm hover:bg-[#6A71FA1A] transition w-full sm:w-auto"
                onClick={onCopyPin}
              >
                {t("home.copyPin") || "Copy PIN"}
              </button>
              <button
                className="rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 transition w-full sm:w-auto"
                onClick={onCopyLink}
              >
                {t("home.copyLink") || "Copy link"}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              className="relative overflow-hidden flex-1 rounded-xl bg-gradient-to-r from-[#6A71FA] via-[#9C8AFA] to-[#6A71FA] px-6 py-3 text-lg font-bold text-white shadow-xl hover:shadow-2xl active:scale-95 transition disabled:opacity-60 md:px-5 md:py-2.5 md:text-base"
              onClick={onStartGame}
              disabled={isStarting}
            >
              {isStarting
                ? t("home.starting") || "Starting…"
                : t("home.startGame") || "Start game"}
              <span
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(110deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0) 100%)",
                  backgroundSize: "200% 100%",
                  animation: "shine 1.8s ease-in-out infinite",
                }}
              />
            </button>
            <button
              className="rounded-xl bg-white px-4 py-3 text-slate-800 font-semibold shadow border border-slate-200 hover:bg-slate-50 transition md:px-3 md:py-2 md:text-sm"
              onClick={onEditGame}
            >
              {t("home.edit") || "Edit"}
            </button>
            <button
              className="rounded-xl bg-white px-4 py-3 text-slate-800 font-semibold shadow border border-slate-200 hover:bg-slate-50 transition md:px-3 md:py-2 md:text-sm"
              onClick={onClose}
            >
              {t("common.close") || "Close"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default HomeGameModal;
