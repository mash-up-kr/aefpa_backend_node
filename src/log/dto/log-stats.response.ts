export interface LogStatsResponse {
  level: number; // 캐릭터 레벨
  progress: number; // 진행도의 현재 값
  max: number; // 진행도의 max 값
  total: number; // 전체 끼록 횟수
  today?: number; // 오늘 끼록 횟수
}
