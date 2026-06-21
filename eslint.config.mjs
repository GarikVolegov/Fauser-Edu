import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";

export default tseslint.config(
  {
    // Never lint generated code, build output, or local dev data.
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/*.d.ts",
      "**/generated/**",
      "**/.vite/**",
      ".dev/**",
      "**/coverage/**",
      "artifacts/mockup-sandbox/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx,mjs,cjs,js}"],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
    plugins: { "unused-imports": unusedImports },
    rules: {
      // The existing API routes use `any` pragmatically; don't fail on it.
      "@typescript-eslint/no-explicit-any": "off",
      // unused-imports owns import cleanup (auto-fixable); disable the base rule
      // for imports and keep it (as a warning) for genuinely unused variables.
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    // React hooks correctness for the frontend.
    files: ["artifacts/fauser-platform/**/*.{ts,tsx}"],
    plugins: { "react-hooks": reactHooks },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
);
