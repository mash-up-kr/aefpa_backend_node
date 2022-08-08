import { Image, Log, UserGoodLog, UserScrapLog } from '@/api/server/generated';

export type LogWithImages = Log & {
  images: Image[];
  goodUsers: UserGoodLog[];
  scrapUsers: UserScrapLog[];
};
