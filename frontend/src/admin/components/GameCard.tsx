import { MouseEvent } from "react";
import placeholderImg from "../../images/tavl-placeholder.jpg";
import { GameCardGame, GameCardTag } from "../types/GameCardGame";

export type GameCardLabels = {
  questions: string;
  plays: string;
  participants: string;
  favorites: string;
  difficulty: string;
  lastPlayed: string;
  creator: string;
  viewCreator: string;
  public: string;
  private: string;
  level: string;
};

export type GameCardAction = {
  label: string;
  kind?: "primary" | "secondary";
  disabled?: boolean;
  onClick: (game: GameCardGame, event?: MouseEvent<HTMLButtonElement>) => void;
};

type GameCardProps = {
  game: GameCardGame;
  labels: GameCardLabels;
  actions?: GameCardAction[];
  onClick?: (game: GameCardGame) => void;
  onToggleFavorite?: (game: GameCardGame) => void;
  onCreatorClick?: (game: GameCardGame) => void;
  onEdit?: (game: GameCardGame) => void;
  className?: string;
};

const baseCardClasses =
  "relative rounded-xl border border-white/10 bg-white/10 backdrop-blur-md transition-all duration-200 overflow-hidden";

const buildAccentGradient = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const hue = hash % 360;
  const hue2 = (hue + 35) % 360;
  return `linear-gradient(90deg, hsl(${hue} 80% 60% / 0.75) 0%, hsl(${hue2} 80% 55% / 0.35) 100%)`;
};

const formatNumber = (value?: number | null) => {
  if (value == null || value <= 0) return null;
  if (value >= 1000) {
    return `${Math.round(value / 100) / 10}k`;
  }
  return String(value);
};

const normalizeCover = (url?: string | null) => {
  if (!url) return placeholderImg;
  const trimmed = url.trim();
  return trimmed.length > 0 ? trimmed : placeholderImg;
};

const mapTags = (tags?: GameCardTag[]) =>
  Array.isArray(tags) ? tags.filter((tag) => Boolean(tag?.name || tag?.slug)) : [];

