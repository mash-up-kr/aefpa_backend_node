import type { Config } from '@jest/types';
import { pathsToModuleNameMapper } from 'ts-jest';

import { compilerOptions } from './tsconfig.paths.json';

// 또는 비동기 함수
export default async (): Promise<Config.InitialOptions> => {
  return {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: 'src',
    testRegex: '.*\\.spec\\.ts$',
    transform: {
      '^.+\\.(t|j)s$': 'ts-jest',
    },
    verbose: true,
    collectCoverageFrom: ['**/*.(t|j)s'],
    coverageDirectory: '../coverage',
    testEnvironment: 'node',
    coverageThreshold: {
      global: {
        branches: 50,
        functions: 50,
        lines: 50,
        statements: 50,
      },
    },
    moduleNameMapper: {
      ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: process.cwd() }),
      '^src/(.*)$': '<rootDir>/$1',
    },
  };
};
