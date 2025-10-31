import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';

export interface EnsureUserProfileOptions {
  userId: string;
  username?: string | null;
  email?: string | null;
  name?: string | null;
  isPremium?: boolean;
}

export interface UserProfile {
  userId: string;
  username: string;
  memberSince: Date;
  premiumSince: Date | null;
  level: number;
  xp: number;
  totalPoints: number;
  playedQuizzes: number;
  createdQuizzes: number;
  lastActiveAt: Date | null;
  updatedAt: Date;
}

function sanitizeUsername(candidate: string | null | undefined): string | null {
  if (!candidate) return null;
  const cleaned = candidate
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9._-]/g, '')
    .replace(/_+/g, '_');
  if (!cleaned) return null;
  return cleaned.slice(0, 64);
}

function normalizeNumber(value?: bigint | number | null): number {
  if (value == null) return 0;
  return Number(value);
}

function toUserProfile(record: any): UserProfile {
  return {
    userId: record.user_id,
    username: record.username,
    memberSince: record.member_since,
    premiumSince: record.premium_since,
    level: normalizeNumber(record.level),
    xp: normalizeNumber(record.xp),
    totalPoints: normalizeNumber(record.total_points),
    playedQuizzes: normalizeNumber(record.played_quizzes),
    createdQuizzes: normalizeNumber(record.created_quizzes),
    lastActiveAt: record.last_active_at ?? null,
    updatedAt: record.updated_at,
  };
}

export async function ensureUserProfile(options: EnsureUserProfileOptions): Promise<UserProfile> {
  const { userId, username, email, name, isPremium } = options;
  if (!userId) throw new Error('Missing userId');
  const now = new Date();
  const baseUsernameCandidates = [
    username,
    name,
    email ? email.split('@')[0] : null,
    userId,
  ].map(sanitizeUsername).filter((v, idx, arr) => v && arr.indexOf(v) === idx) as string[];

  const existing = await prisma.users.findUnique({ where: { user_id: userId } });
  if (existing) {
    const update: any = {
      last_active_at: now,
      updated_at: now,
    };
    if (isPremium && !existing.premium_since) {
      update.premium_since = now;
    }
    try {
      const updated = await prisma.users.update({
        where: { user_id: userId },
        data: update,
      });
      return toUserProfile(updated);
    } catch (err: any) {
      logger.error('Failed to update user profile', { userId, error: err?.message || err });
      throw err;
    }
  }

  const creationCandidates = baseUsernameCandidates.length ? baseUsernameCandidates : [sanitizeUsername(userId) || `user_${userId.slice(0, 8)}`];

  for (let attempt = 0; attempt < creationCandidates.length + 3; attempt += 1) {
    const candidateIdx = attempt < creationCandidates.length ? attempt : creationCandidates.length - 1;
    let candidate = creationCandidates[candidateIdx];
    if (!candidate) candidate = `user_${userId.slice(0, 8)}`;
    if (attempt >= creationCandidates.length) {
      candidate = sanitizeUsername(`${candidate}_${attempt}`) || candidate;
    }
    try {
      const created = await prisma.users.create({
        data: {
          user_id: userId,
          username: candidate,
          member_since: now,
          premium_since: isPremium ? now : null,
          last_active_at: now,
          updated_at: now,
        },
      });
      return toUserProfile(created);
    } catch (err: any) {
      if (err?.code === 'P2002' && Array.isArray(err?.meta?.target) && err.meta.target.includes('username')) {
        logger.warn('Username conflict while creating user profile, retrying', { userId, candidate });
        continue;
      }
      logger.error('Failed to create user profile', { userId, error: err?.message || err });
      throw err;
    }
  }

  throw new Error(`Unable to create user profile for ${userId}`);
}

export function buildProfileResponse(profile: UserProfile, extras?: { email?: string | null; name?: string | null; preferredUsername?: string | null }) {
  return {
    userId: profile.userId,
    username: profile.username,
    preferredUsername: extras?.preferredUsername ?? null,
    email: extras?.email ?? null,
    name: extras?.name ?? null,
    level: profile.level,
    xp: profile.xp,
    totalPoints: profile.totalPoints,
    playedQuizzes: profile.playedQuizzes,
    createdQuizzes: profile.createdQuizzes,
    memberSince: profile.memberSince,
    premiumSince: profile.premiumSince,
    isPremium: Boolean(profile.premiumSince),
    lastActiveAt: profile.lastActiveAt,
    updatedAt: profile.updatedAt,
  };
}
