import { defineFormsConfig } from "../vitest.config.base.mts";

/**
 * Value lists run under `node` rather than the shared default of `jsdom`: the models and the service depend on
 * nothing from `@forms/core`, so its tests never load the barrel that pulls popper in. Its tests import deep
 * source paths to keep it that way.
 */
export default defineFormsConfig({ name: "@forms/value-lists", environment: "node" });
