import { defineFormsConfig } from "../vitest.config.base.mts";

/**
 * Violations run under `node` rather than the shared default of `jsdom`: the models and the service reach
 * `@forms/core` only for types, which the transform elides, so nothing here loads the barrel that pulls popper in.
 * Its tests import deep source paths to keep it that way -- the components are what would need a DOM.
 */
export default defineFormsConfig({ name: "@forms/violations", environment: "node" });
