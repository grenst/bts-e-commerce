/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '\\.(css|scss)$': 'jest-transform-stub',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^import\\.meta$': '<rootDir>/src/__mocks__/import-meta.ts',
    '\\.(jpg|jpeg|png|gif|svg|webp|mp4)$': '<rootDir>/src/__mocks__/assets.ts',
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      useDefineForClassFields: true,
      compilerOptions: {
        module: 'esnext',
      },
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
  transformIgnorePatterns: [
    'node_modules/(?!(axios)/)'
  ]
};
