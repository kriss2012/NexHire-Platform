module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/server.ts',
    '!src/db/**',
    '!src/types/**'
  ],
  coverageThreshold: {
    global: {
      branches: 40,
      functions: 70,
      lines: 65,
      statements: 65
    }
  },
  testTimeout: 10000,
  verbose: true
};
