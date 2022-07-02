/**
 * Object 타입에서 원하지 않는 타입만 제거할 수 있는 유틸리티 타입
 *
 * e.g.
 * type A = {
 *   id: number;
 *   name: string;
 *   isAdmin: boolean;
 * };
 * type B = TypesToOmit<A, boolean>;
 * -> "id" | "name"
 */
export type TypesToOmit<obj, value> = {
  [k in keyof obj]: obj[k] extends value ? never : k;
}[keyof obj];
