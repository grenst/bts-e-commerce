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
    '^@/(.*)$': '<rootDir>/src/$1',
    '^import\\.meta$': '<rootDir>/src/__mocks__/import-meta.ts',
    // Mock image files
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/src/__mocks__/fileMock.ts',
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      useDefineForClassFields: true,
      compilerOptions: {
        module: 'esnext',
      },
      // Add this to handle import.meta
      diagnostics: {
        ignoreCodes: [1343]
      },
      astTransformers: {
        before: [
          {
            path: 'node_modules/ts-jest-mock-import-meta',
            options: { metaObjectReplacement: { env: { MODE: 'test' } } }
          }
        ]
      }
    }]
  },
  // Ensure we ignore image files and node_modules (except axios) from transformation
  transformIgnorePatterns: [
    'node_modules/(?!(axios)/)',
    '^.+\\.(jpg|jpeg|png|gif|webp|svg)$'
  ]
};
