import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist",
      "dev-dist",
      "node_modules",
      "*.config.ts",
      ".claude",
      ".planning",
      "**/*.d.ts",
      "public",
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: ["./tsconfig.json"],
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      // TypeScript specific
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-non-null-assertion": "warn",

      // General best practices (ESLint core)
      "prefer-const": "error",
      "no-console": ["warn", { allow: ["info", "warn", "error"] }],
      "no-debugger": "error",
      "no-duplicate-imports": "error",
      "no-unreachable": "error",

      // React specific
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  {
    files: ["src/{hooks,lib/ai,routes,store}/**/*.{ts,tsx}"],
    ignores: [
      // Legacy migration surfaces with pending decomposition tracked in stabilization deferred items.
      "src/routes/ChatDetailRoute.tsx",
      "src/store/modelStore.ts",
      "src/store/settingsStore.ts",
    ],
    rules: {
      "max-lines-per-function": [
        "error",
        { max: 200, skipBlankLines: true, skipComments: true, IIFEs: true },
      ],
    },
  }
);
