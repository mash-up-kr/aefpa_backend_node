export function runOrDefault<T, U>(
  value: T | null | undefined,
  mapper: (value: T) => U,
  defaultValue: U,
): U {
  return value ? mapper(value) : defaultValue;
}
