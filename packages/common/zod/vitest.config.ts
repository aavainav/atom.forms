import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        name: "@common/zod",
        environment: "node",
        // pinned, since the default glob would also scan `dist`
        include: ["test/**/*.test.ts"],
        // one environment per worker rather than per file, as in the forms packages; each file keeps a context of its own
        pool: "vmThreads"
    }
});
