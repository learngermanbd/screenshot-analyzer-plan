import tseslint from "typescript-eslint";
import nextPlugin from "@next/eslint-plugin-next";
import reactHooks from "eslint-plugin-react-hooks";

export default tseslint.config(
  // Ignore build artifacts and generated code
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "dist/**",
      "out/**",
    ],
  },

  // TypeScript recommended
  ...tseslint.configs.recommended,

  // Next.js core-web-vitals rules
  {
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },

  // React hooks exhaustive-deps
  {
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },

  // Project-wide rule overrides
  {
    rules: {
      // Craft.js serialization requires explicit any
      "@typescript-eslint/no-explicit-any": "off",

      // Warn on unused vars, allow underscore-prefixed ignores
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // Allow console.error/warn for operational logging
      "no-console": "off",

      // React 19 — no need to import React for JSX
      "react/react-in-jsx-scope": "off",
    },
  },

  // Test files — relax rules
  {
    files: ["**/*.test.ts", "**/*.test.tsx"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
    },
  }
);
