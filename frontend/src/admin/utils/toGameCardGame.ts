import { GameCardGame } from "../types/GameCardGame";

type Overrides = Partial<GameCardGame>;

const sanitizeCover = (value?: string | null) => {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export const toGameCardGame = (raw: any, overrides: Overrides = {}): GameCardGame => {
  const id =
    overrides.id ??
    raw.uuid ??
    raw.id ??
    raw.game_id ??
    raw.slug ??
    raw.identifier ??
    raw.title ??
    "game";

  const cover =
    overrides.coverUrl ??
    sanitizeCover(raw.cover_image_url) ??
    sanitizeCover(raw.coverImageUrl) ??
    sanitizeCover(raw.coverUrl);

  const questionCount =
    overrides.questionCount ??
    raw.qcount ??
    raw.question_count ??
    raw.questionCount ??
    null;

  const playCount =
    overrides.playCount ??
    raw.plays ??
    raw.playthroughs ??
    raw.playCount ??
    null;

  const participantCount =
    overrides.participantCount ??
    raw.participants ??
    raw.participantCount ??
    null;

  const favoriteCount =
    overrides.favoriteCount ??
    raw.favCount ??
    raw.favoriteCount ??
    null;

  const isPublicValue =
    overrides.isPublic ??
    (raw.isPublic != null ? raw.isPublic === 1 || raw.isPublic === true : undefined);

  const creatorName =
    overrides.creatorName ??
    raw.creator_profile?.username ??
    raw.creator_username ??
    raw.created_by_name ??
    raw.creatorName ??
    null;

  const creatorUserId =
    overrides.creatorUserId ??
    raw.creator_profile?.userId ??
    raw.created_by ??
    raw.creatorUserId ??
    null;

  const creatorLevel =
    overrides.creatorLevel ??
    raw.creator_profile?.level ??
    raw.creator_level ??
    raw.level ??
    raw.creator_profile?.stats?.level ??
    raw.creator?.level ??
    null;

  const creatorIsPremium =
    overrides.creatorIsPremium ??
    (raw.creator_profile?.isPremium ??
      raw.creator_profile?.premium ??
      (raw.creator_profile?.premiumSince ? true : undefined) ??
      raw.creator_profile?.is_premium ??
      raw.creator_is_premium ??
      raw.creator?.isPremium ??
      null);

  const tags =
    overrides.tags ??
    (Array.isArray(raw.tags) ? raw.tags : Array.isArray(raw.tagList) ? raw.tagList : undefined);

  return {
    id: String(id),
    title: overrides.title ?? raw.name ?? raw.title ?? "",
    description: overrides.description ?? raw.description ?? null,
    coverUrl: cover,
    questionCount: questionCount != null ? Number(questionCount) : null,
    playCount: playCount != null ? Number(playCount) : null,
    participantCount: participantCount != null ? Number(participantCount) : null,
    favoriteCount: favoriteCount != null ? Number(favoriteCount) : null,
    isFavorite:
      overrides.isFavorite ??
      (raw.isFavorite != null ? Boolean(raw.isFavorite) : raw.favorite ?? undefined),
    isPublic: isPublicValue,
    updatedAt: overrides.updatedAt ?? raw.updated_at ?? raw.updatedAt ?? null,
    createdAt: overrides.createdAt ?? raw.created_at ?? raw.createdAt ?? null,
    lastPlayedAt: overrides.lastPlayedAt ?? raw.lastPlayedAt ?? raw.last_played_at ?? null,
    difficulty: overrides.difficulty ?? raw.difficulty ?? null,
    creatorName,
    creatorUserId,
    tags,
    accentKey:
      overrides.accentKey ??
      (typeof raw.accentKey === "string"
        ? raw.accentKey
        : tags && tags.length > 0
        ? String(tags[0].slug || tags[0].name)
        : String(id)),
    creatorLevel: creatorLevel != null ? Number(creatorLevel) : null,
    creatorIsPremium: creatorIsPremium != null ? Boolean(creatorIsPremium) : null,
    ownedByCurrentUser: overrides.ownedByCurrentUser ?? null,
  };
};
