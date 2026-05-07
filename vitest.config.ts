import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/lib/audit/__tests__/**/*.test.ts"],
  },
});
