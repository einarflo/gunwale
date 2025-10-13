import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export async function ensureDb() {
  // Warm up a simple query to ensure connectivity
  await prisma.$queryRawUnsafe('SELECT 1');
}

