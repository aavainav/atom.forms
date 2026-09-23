import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/** Every workspace package a form package can reach, mapped to its source. */
const packageSources: Readonly<Record<string, string>> = {
    "@common/event-emitter": "../common/event-emitter/src/index.ts",
    "@common/react": "../common/react/src/index.ts",
    "@common/react-router": "../common/react-router/src/index.ts",
    "@common/zod": "../common/zod/src/index.ts",
    "@forms/audit": "audit/src/index.ts",
    "@forms/catalog": "catalog/src/index.ts",
    "@forms/core": "core/src/index.ts",
    "@forms/ga-utc": "georgia/utc/src/index.ts",
    "@forms/ok-parking": "oklahoma/parking/src/index.ts",
    "@forms/ok-traffic": "oklahoma/traffic/src/index.ts",
    "@forms/printing": "printing/src/index.ts",
    "@forms/public-contact-or-warning": "south-carolina/public-contact-or-warning/src/index.ts",
    "@forms/report-viewer": "report-viewer/src/index.ts",
    "@forms/review": "review/src/index.ts",
    "@forms/s438": "south-carolina/s438/src/index.ts",
    "@forms/tr310": "south-carolina/tr310/src/index.ts",
    "@forms/value-lists": "value-lists/src/index.ts",
    "@forms/violations": "violations/src/index.ts",
    "@forms/workbench": "workbench/src/index.ts",
    "@forms/workflow": "workflow/src/index.ts"
};

/** Specifiers a test never wants the real thing for, matched ahead of the package aliases below. */
const stubs: Readonly<Record<string, string>> = {
    "@forms/core/theme/_main.scss": "vitest-stubs/empty.css"
};

const formsRoot = new URL("./", import.meta.url);

/** Options a package can vary; everything else is the same everywhere and lives here. */
export interface IFormsTestOptions {
    /** The package's own name, used to label its job summary in CI -- otherwise every package's report shares the same generic "Vitest Test Report" title. */
    readonly name?: string;
    /** The environment the package's tests run in. */
    readonly environment?: "node" | "jsdom";
}

/** Builds the vitest config for a package under `packages/forms`. */
export function defineFormsConfig(options: IFormsTestOptions = {}) {
    return defineConfig({
        /**
         * The rule classes carrying `@RegisterRule`, and the services carrying `@Singleton`, pass the class being
         * decorated to its own decorator -- legal only under legacy decorator semantics. Vite 8 transforms through
         * oxc, which reads `experimentalDecorators` from the tsconfig it resolves per file; pinning it here fixes
         * the same answer for every file, so narrowing a tsconfig's `include` cannot turn them into a syntax error.
         */
        oxc: {
            decorator: { legacy: true }
        },
        resolve: {
            // the stubs come first, since a specifier matching one would otherwise be caught by its package's alias
            alias: Object.fromEntries(
                Object.entries({ ...stubs, ...packageSources })
                    .map(([name, source]) => [name, fileURLToPath(new URL(source, formsRoot))]))
        },
        test: {
            name: options.name,
            environment: options.environment ?? "jsdom",
            // pinned, since the default glob would also scan `dist`
            include: ["test/**/*.test.ts"],
            // each file still runs in a context of its own, so a static registry starts empty in every file, but the
            // environment is built once per worker rather than once per file -- which was over half of the time these
            // suites took, jsdom being far dearer to build than any test is to run
            pool: "vmThreads"
        }
    });
}
