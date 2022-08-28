import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { User } from '@/auth/user.decorator';
import { imageFileFilter } from '@/common/decorators/file.decorator';
import { FileValidationErrorReqType } from '@/common/types/image-request.type';
import { CreateLogDto } from '@/log/dto/request/create-log.dto';
import { UpdateLogDto } from '@/log/dto/request/update-log.dto';
import { LogService } from '@/log/log.service';
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
  UseInterceptors,
} from '@nestjs/common';
import { CursorPaginationRequestDto } from '@/common/dto/request/pagination-request.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CursorPaginationLogResponseDto } from '@/log/dto/response/cursor-pagination-log-response.dto';
import { LogResponseDto } from '@/log/dto/response/log-response.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ShortLogResponseDto } from '@/common/dto/response/short-log-response.dto';

@ApiTags('끼록 > 간단 끼록')
@Controller('logs')
export class LogController {
  constructor(private readonly logService: LogService) {}

  @ApiOperation({ summary: '간단 끼록 생성' })
  @ApiBearerAuth('jwt')
  @ApiBody({ type: CreateLogDto })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('images', undefined, {
      fileFilter: imageFileFilter,
      limits: {
        fileSize: 1048576, // 10 M
      },
    }),
  )
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Req() req: FileValidationErrorReqType,
    @User() user: UserWithoutPassword,
    @Body() createLogDto: CreateLogDto,
    @UploadedFiles()
    images: Express.Multer.File[],
  ) {
    if (!images || images.length === 0) {
      throw new BadRequestException('you should upload at least one image');
    }

    if (req.fileValidationError) {
      throw new BadRequestException(req.fileValidationError);
    }

    return await this.logService.create(createLogDto, images, user);
  }

  @ApiOperation({ summary: '간단 끼록 목록 조회' })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({
    description: '성공',
    type: ShortLogResponseDto,
    isArray: true,
  })
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Query() cursorPaginationRequestDto: CursorPaginationRequestDto,
    @User() user: UserWithoutPassword,
  ) {
    if (cursorPaginationRequestDto.endCursor && !cursorPaginationRequestDto.pageSize) {
      throw new BadRequestException('endCursor는 있는데 pageSize가 없을수 없어요');
    }
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
  @ApiBody({ type: UpdateLogDto })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('images', undefined, {
      fileFilter: imageFileFilter,
      limits: {
        fileSize: 1048576, // 10 M
      },
    }),
  )
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Req() req: FileValidationErrorReqType,
    @User() user: UserWithoutPassword,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLogDto: UpdateLogDto,
    @UploadedFiles()
    images: Express.Multer.File[],
  ) {
    if (!images || images.length === 0) {
      throw new BadRequestException('you should upload at least one image');
    }

    if (req.fileValidationError) {
      throw new BadRequestException(req.fileValidationError);
    }

    return await this.logService.update(id, updateLogDto, images, user);
  }

  @ApiOperation({ summary: '간단 끼록 삭제' })
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number, @User() user: UserWithoutPassword) {
    return await this.logService.delete(id, user);
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

  @ApiOperation({ summary: '간단 끼록 스크랩' })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({
    description: '성공',
    type: LogResponseDto,
  })
  @UseGuards(JwtAuthGuard)
  @Post(':id/scrap')
  scrap(@Param('id', ParseIntPipe) id: number, @User() user: UserWithoutPassword) {
    return this.logService.scrap(id, user, 'scrap');
  }

  @ApiOperation({ summary: '간단 끼록 스크랩 취소' })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({
    description: '성공',
    type: LogResponseDto,
  })
  @UseGuards(JwtAuthGuard)
  @Post(':id/unscrap')
  cancelScrap(@Param('id', ParseIntPipe) id: number, @User() user: UserWithoutPassword) {
    return this.logService.scrap(id, user, 'unscrap');
  }
}
