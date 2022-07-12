import { ClassConstructor, ClassTransformOptions, plainToInstance } from 'class-transformer';

export function customPlainToInstance<T>(
  cls: ClassConstructor<T>,
  plain: T,
  options?: ClassTransformOptions,
): T {
  return plainToInstance<T, T>(cls, plain, options);
}
