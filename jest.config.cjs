/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node', // Or 'jsdom' if testing browser environments
  roots: ['<rootDir>/src'], // Look for tests in the src directory
  moduleNameMapper: {
    // Handle module aliases (if you have them in tsconfig.json)!!
    // '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Add any other Jest configurations here
};
