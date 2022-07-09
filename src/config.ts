import { runOrDefault } from '@/util/common';

export function envOrDefault<T>(key: string, mapper: (value: string) => T, defaultValue: T): T {
  return runOrDefault(process.env[key], mapper, defaultValue);
}

export default () => ({
  port: envOrDefault('PORT', parseInt, 3000),
});
