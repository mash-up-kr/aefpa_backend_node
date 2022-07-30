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

/**
 * Zip two arrays together.
 */
export function zip<T, U>(a: T[], b: U[]) {
  const result: [T, U][] = [];
  for (let i = 0; i < a.length; i++) {
    result.push([a[i], b[i]]);
  }
  return result;
}