const GameCard = ({
  game,
  labels,
  actions,
  onClick,
  onToggleFavorite,
  onCreatorClick,
  onEdit,
  className,
}: GameCardProps) => {
  const clickable = typeof onClick === "function";
  const accent = buildAccentGradient(game.accentKey || game.id);
  const cover = normalizeCover(game.coverUrl);
  const tags = mapTags(game.tags);

  const questionCount = formatNumber(game.questionCount ?? null);
  const playCount = formatNumber(game.playCount ?? null);
  const participantCount = formatNumber(game.participantCount ?? null);
  const favoriteCount = formatNumber(game.favoriteCount ?? null);

  const difficultyText = game.difficulty?.toString().trim();

  const lastPlayed =
    game.lastPlayedAt != null
      ? new Date(game.lastPlayedAt).toLocaleString()
      : undefined;

  const handleActionClick =
    (action: GameCardAction) => (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      if (!action.disabled) {
        action.onClick(game, event);
      }
    };

  const handleFavoriteClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onToggleFavorite?.(game);
  };

  const handleCreatorClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (game.creatorUserId) {
      onCreatorClick?.(game);
    }
  };

  const showCreatorInfo = Boolean(game.creatorName);
  const creatorIsPremium = Boolean(game.creatorIsPremium);
  const creatorLevel =
    game.creatorLevel != null && !Number.isNaN(game.creatorLevel)
      ? Math.max(0, Math.floor(game.creatorLevel))
      : null;
  const canEdit = Boolean(onEdit && game.ownedByCurrentUser);

  return (
    <div
      className={[
        baseCardClasses,
        clickable
          ? "hover:bg-white/15 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(236,72,153,0.15)] cursor-pointer"
          : "",
        className || "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={clickable ? () => onClick?.(game) : undefined}
    >
      <div className="absolute inset-x-0 top-0 h-1" style={{ background: accent }} />
      <div className="relative aspect-[16/9] overflow-hidden">
        <img src={cover} alt={game.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
        {(questionCount || playCount || participantCount) && (
          <div className="absolute top-2 left-2 flex gap-2">
            {questionCount && (
              <span className="bg-black/50 text-white text-xs font-semibold rounded-full px-2 py-0.5">
                {questionCount} {labels.questions}
              </span>
            )}
            {playCount && (
              <span className="bg-black/50 text-white text-xs font-semibold rounded-full px-2 py-0.5">
                {playCount} {labels.plays}
              </span>
            )}
            {participantCount && (
              <span className="bg-black/50 text-white text-xs font-semibold rounded-full px-2 py-0.5">
                {participantCount} {labels.participants}
              </span>
            )}
          </div>
        )}
        {onToggleFavorite && (
          <button
            type="button"
            className="absolute top-2 right-2 rounded-full bg-black/45 border border-white/20 p-1.5 text-white hover:bg-black/65 transition"
            onClick={handleFavoriteClick}
            aria-label={game.isFavorite ? labels.favorites : labels.favorites}
          >
            {game.isFavorite ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1 4.5 2.09C12.09 5 13.76 4 15.5 4 18 4 20 6 20 8.5c0 3.78-3.4 6.86-8.55 11.54z" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.5,3c-1.74,0-3.41,0.81-4.5,2.09C10.91,3.81,9.24,3,7.5,3C4.42,3,2,5.42,2,8.5c0,3.57,3.05,6.4,7.68,10.74L12,21.35 l2.32-2.11C18.95,14.9,22,12.07,22,8.5C22,5.42,19.58,3,16.5,3z M12.1,18.55l-0.1-0.1l-0.11,0.1C7.14,14.24,4,11.39,4,8.5 C4,6.5,5.5,5,7.5,5c1.54,0,3.04,1,3.57,2.36h1.87C13.46,6,14.96,5,16.5,5C18.5,5,20,6.5,20,8.5C20,11.39,16.86,14.24,12.1,18.55z" />
              </svg>
            )}
          </button>
        )}
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="text-lg font-bold text-white line-clamp-2">{game.title}</div>
          {game.isPublic != null && (
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-white/10 text-white border border-white/10 shrink-0">
              {game.isPublic ? labels.public : labels.private}
            </span>
          )}
        </div>
        {game.description && (
          <div className="text-sm text-white/80 line-clamp-2 mb-3">{game.description}</div>
        )}
        <div className="flex flex-wrap items-center gap-2 text-xs text-white/80 mb-3">
          {favoriteCount && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-white/80 border border-white/10">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1 4.5 2.09C12.09 5 13.76 4 15.5 4 18 4 20 6 20 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              {favoriteCount} {labels.favorites}
            </span>
          )}
          {difficultyText && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-white/80 border border-white/10">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 12h18v2H3z" />
              </svg>
              {labels.difficulty}: {difficultyText}
            </span>
          )}
          {lastPlayed && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-white/80 border border-white/10" title={labels.lastPlayed}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm.5 5h-1v6l5 3 .5-.866-4.5-2.634V7z" />
              </svg>
              {lastPlayed}
            </span>
          )}
        </div>
        {tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {tags.slice(0, 6).map((tag) => (
              <span
                key={`${tag.slug || tag.name}`}
                className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold bg-white/10 text-white border border-white/10"
              >
                {tag.name || tag.slug}
              </span>
            ))}
            {tags.length > 6 && (
              <span className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold bg-white/10 text-white border border-white/10">
                +{tags.length - 6}
              </span>
            )}
          </div>
        )}
        {showCreatorInfo && (
          <button
            type="button"
            onClick={handleCreatorClick}
            disabled={!onCreatorClick || !game.creatorUserId}
            className={`w-full text-left transition ${
              onCreatorClick && game.creatorUserId
                ? "hover:scale-[1.01]"
                : "cursor-default opacity-90"
            }`}
          >
            <div
              className={`flex items-center gap-3 rounded-2xl border px-3 py-2 ${
                creatorIsPremium
                  ? "border-amber-200/40 bg-gradient-to-r from-amber-400/20 via-pink-500/15 to-indigo-500/20"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <div
                className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-sm font-semibold text-white shadow-inner ${
                  creatorIsPremium
                    ? "bg-gradient-to-br from-amber-400 via-pink-500 to-purple-600"
                    : "bg-white/15"
                }`}
              >
                {creatorLevel != null ? creatorLevel : "—"}
              </div>
              <div className="min-w-0 flex-1 text-left">
                <div className="text-[10px] uppercase tracking-[0.18em] text-white/60">
                  {labels.creator}
                </div>
                <div className="text-sm font-semibold text-white truncate">
                  {game.creatorName}
                </div>
              </div>
              {onCreatorClick && game.creatorUserId && (
                <div className="ml-auto flex items-center gap-1 text-[11px] font-semibold text-white/80">
                  {labels.viewCreator}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14 3l7 7-7 7v-4H3v-6h11V3z" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        )}
        {(actions?.length || canEdit) && (
          <div className="mb-3 flex flex-wrap gap-2 pt-1">
            {actions?.map((action, index) => {
              const kind = action.kind ?? (index === 0 ? "primary" : "secondary");
              const baseClasses =
                kind === "primary"
                  ? "relative overflow-hidden rounded-lg bg-gradient-to-r from-indigo-500 to-pink-500 px-4 py-2.5 text-white font-semibold shadow hover:shadow-lg active:scale-95 transition text-sm"
                  : "rounded-lg bg-white/10 border border-white/10 px-4 py-2.5 text-white font-semibold shadow hover:bg-white/20 active:scale-95 transition text-sm";
              return (
                <button
                  key={`${action.label}-${index}`}
                  type="button"
                  className={`${baseClasses} ${action.disabled ? "opacity-70 cursor-not-allowed" : ""}`}
                  onClick={handleActionClick(action)}
                  disabled={action.disabled}
                >
                  {action.label}
                </button>
              );
            })}
            {canEdit && (
              <button
                type="button"
                className="rounded-lg bg-white/10 border border-white/15 px-4 py-2.5 text-white font-semibold shadow hover:bg-white/20 active:scale-95 transition text-sm"
                onClick={() => onEdit?.(game)}
              >
                Rediger
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameCard;
