import { FileValidationErrorReqType } from '@/common/types/image-request.type';
import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';

export function ApiImages(
  fieldName: string,
  required = true,
  maxCount = 10,
  localOptions: MulterOptions = {
    fileFilter: imageFileFilter,
    limits: {
      fileSize: 1048576, // 10 M
    },
  },
) {
  return applyDecorators(
    UseInterceptors(FilesInterceptor(fieldName, maxCount, localOptions)),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        required: required ? [fieldName] : [],
        properties: {
          [fieldName]: {
            type: 'array',
            items: {
              type: 'string',
              format: 'binary',
            },
          },
        },
      },
    }),
  );
}

export const imageFileFilter = (
  req: FileValidationErrorReqType,
  file: Express.Multer.File,
  callback: any,
) => {
  if (
    ![
      'image/gif',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/pipeg',
      'image/bmp',
      'image/webp',
      'image/tiff',
      'image/svg+xml',
      'image/heic',
    ].includes(file.mimetype)
  ) {
    req.fileValidationError = `허용되지 않은 minetype입니다. ${file.mimetype}`;
    return callback(null, false);
  }
  callback(null, true);
};
