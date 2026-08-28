import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@next/next/no-html-link-for-pages": "off",
      "react-hooks/error-boundaries": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vendored beUI registry source is linted upstream and intentionally uses
    // effect/portal patterns rejected by React's newest experimental rules.
    "src/components/motion/**",
    "src/lib/hooks/**",
    "src/lib/presence-gate.tsx",
    "src/lib/touch.ts",
  ]),
]);

export default eslintConfig;
