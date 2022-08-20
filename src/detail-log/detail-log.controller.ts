import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { User } from '@/auth/user.decorator';
import { CursorPaginationRequestDto } from '@/common/dto/request/pagination-request.dto';
import { FileValidationErrorReqType } from '@/common/types/image-request.type';
import { DetailLogService } from '@/detail-log/detail-log.service';
import { CreateDetailLogDto } from '@/detail-log/dtos/request/create-detail-log.dto';
import { UpdateDetailLogDto } from '@/detail-log/dtos/request/update-detail-log.dto';
import { CursorPaginationDetailLogResponseDto } from '@/detail-log/dtos/response/cursor-pagination-detail-log-response.dto';
import { DetailLogResponseDto } from '@/detail-log/dtos/response/detail-log-response.dto';
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
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('끼록 > 상세 끼록')
@Controller('detail-log')
export class DetailLogController {
  constructor(private readonly detailLogService: DetailLogService) {}

  @ApiOperation({ summary: '상세 끼록 생성' })
  @ApiBearerAuth('jwt')
  @ApiBody({ type: CreateDetailLogDto })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'brandImage', maxCount: 1 },
      { name: 'recipeImages', maxCount: 100 },
    ]),
  )
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Req() req: FileValidationErrorReqType,
    @User() user: UserWithoutPassword,
    @Body() createDetailLogDto: CreateDetailLogDto,
    @UploadedFiles()
    files: {
      brandImage: Express.Multer.File[];
      recipeImages: Express.Multer.File[];
    },
  ) {
    const { brandImage, recipeImages } = files;

    if (!brandImage || brandImage.length > 1) {
      throw new BadRequestException('you should upload one brandImage');
    }

    if (!recipeImages || recipeImages.length === 0) {
      throw new BadRequestException('you should upload at least one recipeImages');
    }

    if (createDetailLogDto.recipes?.length !== recipeImages.length) {
      throw new BadRequestException('요청한 레시피 수와 업로드할 레시피 이미지 수가 다릅니다.');
    }

    if (req.fileValidationError) {
      throw new BadRequestException(req.fileValidationError);
    }

    return await this.detailLogService.create(
      createDetailLogDto,
      brandImage[0],
      recipeImages,
      user,
    );
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

  @ApiOperation({ summary: '상세 끼록 수정' })
  @ApiBearerAuth('jwt')
  @ApiBody({ type: UpdateDetailLogDto })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'brandImage', maxCount: 1 },
      { name: 'recipeImages', maxCount: 100 },
    ]),
  )
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Req() req: FileValidationErrorReqType,
    @User() user: UserWithoutPassword,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDetailLogDto: UpdateDetailLogDto,
    @UploadedFiles()
    files: {
      brandImage: Express.Multer.File[];
      recipeImages: Express.Multer.File[];
    },
  ) {
    const { brandImage, recipeImages } = files;

    if (!brandImage || brandImage.length > 1) {
      throw new BadRequestException('you should upload one brandImage');
    }

    if (!recipeImages || recipeImages.length === 0) {
      throw new BadRequestException('you should upload at least one recipeImages');
    }

    if (updateDetailLogDto.recipes?.length !== recipeImages.length) {
      throw new BadRequestException('요청한 레시피 수와 업로드할 레시피 이미지 수가 다릅니다.');
    }

    if (req.fileValidationError) {
      throw new BadRequestException(req.fileValidationError);
    }

    return await this.detailLogService.update(
      id,
      updateDetailLogDto,
      brandImage[0],
      recipeImages,
      user,
    );
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
