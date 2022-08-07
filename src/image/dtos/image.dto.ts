import { customPlainToInstance } from '@/util/plain-to-instance';
import { IsString } from '@/validation';

export class ImageDto {
  @IsString()
  original: string;

  @IsString()
  w1024: string;

  @IsString()
  w256: string;

  // from original image to original, w256, w1024
  static fromOriginalImage(original: string): ImageDto {
    const originalNameArr = original.split('/');

    const w1024 = originalNameArr
      .map((d) => {
        if (d === 'original') {
          return 'w_1024';
        }
        return d;
      })
      .join('/');

    const w256 = originalNameArr
      .map((d) => {
        if (d === 'original') {
          return 'w_256';
        }
        return d;
      })
      .join('/');

    return customPlainToInstance(ImageDto, {
      original,
      w1024,
      w256,
    });
  }
}
