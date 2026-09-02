import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  // Keep the starter on the flat config export that actually runs under the pinned ESLint/Next toolchain.
  ...nextCoreWebVitals,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "design-gemini/**", "design-glm5/**"]),
  {
    rules: {
      // data fetching در useEffect با setState داخل callback غیرهمزمان، الگوی استاندارد است
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);
