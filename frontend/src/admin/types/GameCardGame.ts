export type GameCardTag = {
  slug: string;
  name: string;
};

export type GameCardGame = {
  id: string;
  title: string;
  description?: string | null;
  coverUrl?: string | null;
  questionCount?: number | null;
  playCount?: number | null;
  participantCount?: number | null;
  favoriteCount?: number | null;
  isFavorite?: boolean;
  isPublic?: boolean;
  updatedAt?: string | Date | null;
  createdAt?: string | Date | null;
  lastPlayedAt?: string | Date | null;
  difficulty?: string | null;
  creatorName?: string | null;
  creatorUserId?: string | null;
  tags?: GameCardTag[];
  accentKey?: string | null;
};
