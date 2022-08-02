import { Controller, Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

@Controller()
export class AppController {
  @ApiOperation({ summary: 'Health Check' })
  @Get()
  async getHello() {
    console.log('test');
    return 'ggi-rok';
  }
}
