import { Image, Log } from '@/api/server/generated';

export type LogWithImages = Log & {
  images: Image[];
};
