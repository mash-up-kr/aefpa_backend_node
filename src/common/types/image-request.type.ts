import { Request } from 'express';

export type FileValidationErrorReqType = Request & {
  fileValidationError?: 'only image file allowed';
};
