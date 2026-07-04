import { PrismaClient } from '@/prisma/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;

if (!connectionString) {
  throw new Error('Missing DIRECT_URL or DATABASE_URL for Prisma');
}

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg(connectionString),
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
