module.exports = {
  root: true,
  env: { browser: true, es2021: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended', // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json', // Point ESLint to your tsconfig.json
  },
  plugins: ['@typescript-eslint'],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'vite.config.js'], // Ignore build output and config files
  rules: {
    'prettier/prettier': 'warn', // Show Prettier issues as warnings
    '@typescript-eslint/no-unused-vars': 'warn', // Warn about unused variables
    // Add any project-specific rules here
  },
};