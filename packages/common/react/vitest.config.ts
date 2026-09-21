import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        name: "@common/react",
        environment: "jsdom",
        // pinned, since the default glob would also scan `dist`
        include: ["test/**/*.test.ts"]
    }
});
