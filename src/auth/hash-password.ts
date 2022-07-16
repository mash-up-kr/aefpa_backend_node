import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcrypt';

@Injectable()
export class HashPassword {
  async hash(plain: string): Promise<string> {
    const saltOrRounds = 10;
    return await hash(plain, saltOrRounds);
  }

  async equal({ password, hashPassword }: { password: string; hashPassword: string }) {
    return await compare(password, hashPassword);
  }
}
