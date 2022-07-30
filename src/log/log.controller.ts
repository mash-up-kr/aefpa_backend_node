import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { User } from '@/auth/user.decorator';
import { ApiImages } from '@/common/decorators/file.decorator';
import { FileValidationErrorReqType } from '@/common/types/image-request.type';
import { CreateLogDto } from '@/log/dto/create-log.dto';
import { UpdateLogDto } from '@/log/dto/update-log.dto';
import { LogService } from '@/log/log.service';
import { S3Service } from '@/s3/s3.service';
import { UserWithoutPassword } from '@/user/entity/user.entity';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import { CursorPaginationRequestDto } from '@/common/dto/request/pagination-request.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('끼록 > 로그')
@Controller('logs')
export class LogController {
  constructor(private readonly logService: LogService, private readonly s3Service: S3Service) {}

  @ApiOperation({ summary: '로그 생성' })
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createLogDto: CreateLogDto, @User() user: UserWithoutPassword) {
    return await this.logService.create(createLogDto, user);
  }

  @ApiOperation({ summary: '로그 목록 조회(페이지네이션)' })
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Query() cursorPaginationRequestDto: CursorPaginationRequestDto,
    @User() user: UserWithoutPassword,
  ) {
    return await this.logService.findAll(cursorPaginationRequestDto, user);
  }

  @ApiOperation({ summary: '로그 하나 조회' })
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.logService.findById(id);
  }

  @ApiOperation({ summary: '로그 수정' })
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

  @ApiOperation({ summary: '로그 삭제' })
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number, @User() user: UserWithoutPassword) {
    return await this.logService.delete(id, user);
  }

  @ApiOperation({ summary: '로그 이미지 업로드' })
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard)
  @Post('upload-image')
  @ApiImages('images')
  upload(
    @Req() req: FileValidationErrorReqType,
    @UploadedFiles()
    images: Express.Multer.File[],
  ) {
    if (!images || images.length === 0) {
      throw new BadRequestException('you should upload at least one image');
    }

    if (req.fileValidationError) {
      throw new BadRequestException('file only allowed image file (file ext: jpg, jpeg, png, gif)');
    }

    return this.s3Service.upload(images, 'log');
  }
}
