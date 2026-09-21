import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        name: "@common/react-router",
        // the module builds a browser router, which needs a window to read the location from
        environment: "jsdom",
        // pinned, since the default glob would also scan `dist`
        include: ["test/**/*.test.ts"]
    }
});
