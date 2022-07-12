import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { User } from '@/auth/user.decorator';
import { CreateLogDto } from '@/log/dto/create-log.dto';
import { UpdateLogDto } from '@/log/dto/update-log.dto';
import { LogService } from '@/log/log.service';
import { UserWithoutPassword } from '@/user/entity/user.entity';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('끼록 > 로그')
@Controller('logs')
export class LogController {
  constructor(private readonly logService: LogService) {}

  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createLogDto: CreateLogDto, @User() user: UserWithoutPassword) {
    return await this.logService.create(createLogDto, user);
  }

  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@User() user: UserWithoutPassword) {
    return await this.logService.findAll(user);
  }

  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.logService.findById(id);
  }

  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLogDto: UpdateLogDto,
    @User() user: UserWithoutPassword,
  ) {
    return await this.logService.update(id, updateLogDto, user);
  }

  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number, @User() user: UserWithoutPassword) {
    return await this.logService.delete(id, user);
  }
}
