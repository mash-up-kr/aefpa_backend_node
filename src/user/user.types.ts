import { DetailLog, Log, UserScrapLog } from '@/api/server/generated';

export type FriendType = 'follower' | 'following';
export const friendTypes: readonly FriendType[] = ['follower', 'following'];
export type UserScrapLogType = UserScrapLog & {
  log: Log | null;
  detailLog: DetailLog | null;
};
