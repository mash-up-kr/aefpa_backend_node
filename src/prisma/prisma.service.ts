import { PrismaClient, User } from '@/api/server/generated';
import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private primsaClient: PrismaClient;

  constructor() {
    super();
    this.primsaClient = new PrismaClient();
  }

  async onModuleInit() {
    await this.primsaClient.$connect();
  }

  enableShutdownHooks(app: INestApplication) {
    this.primsaClient.$on('beforeExit', () => {
      app.close();
    });
  }

  //TODO:프리즈마 사용 파일 분리, 모듈화
  // == prisma example == //
  async create(user: User) {
    return await this.primsaClient.user.create({
      data: user,
    });
  }

  async findUserById(userIdx: number) {
    return await this.primsaClient.user.findUnique({
      where: {
        id: userIdx,
      },
    });
  }
}
