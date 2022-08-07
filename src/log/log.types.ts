import { Image, Log, UserGoodLog } from '@/api/server/generated';

export type LogWithImages = Log & {
  images: Image[];
  goodUsers: UserGoodLog[];
};
