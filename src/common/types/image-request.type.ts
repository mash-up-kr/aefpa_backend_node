import { Request } from 'express';

export type FileValidationErrorReqType = Request & {
  fileValidationError?: string;
};
