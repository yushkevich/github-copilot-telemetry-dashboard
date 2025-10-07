/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  transform: { '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: true }] },
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },
};
