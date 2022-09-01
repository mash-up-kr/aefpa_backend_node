import { ImageDto } from '@/image/dtos/image.dto';

export class ShortLogResponseDto {
  id: number;
  image: ImageDto;
  createdAt: string;
  title: string;
}

export class ShortLogTypeResponseDto extends ShortLogResponseDto {
  type: string;
}
