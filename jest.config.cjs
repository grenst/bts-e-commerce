/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom', // Changed from 'node'
  roots: ['<rootDir>/src'], // Look for tests in the src directory
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'], // Add this line
  moduleNameMapper: {
    // Handle CSS/SCSS imports
    '\\.(css|scss)$': 'jest-transform-stub',
    // Handle module aliases (if you have them in tsconfig.json)!!
    // '^@/(.*)$': '<rootDir>/src/$1',
    '^import\\.meta$': '<rootDir>/src/__mocks__/import-meta.ts',
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      useDefineForClassFields: true,
      compilerOptions: {
        module: 'esnext',
      },
    }],
  },
  // This might be needed if node_modules are not transformed correctly
  transformIgnorePatterns: [
    'node_modules/(?!(axios)/)', // Example: if axios needs transformation
  ],
};
