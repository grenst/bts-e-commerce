import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierPlugin from "eslint-plugin-prettier";
import eslintConfigPrettier from "eslint-config-prettier";
import unicornPlugin from "eslint-plugin-unicorn";
import globals from "globals";

export default tseslint.config(
  {
    ignores: [
      "dist/",
      "node_modules/",
      "coverage/",
      "eslint.config.js",
      "vite.config.ts",
      "jest.config.cjs",
      ".eslintrc.cjs",
      "**/*.cjs",
    ],
  },

  eslint.configs.recommended,

  ...tseslint.configs.recommended,

  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.eslint.json",
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      "prettier": prettierPlugin,
      "unicorn": unicornPlugin,
    },
    rules: {
      ...eslintConfigPrettier.rules,

      ...unicornPlugin.configs.recommended.rules,

      "prettier/prettier": "warn",

      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unnecessary-type-assertion": "warn",
      "@typescript-eslint/consistent-type-assertions": ["error", { assertionStyle: "never" }],
      "@typescript-eslint/no-non-null-assertion": "error",
    },
  },

  {
    files: ["**/*.test.ts", "**/*.spec.ts"],
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "@typescript-eslint/no-explicit-any": "off",
      // Unicorn для тестів
      "unicorn/filename-case": "off",
      "unicorn/prevent-abbreviations": "off",
      "unicorn/no-null": "off",
      "unicorn/prefer-dom-node-text-content": "off",
      "unicorn/no-useless-undefined": "off",
      "unicorn/numeric-separators-style": "off",


      // TypeScript-асерти в тестах
      "@typescript-eslint/consistent-type-assertions": "off",
      "unicorn/consistent-assert": "off",
      "unicorn/prefer-node-protocol": "off",
    },
  }
);
