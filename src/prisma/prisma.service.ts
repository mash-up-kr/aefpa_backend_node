import { PrismaClient } from '@/api/server/generated';
import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super();
  }

  async onModuleInit() {
    await this.$connect();
  }

  enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', () => {
      app.close();
    });
  }
}
