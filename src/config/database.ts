import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { env } from './env.config';
import { logger } from '../common/utils/logger';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

export const pgPool =
  global.__pgPool ||
  new Pool({
    connectionString: env.DATABASE_URL,
  });

const adapter = new PrismaPg(pgPool);

export const prisma =
  global.__prisma ||
  new PrismaClient({
    adapter,
    log:
      env.NODE_ENV === 'development'
        ? ['warn', 'error']
        : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
  global.__pgPool = pgPool;
}

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');
  } catch (error) {
    logger.warn('PostgreSQL Database connection check: Database server offline or pending startup');
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    await pgPool.end();
    logger.info('Database disconnected gracefully');
  } catch (error) {
    logger.error('Error during database disconnect:', error);
  }
}
