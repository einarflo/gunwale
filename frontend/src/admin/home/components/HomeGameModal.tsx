import Modal from "react-modal";
import { Game } from "../../../tv/selectGame";
import { Translate } from "../types";
import placeholderImg from "../../../images/tavl-placeholder.jpg";

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
  t: Translate;
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
  t,
}: HomeGameModalProps) => (
  <Modal
    isOpen={isOpen}
    onRequestClose={onClose}
    style={{
      overlay: {
        position: "fixed",
        top: 0 + "82px",
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
      },
      content: {
        top: "45%",
        left: "50%",
        right: "auto",
        bottom: "auto",
        marginRight: "-50%",
        transform: "translate(-50%, -50%)",
        borderRadius: "20px",
        border: "1px solid rgba(255,255,255,0.15)",
        color: "white",
        fontFamily: "Coll",
        background: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(16px)",
        width: "90%",
        maxWidth: "720px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
      },
    }}
    contentLabel="Game options"
  >
    {selectedGame ? (
      <div className="flex flex-col gap-5">
        <div className="relative h-40 rounded-xl overflow-hidden">
          <img
            src={(() => {
              const cover =
                (selectedGame as any)?.cover_image_url ||
                (selectedGame as any)?.coverImageUrl ||
                null;
              if (typeof cover === "string" && cover.trim().length > 0) {
                return cover;
              }
              return placeholderImg;
            })()}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute top-2 left-2 flex gap-2">
            <span className="bg-black/40 text-white text-xs font-semibold rounded-full px-2 py-0.5">
              {(selectedGame as any).qcount || 0} {t("home.questions") || "questions"}
            </span>
            <span className="bg-black/40 text-white text-xs font-semibold rounded-full px-2 py-0.5">
              {(selectedGame as any).plays ?? (selectedGame as any).playthroughs ?? 0}{" "}
              {t("home.plays") || "plays"}
            </span>
          </div>
        </div>

        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-2xl font-bold text-white">{selectedGame.name}</div>
            <div className="text-white/80">
              {t("home.by", { name: (selectedGame as any).created_by_name || "—" }) ||
                `By ${(selectedGame as any).created_by_name || "—"}`}
            </div>
          </div>
          <span className="shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-white/10 text-white border border-white/10">
            {((selectedGame as any).isPublic ?? 0) === 1
              ? t("home.public") || "Public"
              : t("home.private") || "Private"}
          </span>
        </div>
        {selectedGame.description && (
          <div className="text-white/90">{selectedGame.description}</div>
        )}
        <div className="flex flex-wrap items-center gap-3 text-xs text-white/80">
          <span className="inline-flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 8l6 6H6z" />
            </svg>
            {(selectedGame as any).qcount || 0} {t("home.questions") || "questions"}
          </span>
          <span className="inline-flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 12a9 9 0 1118 0 9 9 0 01-18 0zm9-5a5 5 0 100 10 5 5 0 000-10z" />
            </svg>
            {(selectedGame as any).plays ?? (selectedGame as any).playthroughs ?? 0}{" "}
            {t("home.plays") || "plays"}
          </span>
        </div>

        <div className="rounded-2xl bg-white/10 backdrop-blur-md p-4 border border-white/10 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-white/80">
              {t("home.pin") || "PIN"}
            </div>
            <div className="text-3xl font-extrabold text-white">{newGamePin}</div>
          </div>
          <div className="flex gap-2">
            <button
              className="rounded-lg bg-white/10 border border-white/10 px-3 py-1 text-white text-sm font-semibold shadow hover:bg-white/20 transition"
              onClick={onCopyPin}
            >
              {t("home.copyPin") || "Copy PIN"}
            </button>
            <button
              className="rounded-lg bg-white/10 border border-white/10 px-3 py-1 text-white text-sm font-semibold shadow hover:bg-white/20 transition"
              onClick={onCopyLink}
            >
              {t("home.copyLink") || "Copy link"}
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            className="relative overflow-hidden flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 px-6 py-3 text-lg font-bold text-white shadow-xl hover:shadow-2xl active:scale-95 transition disabled:opacity-60 md:px-5 md:py-2.5 md:text-base"
            onClick={onStartGame}
            disabled={isStarting}
          >
            {isStarting ? t("home.starting") || "Starting…" : t("home.startGame") || "Start game"}
            <span
              className="pointer-events-none absolute inset-0 animate-shine"
              style={{
                background:
                  "linear-gradient(110deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0) 100%)",
                backgroundSize: "200% 100%",
              }}
            />
          </button>
          <button
            className="rounded-xl bg-white/10 px-4 py-3 text-white font-semibold shadow border border-white/10 hover:bg-white/20 transition md:px-3 md:py-2 md:text-sm"
            onClick={onEditGame}
          >
            {t("home.edit") || "Edit"}
          </button>
          <button
            className="rounded-xl bg-white/10 px-4 py-3 text-white font-semibold shadow border border-white/10 hover:bg-white/20 transition md:px-3 md:py-2 md:text-sm"
            onClick={onClose}
          >
            {t("common.close") || "Close"}
          </button>
        </div>

        <div className="text-xs text-gray-700">
          {t("home.hint") || "Upgrades are available in-game. Premium gives more options."}
        </div>
      </div>
    ) : null}
  </Modal>
);

export default HomeGameModal;
