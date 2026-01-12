import type { MouseEvent, ReactNode } from "react";
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
  edit: string;
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

// -------------------- HJELPEFUNKSJONER --------------------

// Brandet, lyst glasskort med lilla shadow
const baseCardClasses =
  "relative rounded-2xl border border-[#E0E2FF] bg-gradient-to-br from-white via-white to-[#F4F3FF] backdrop-blur-xl shadow-[0_18px_40px_rgba(106,113,250,0.18)] transition-all duration-200 overflow-hidden";

const buildAccentGradient = (_seed: string) =>
  "linear-gradient(120deg,#6A71FA,#9C8AFA,#6A71FA)";

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

const formatLastPlayed = (dateStr?: string | Date | null) => {
  if (!dateStr) return undefined;
  return new Date(dateStr).toLocaleString();
};

const getCreatorLevel = (level?: number | null) => {
  if (level == null || Number.isNaN(level)) return null;
  return Math.max(0, Math.floor(level));
};

// -------------------- SMÅ KOMPONENTER --------------------

type StatPillProps = {
  icon: ReactNode;
  label: string;
};

const StatPill = ({ icon, label }: StatPillProps) => (
  <span
    className="
      inline-flex items-center gap-1 px-3 py-1 rounded-full 
      bg-[#6A71FA0D] border border-[#6A71FA22] 
      text-[11px] font-medium text-[#303057]
    "
  >
    {icon}
    {label}
  </span>
);

type PrivacyBadgeProps = {
  isPublic: boolean;
  labelPublic: string;
  labelPrivate: string;
};

const PrivacyBadge = ({ isPublic, labelPublic, labelPrivate }: PrivacyBadgeProps) => {
  const label = isPublic ? labelPublic : labelPrivate;

  const icon = isPublic ? (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3a9 9 0 019 9 9 9 0 01-18 0 9 9 0 019-9zm0 2a7 7 0 100 14 7 7 0 000-14zm0 3a4 4 0 014 4h-2a2 2 0 10-2 2v2h-2v-2a4 4 0 012-7z" />
    </svg>
  ) : (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 10V8a6 6 0 0112 0v2h1a1 1 0 011 1v9a1 1 0 01-1 1H5a1 1 0 01-1-1v-9a1 1 0 011-1h1zm2-2a4 4 0 118 0v2H8V8zm-1 4v7h10v-7H7z" />
    </svg>
  );

  return (
    <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-slate-500">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#6A71FA0F] border border-[#6A71FA33] text-[#6A71FA]">
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </div>
  );
};

type FavoriteButtonProps = {
  isFavorite: boolean;
  label: string;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
};

const FavoriteButton = ({ isFavorite, label, onClick }: FavoriteButtonProps) => {
  if (!onClick) return null;

  return (
    <button
      type="button"
      className="
        absolute top-2 right-2 rounded-full p-1.5 
        bg-white/80 backdrop-blur 
        border border-[#9C8AFA55] 
        text-[#6A71FA] hover:bg-white
        transition
      "
      onClick={onClick}
      aria-label={label}
    >
      {isFavorite ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1 4.5 2.09C12.09 5 13.76 4 15.5 4 18 4 20 6 20 8.5c0 3.78-3.4 6.86-8.55 11.54z" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16.5,3c-1.74,0-3.41,0.81-4.5,2.09C10.91,3.81,9.24,3,7.5,3C4.42,3,2,5.42,2,8.5c0,3.57,3.05,6.4,7.68,10.74L12,21.35 l2.32-2.11C18.95,14.9,22,12.07,22,8.5C22,5.42,19.58,3,16.5,3z M12.1,18.55l-0.1-0.1l-0.11,0.1C7.14,14.24,4,11.39,4,8.5 C4,6.5,5.5,5,7.5,5c1.54,0,3.04,1,3.57,2.36h1.87C13.46,6,14.96,5,16.5,5C18.5,5,20,6.5,20,8.5C20,11.39,16.86,14.24,12.1,18.55z" />
        </svg>
      )}
    </button>
  );
};

type CreatorInfoProps = {
  game: GameCardGame;
  labels: GameCardLabels;
  onCreatorClick?: (game: GameCardGame) => void;
};

const CreatorInfo = ({ game, labels, onCreatorClick }: CreatorInfoProps) => {
  if (!game.creatorName) return null;

  const creatorIsPremium = Boolean(game.creatorIsPremium);
  const creatorLevel = getCreatorLevel(game.creatorLevel);
  const canClick = Boolean(onCreatorClick && game.creatorUserId);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (canClick) {
      onCreatorClick?.(game);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!canClick}
      className={`w-full text-left transition bg-[linear-gradient(120deg,#6A71FA,#9C8AFA,#6A71FA)]/80 bg-cover ${
        canClick ? "hover:scale-[1.01]" : "cursor-default opacity-90"
      }`}
    >
      <div
        className={`flex items-center gap-3 px-3 py-2 ${
          creatorIsPremium
            ? "bg-[#6A71FA]"
            : "bg-[#9C8AFA]"
        }`}
      >
        <div
          className={`h-6 w-6 shrink-0 rounded-full flex items-center justify-center text-md font-bold text-[#6A71FA] ${
            creatorIsPremium
              ? "bg-white"
              : "bg-white"
          }`}
        >
          {creatorLevel != null ? creatorLevel : "0"}
        </div>
        <div className="min-w-0 flex-1 text-left">
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/80 font-bold">
            {labels.creator}
          </div>
          <div className="text-sm font-bold text-white truncate">
            {game.creatorName}
          </div>
        </div>
        {canClick && (
          <div className="ml-auto flex items-center gap-1 text-[11px] font-semibold text-[#6A71FA]">
            {labels.viewCreator}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 3l7 7-7 7v-4H3v-6h11V3z" />
            </svg>
          </div>
        )}
      </div>
    </button>
  );
};

type ActionButtonsProps = {
  game: GameCardGame;
  actions: GameCardAction[];
};

const ActionButtons = ({ game, actions }: ActionButtonsProps) => {
  if (!actions.length) return null;

  const handleClick =
    (action: GameCardAction) => (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      if (!action.disabled) {
        action.onClick(game, event);
      }
    };

  return (
    <div className="flex flex-wrap gap-2 pt-2">
      {actions.map((action, index) => {
        const kind = action.kind ?? (index === 0 ? "primary" : "secondary");
        const baseClasses =
          kind === "primary"
            ? "relative overflow-hidden rounded-lg bg-gradient-to-r from-[#6A71FA] via-[#9C8AFA] to-[#6A71FA] px-4 py-2 text-white font-semibold shadow hover:shadow-lg active:scale-95 transition text-sm"
            : "rounded-lg bg-white border border-[#D7DAFF] px-4 py-2 text-[#303057] font-semibold shadow-sm hover:bg-[#F4F3FF] active:scale-95 transition text-sm";

        return (
          <button
            key={`${action.label}-${index}`}
            type="button"
            className={`${baseClasses} ${
              action.disabled ? "opacity-70 cursor-not-allowed" : ""
            }`}
            onClick={handleClick(action)}
            disabled={action.disabled}
          >
            {action.label}
          </button>
        );
      })}
    </div>
  );
};

// -------------------- HOVEDKOMPONENT --------------------

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

  const questionCount = formatNumber(game.questionCount);
  const playCount = formatNumber(game.playCount);
  const participantCount = formatNumber(game.participantCount);
  const favoriteCount = formatNumber(game.favoriteCount);
  const difficultyText = game.difficulty?.toString().trim();
  const lastPlayed = formatLastPlayed(game.lastPlayedAt);

  const canEdit = Boolean(onEdit && game.ownedByCurrentUser);
  const actionButtons = actions?.filter(Boolean) ?? [];

  const handleFavoriteClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onToggleFavorite?.(game);
  };

  const handleEditClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onEdit?.(game);
  };

  return (
    <div
      className={[
        baseCardClasses,
        clickable
          ? "hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(106,113,250,0.28)] cursor-pointer"
          : "",
        className || "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={clickable ? () => onClick?.(game) : undefined}
    >
      {/* Toppstripen med brand-gradient */}
      <div
        className="absolute inset-x-0 top-0 h-1.5"
        style={{ background: accent }}
      />

      {/* Bilde / header */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <img src={cover} alt={game.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />

        {/* Stats over bildet */}
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

        {/* Favoritt-knapp */}
        <FavoriteButton
          isFavorite={Boolean(game.isFavorite)}
          label={labels.favorites}
          onClick={onToggleFavorite ? handleFavoriteClick : undefined}
        />
      </div>

      {/* Creator */}
        <CreatorInfo game={game} labels={labels} onCreatorClick={onCreatorClick} />


      {/* Innhold */}
      <div className="px-6 py-5 space-y-4 bg-white/70 backdrop-blur-sm rounded-b-2xl">



      


        {/* Tittel + privacy + edit */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <PrivacyBadge
              isPublic={Boolean(game.isPublic)}
              labelPublic={labels.public}
              labelPrivate={labels.private}
            />
            <div className="mt-2 text-lg font-semibold leading-snug text-slate-900 line-clamp-2">
              {game.title}
            </div>
          </div>

          {canEdit && (
            <button
              type="button"
              onClick={handleEditClick}
              className="shrink-0 rounded-full bg-white border border-[#DADFFF] p-2 text-[#4B4D99] hover:bg-[#F4F3FF] transition"
              aria-label={labels.edit}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM21.41 6.34a1.25 1.25 0 000-1.77l-1.98-1.98a1.25 1.25 0 00-1.77 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
              </svg>
            </button>
          )}
        </div>

        {/* Beskrivelse */}
        {game.description && (
          <div className="text-sm leading-relaxed text-slate-600 line-clamp-3">
            {game.description}
          </div>
        )}

        {/* Stats-rad under beskrivelsen */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
          {playCount && (
            <StatPill
              icon={
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              }
              label={`${playCount} ${labels.plays}`}
            />
          )}

          {participantCount && (
            <StatPill
              icon={
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V20h6v-1c0-1.54.6-2.94 1.58-4C6.82 14.37 6.4 14 8 14c1.6 0 3.18.37 4.42 1.5A5.96 5.96 0 0116 13c3.33 0 6 1.34 6 3.5V20h-6v-1c0-1.54-.6-2.94-1.58-4C17.18 14.37 17.6 14 16 14z" />
                </svg>
              }
              label={`${participantCount} ${labels.participants}`}
            />
          )}

          {favoriteCount && (
            <StatPill
              icon={
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1 4.5 2.09C12.09 5 13.76 4 15.5 4 18 4 20 6 20 8.5c0 3.78-3.4 6.86-8.55 11.54z" />
                </svg>
              }
              label={`${favoriteCount} ${labels.favorites}`}
            />
          )}

          {difficultyText && (
            <StatPill
              icon={
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 12h18v2H3z" />
                </svg>
              }
              label={`${labels.difficulty}: ${difficultyText}`}
            />
          )}

          {lastPlayed && (
            <StatPill
              icon={
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm.5 5h-1v6l5 3 .5-.866-4.5-2.634V7z" />
                </svg>
              }
              label={lastPlayed}
            />
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 6).map((tag) => (
              <span
                key={tag.slug || tag.name}
                className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold bg-[#F4F3FF] text-[#4B4D99] border border-[#E0E2FF]"
              >
                {tag.name || tag.slug}
              </span>
            ))}
            {tags.length > 6 && (
              <span className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold bg-[#F4F3FF] text-[#4B4D99] border border-[#E0E2FF]">
                +{tags.length - 6}
              </span>
            )}
          </div>
        )}

        

        {/* Actions */}
        <ActionButtons game={game} actions={actionButtons} />
      </div>
    </div>
  );
};

export default GameCard;
