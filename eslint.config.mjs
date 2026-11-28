import { createRequire } from "node:module";

const rootRequire = createRequire(import.meta.url);
const nextConfigRequire = createRequire(rootRequire.resolve("eslint-config-next"));

const nextPlugin = nextConfigRequire("@next/eslint-plugin-next");
const tsParser = nextConfigRequire("@typescript-eslint/parser");
const tsPlugin = nextConfigRequire("@typescript-eslint/eslint-plugin");
const reactHooksPlugin = nextConfigRequire("eslint-plugin-react-hooks");

export default [
  {
    ignores: [".next/**", "node_modules/**"],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      "@next/next": nextPlugin,
      "@typescript-eslint": tsPlugin,
      "react-hooks": reactHooksPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      ...reactHooksPlugin.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
];
