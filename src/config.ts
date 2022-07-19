import { runOrDefault } from '@/util/common';

export function envOrDefault<T>(key: string, mapper: (value: string) => T, defaultValue: T): T {
  return runOrDefault(process.env[key], mapper, defaultValue);
}

export function requireEnv<T = string>(
  key: string,
  mapper: (value: string) => T = (value) => value as unknown as T,
) {
  const value = process.env[key];
  if (value == null) throw new Error(`Environment variable $${key} must be present.`);

  return mapper(value);
}

export default () => ({
  port: envOrDefault('PORT', parseInt, 3000),
  mail: {
    user: requireEnv('MAIL_USER'),
    password: requireEnv('MAIL_PASSWORD'),
  },
  aws: {
    accessKey: requireEnv('ACCESS_KEY'),
    secretAccessKey: requireEnv('SECRET_ACCESS_KEY'),
    region: requireEnv('REGION'),
    s3: {
      bucket: requireEnv('BUCKET'),
    },
  },
});
