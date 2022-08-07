export type MockPrismaServiceType<T = any> = Partial<{
  [K in keyof T]: {
    [P in keyof T[K]]: jest.Mock;
  };
}>;

export type MockServiceType<T = any> = Partial<Record<keyof T, jest.Mock>>;
