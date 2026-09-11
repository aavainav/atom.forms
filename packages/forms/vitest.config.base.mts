import { fileURLToPath } from "node:url";
import { defineConfig, type UserConfig } from "vitest/config";

/**
 * Every workspace package a form package can reach, mapped to its source.
 *
 * Paths are resolved against this file rather than against the package importing it, so a package at any depth --
 * `core/` and `south-carolina/s438/` alike -- gets the same answer without passing its own location in.
 *
 * They resolve to source rather than to the built `dist/` a workspace symlink would otherwise reach, so a test run
 * does not depend on the dependency having been built. `dist/` is gitignored, so on a fresh clone the alternative
 * is a suite that cannot run until `yarn build` has.
 */
const packageSources: Readonly<Record<string, string>> = {
    "@common/event-emitter": "../common/event-emitter/src/index.ts",
    "@common/react": "../common/react/src/index.ts",
    "@common/react-router": "../common/react-router/src/index.ts",
    "@common/zod": "../common/zod/src/index.ts",
    "@forms/catalog": "catalog/src/index.ts",
    "@forms/core": "core/src/index.ts",
    "@forms/ga-utc": "georgia/utc/src/index.ts",
    "@forms/ok-parking": "oklahoma/parking/src/index.ts",
    "@forms/ok-traffic": "oklahoma/traffic/src/index.ts",
    "@forms/printing": "printing/src/index.ts",
    "@forms/public-contact-or-warning": "south-carolina/public-contact-or-warning/src/index.ts",
    "@forms/report-viewer": "report-viewer/src/index.ts",
    "@forms/s438": "south-carolina/s438/src/index.ts",
    "@forms/tr310": "south-carolina/tr310/src/index.ts",
    "@forms/value-lists": "value-lists/src/index.ts",
    "@forms/violations": "violations/src/index.ts",
    "@forms/workbench": "workbench/src/index.ts"
};

/**
 * Specifiers a test never wants the real thing for, matched ahead of the package aliases below.
 *
 * The theme stylesheet is the only one: `@forms/report-viewer` imports it, and because `@forms/core` resolves to
 * a file rather than a directory the subpath would otherwise resolve against that file and fail. Tests assert
 * behaviour rather than appearance, so an empty stylesheet is the honest stand-in and skips compiling sass.
 */
const stubs: Readonly<Record<string, string>> = {
    "@forms/core/theme/_main.scss": "vitest-stubs/empty.css"
};

const formsRoot = new URL("./", import.meta.url);

/** Options a package can vary; everything else is the same everywhere and lives here. */
export interface IFormsTestOptions {
    /**
     * The environment the package's tests run in.
     *
     * `jsdom` is the default because anything importing the `@forms/core` barrel loads `@popperjs/core`, which
     * reads `document` as it is imported -- and a form package reaches core through the barrel in every file.
     * Only a package whose tests import deep source paths and never pull the barrel in can use `node`.
     */
    readonly environment?: "node" | "jsdom";
}

/** Builds the vitest config for a package under `packages/forms`. */
export function defineFormsConfig(options: IFormsTestOptions = {}): UserConfig {
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
            environment: options.environment ?? "jsdom",
            // pinned, since the default glob would also scan `dist`
            include: ["test/**/*.test.ts"]
        }
    });
}
