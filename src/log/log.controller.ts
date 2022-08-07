import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { User } from '@/auth/user.decorator';
import { ApiImages } from '@/common/decorators/file.decorator';
import { FileValidationErrorReqType } from '@/common/types/image-request.type';
import { CreateLogDto } from '@/log/dto/request/create-log.dto';
import { UpdateLogDto } from '@/log/dto/request/update-log.dto';
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
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CursorPaginationLogResponseDto } from '@/log/dto/response/cursor-pagination-log-response.dto';
import { LogResponseDto } from '@/log/dto/response/log-response.dto';

@ApiTags('끼록 > 간단 끼록')
@Controller('logs')
export class LogController {
  constructor(private readonly logService: LogService, private readonly s3Service: S3Service) {}

  @ApiOperation({ summary: '간단 끼록 생성' })
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createLogDto: CreateLogDto, @User() user: UserWithoutPassword) {
    return await this.logService.create(createLogDto, user);
  }

  @ApiOperation({ summary: '간단 끼록 목록 조회(페이지네이션)' })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({
    description: '성공',
    type: CursorPaginationLogResponseDto,
  })
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Query() cursorPaginationRequestDto: CursorPaginationRequestDto,
    @User() user: UserWithoutPassword,
  ) {
    return await this.logService.findAll(cursorPaginationRequestDto, user);
  }

  @ApiOperation({ summary: '간단 끼록 하나 조회' })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({
    description: '성공',
    type: LogResponseDto,
  })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @User() user: UserWithoutPassword) {
    return await this.logService.findById(id, user);
  }

  @ApiOperation({ summary: '간단 끼록 수정' })
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

  @ApiOperation({ summary: '간단 끼록 삭제' })
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number, @User() user: UserWithoutPassword) {
    return await this.logService.delete(id, user);
  }

  @ApiOperation({ summary: '간단 끼록 이미지 업로드' })
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

  @ApiOperation({ summary: '간단 끼록 좋아요' })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({
    description: '성공',
    type: LogResponseDto,
  })
  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  like(@Param('id', ParseIntPipe) id: number, @User() user: UserWithoutPassword) {
    return this.logService.like(id, user, 'like');
  }

  @ApiOperation({ summary: '간단 끼록 좋아요 취소' })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({
    description: '성공',
    type: LogResponseDto,
  })
  @UseGuards(JwtAuthGuard)
  @Post(':id/unlike')
  cancelLike(@Param('id', ParseIntPipe) id: number, @User() user: UserWithoutPassword) {
    return this.logService.like(id, user, 'unlike');
  }
}
