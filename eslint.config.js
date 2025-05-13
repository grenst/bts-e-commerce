import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-plugin-prettier";
import eslintConfigPrettier from "eslint-config-prettier";
import unicorn from "eslint-plugin-unicorn";
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

  js.configs.recommended,

  ...tseslint.configs.recommended,

  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
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
      "prettier": prettier,
      "unicorn": unicorn,
    },
    rules: {
      ...eslintConfigPrettier.rules,
      ...unicorn.configs.recommended.rules,
      "prettier/prettier": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
    },
  }
);