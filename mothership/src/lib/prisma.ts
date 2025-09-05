import { PrismaClient } from '../generated/prisma';

// Export a single PrismaClient instance (reused across the app)
export const prisma = new PrismaClient();

