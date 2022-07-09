import { ErrorMessages } from '@/common/error-messages';
import { ConflictException, NotFoundException } from '@nestjs/common';

export function checkExists<T>(value: T | null | undefined): T {
  if (value == null) throw new NotFoundException(ErrorMessages.notFound);
  return value;
}

export function checkNotExists<T>(value: T | null | undefined) {
  if (value != null) throw new ConflictException(ErrorMessages.alreadyExists);
}
