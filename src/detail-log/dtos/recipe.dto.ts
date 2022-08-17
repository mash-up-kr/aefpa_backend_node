import { ImageDto } from '@/image/dtos/image.dto';
import { IsObject, IsString } from 'class-validator';

export class RecipeDto {
  @IsString()
  description: string;

  @IsObject()
  image: ImageDto;
}
