import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { User } from '@/auth/user.decorator';
import { ApiImages } from '@/common/decorators/file.decorator';
import { CursorPaginationRequestDto } from '@/common/dto/request/pagination-request.dto';
import { FileValidationErrorReqType } from '@/common/types/image-request.type';
import { DetailLogService } from '@/detail-log/detail-log.service';
import { CreateDetailLogDto } from '@/detail-log/dtos/request/create-detail-log.dto';
import { CursorPaginationDetailLogResponseDto } from '@/detail-log/dtos/response/cursor-pagination-detail-log-response.dto';
import { DetailLogResponseDto } from '@/detail-log/dtos/response/detail-log-response.dto';
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
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('끼록 > 상세 끼록')
@Controller('detail-log')
export class DetailLogController {
  constructor(
    private readonly detailLogService: DetailLogService,
    private readonly s3Service: S3Service,
  ) {}

  @ApiOperation({ summary: '상세 끼록 생성' })
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createDetailLogDto: CreateDetailLogDto, @User() user: UserWithoutPassword) {
    return await this.detailLogService.create(createDetailLogDto, user);
  }

  @ApiOperation({ summary: '상세 끼록 목록 조회(페이지네이션)' })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({
    description: '성공',
    type: CursorPaginationDetailLogResponseDto,
  })
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Query() cursorPaginationRequestDto: CursorPaginationRequestDto,
    @User() user: UserWithoutPassword,
  ) {
    return await this.detailLogService.findAll(cursorPaginationRequestDto, user);
  }

  @ApiOperation({ summary: '상세 끼록 하나 조회 ' })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({
    description: '성공',
    type: DetailLogResponseDto,
  })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @User() user: UserWithoutPassword) {
    return await this.detailLogService.findById(id, user);
  }

  @ApiOperation({ summary: '상세 끼록 이미지 업로드' })
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
      throw new BadRequestException('you should upload at least two images');
    }

    if (req.fileValidationError) {
      throw new BadRequestException('file only allowed image file (file ext: jpg, jpeg, png, gif)');
    }

    return this.s3Service.upload(images, 'recipe');
  }

  @ApiOperation({ summary: '상세 끼록 삭제' })
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number, @User() user: UserWithoutPassword) {
    return await this.detailLogService.delete(id, user);
  }

  @ApiOperation({ summary: '상세 끼록 좋아요' })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({
    description: '성공',
    type: DetailLogResponseDto,
  })
  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  like(@Param('id', ParseIntPipe) id: number, @User() user: UserWithoutPassword) {
    return this.detailLogService.like(id, user, 'like');
  }

  @ApiOperation({ summary: '상세 끼록 좋아요 취소' })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({
    description: '성공',
    type: DetailLogResponseDto,
  })
  @UseGuards(JwtAuthGuard)
  @Post(':id/unlike')
  cancelLike(@Param('id', ParseIntPipe) id: number, @User() user: UserWithoutPassword) {
    return this.detailLogService.like(id, user, 'unlike');
  }

  @ApiOperation({ summary: '상세 끼록 스크랩' })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({
    description: '성공',
    type: DetailLogResponseDto,
  })
  @UseGuards(JwtAuthGuard)
  @Post(':id/scrap')
  scrap(@Param('id', ParseIntPipe) id: number, @User() user: UserWithoutPassword) {
    return this.detailLogService.scrap(id, user, 'scrap');
  }

  @ApiOperation({ summary: '상세 끼록 스크랩 취소' })
  @ApiBearerAuth('jwt')
  @ApiOkResponse({
    description: '성공',
    type: DetailLogResponseDto,
  })
  @UseGuards(JwtAuthGuard)
  @Post(':id/unscrap')
  cancelScrap(@Param('id', ParseIntPipe) id: number, @User() user: UserWithoutPassword) {
    return this.detailLogService.scrap(id, user, 'unscrap');
  }
}
