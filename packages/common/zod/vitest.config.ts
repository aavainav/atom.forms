import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        name: "@common/zod",
        environment: "node",
        // pinned, since the default glob would also scan `dist`
        include: ["test/**/*.test.ts"]
    }
});
