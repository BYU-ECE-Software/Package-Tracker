import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Project-wide rule relaxations.
//
// `no-explicit-any` and `react-hooks/set-state-in-effect` are downgraded
// from error → warn because the template UI primitives (DataTable, FormModal,
// FullPageForm, formFieldTypes) intentionally use `any` in their generic
// boundaries (the form-values bag, row-render render-prop signatures), and
// some primitives (Combobox, StepModal, DataTable's expandable sub-table)
// run a single setState inside an effect on mount/openness. These patterns
// come from Template-Repo and we don't want to diverge from the upstream
// canonical implementations just to satisfy strict lint defaults.
// Treat them as advisory; prefer fixing in upstream Template-Repo first.
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "react-hooks/set-state-in-effect": "warn",
      // Advisory hint from React Compiler when a manual useMemo/useCallback
      // couldn't be preserved through compilation — performance suggestion,
      // not a bug. Treat as warn.
      "react-hooks/preserve-manual-memoization": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "types/routes.d.ts",
  ]),
]);

export default eslintConfig;
