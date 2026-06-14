import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return databaseUrl;

  try {
    const url = new URL(databaseUrl);
    if (!url.searchParams.has('connection_limit')) {
      url.searchParams.set('connection_limit', process.env.PRISMA_CONNECTION_LIMIT || '3');
    }
    if (!url.searchParams.has('connect_timeout')) {
      url.searchParams.set('connect_timeout', process.env.PRISMA_CONNECT_TIMEOUT || '10');
    }
    return url.toString();
  } catch {
    return databaseUrl;
  }
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
      datasources: {
        db: {
          url: getDatabaseUrl(),
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
