export const commonErrors = [
  'INVALID FORMAT',
  'INVALID LENGTH',
  'ALREADY EXISTS',
  'NOT FOUND',
  'INCORRECT',
] as const;

export type CommonError = typeof commonErrors[number];

type Separator = ' ' | '_';
type PascalCase<M extends string> = M extends `${infer U}${Separator}${infer V}`
  ? `${Capitalize<Lowercase<U>>}${PascalCase<Capitalize<Lowercase<V>>>}`
  : Capitalize<Lowercase<M>>;

type CamelCase<M extends string> = Uncapitalize<PascalCase<M>>;

function ErrorFn(errorType: CommonError) {
  return (context?: string) => appendOnly(errorType, context);
}

function appendOnly(original: string, extra?: string) {
  return `${original}${extra ? ` - ${extra}` : ''}`;
}

export const ErrorMessages: Record<CamelCase<CommonError>, (context?: string) => string> = {
  invalidFormat: ErrorFn('INVALID FORMAT'),
  invalidLength: ErrorFn('INVALID LENGTH'),
  alreadyExists: ErrorFn('ALREADY EXISTS'),
  notFound: ErrorFn('NOT FOUND'),
  incorrect: ErrorFn('INCORRECT'),
};
