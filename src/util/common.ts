/**
 * If value is not null, apply the mapper and return the result.
 * If value is null, return the default value.
 */
export function runOrDefault<T, U>(
  value: T | null | undefined,
  mapper: (value: T) => U,
  defaultValue: U,
): U {
  return value ? mapper(value) : defaultValue;
}
