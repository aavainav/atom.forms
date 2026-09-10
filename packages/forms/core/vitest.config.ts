import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
    /**
     * The rule classes carrying `@RegisterRule` pass the class being decorated to its own decorator, which is only
     * legal under legacy decorator semantics; emitted as standard decorators they are a syntax error.
     *
     * Vite 8 transforms through oxc rather than esbuild, and oxc does read `experimentalDecorators` from the
     * tsconfig it resolves per file, so `src` is already covered by the package's own tsconfig. Pinning it here
     * fixes the same answer for every file oxc transforms, so that narrowing a tsconfig's `include` later cannot
     * quietly turn the rules back into a syntax error.
     */
    oxc: {
        decorator: { legacy: true }
    },
    resolve: {
        alias: {
            // resolved to source so a test run does not depend on the workspace package having been built; `dist`
            // is gitignored, so a fresh clone would otherwise fail on the first test that touches a controller
            "@common/event-emitter": fileURLToPath(new URL("../../common/event-emitter/src/index.ts", import.meta.url))
        }
    },
    test: {
        // the models, controllers, mapping and validation are free of react and the dom, and keeping the
        // environment out of the way is what makes an accidental import of a component fail rather than pass
        environment: "node",
        // pinned, since the default glob would also scan `dist`
        include: ["test/**/*.test.ts"]
    }
});
