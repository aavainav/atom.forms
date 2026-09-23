import { defineFormsConfig } from "../vitest.config.base.mts";

/**
 * `node` isn't an option here the way it is for `@forms/core`: this package reaches `@forms/core` only through its
 * package barrel (there's no relative path into another package's `src/`), and that barrel loads bootstrap's
 * tooltip, which touches `document` as it is imported.
 */
export default defineFormsConfig({ name: "@forms/workflow" });
