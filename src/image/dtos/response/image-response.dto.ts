import { customPlainToInstance } from '@/util/plain-to-instance';

export class ImageResponseDto {
  original: string;
  w1024: string;
  w256: string;

  static fromOriginalImage(original: string): ImageResponseDto {
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

    return customPlainToInstance(ImageResponseDto, {
      original,
      w1024,
      w256,
    });
  }
}
