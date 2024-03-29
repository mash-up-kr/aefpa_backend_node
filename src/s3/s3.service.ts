import { ImageDto } from '@/image/dtos/image.dto';
import { BucketFolderType } from '@/s3/s3.type';
import { getCurrentDateAS } from '@/util/time';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import * as crypto from 'crypto';

@Injectable()
export class S3Service {
  private s3: AWS.S3;
  private accessKey?: string;
  private secretAccessKey?: string;
  private region?: string;
  private bucket: any;
  private baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.accessKey = this.configService.get('aws.accessKey');
    this.secretAccessKey = this.configService.get('aws.secretAccessKey');
    this.region = this.configService.get('aws.region');
    this.bucket = this.configService.get('aws.s3.bucket');
    this.baseUrl = `https://${this.bucket}.s3.${this.region}.amazonaws.com`;

    this.s3 = new AWS.S3({
      accessKeyId: this.accessKey,
      secretAccessKey: this.secretAccessKey,
      region: this.region,
    });
  }

  async upload(files: Express.Multer.File[], bucketFolder: BucketFolderType) {
    const params = files.map((file) => {
      return {
        Bucket: this.bucket,
        Key: `${bucketFolder}/original/${this.generateFileName(file.originalname)}`,
        Body: file.buffer,
        ACL: 'public-read',
        ContentType: file.mimetype,
      };
    });

    try {
      const uploadedImages = await Promise.all(
        params.map((param) => this.s3.upload(param).promise()),
      );

      Logger.debug('image upload success');

      return uploadedImages.map((uploadedImage) =>
        ImageDto.fromOriginalImage(uploadedImage.Location),
      );
    } catch (err) {
      Logger.error(err);
      throw new InternalServerErrorException('image upload fail');
    }
  }

  // example: 20220712-bb5dc8842ca31d4603d6aa11448d1654.jpg
  private generateFileName(fileName: string) {
    const fileExt = `.${fileName.split('.').pop()}`;
    return getCurrentDateAS('yyyyMMDD')
      .concat('-')
      .concat(crypto.randomBytes(20).toString('hex'))
      .concat(fileExt);
  }

  getUrl(key: string) {
    key.startsWith('/') && (key = key.substring(1));
    return `${this.baseUrl}/${key}`;
  }
}
