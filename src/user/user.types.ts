import { DetailLog, Log, UserScrapLog, Image } from '@/api/server/generated';

export type FriendType = 'follower' | 'following';
export const friendTypes: readonly FriendType[] = ['follower', 'following'];
export type UserScrapLogType = UserScrapLog & {
  log:
    | (Log & {
        images: Image[];
      })
    | null;
  detailLog:
    | (DetailLog & {
        image: Image;
      })
    | null;
};
