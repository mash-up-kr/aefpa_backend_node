import { ErrorMessages } from '@/common/error-messages';
import { ConflictException, NotFoundException } from '@nestjs/common';

export function checkExists<T>(value: T | null | undefined, context?: string): T {
  if (value == null) throw new NotFoundException(ErrorMessages.notFound(context));
  return value;
}

export function checkNotExists<T>(value: T | null | undefined, context?: string) {
  if (value != null) throw new ConflictException(ErrorMessages.alreadyExists(context));
}
