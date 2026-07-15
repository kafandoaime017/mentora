/** Config Jest pour le backend Mentora (TypeScript, ts-jest). */
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
  },
  rootDir: '.',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  setupFiles: ['<rootDir>/tests/setup/env.ts'],
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: [
    'src/app/controllers/**/*.ts',
    'src/app/services/**/*.ts',
    'src/app/middleware/**/*.ts',
    'src/app.ts',
    '!src/app/services/emailService.ts',
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'text-summary', 'lcov'],
  testTimeout: 15000,
  verbose: true,
};
