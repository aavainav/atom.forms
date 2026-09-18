import { defineFormsConfig } from "../vitest.config.base.mts";

/**
 * Core runs under `node` rather than the shared default of `jsdom`: its models, controllers, mapping and
 * validation are free of react and the DOM, and keeping the environment out of the way is what makes an
 * accidental import of a component -- or of the `src/index.ts` barrel, which loads popper -- fail rather than
 * quietly pass. Its tests import deep source paths for the same reason.
 */
export default defineFormsConfig({ name: "@forms/core", environment: "node" });
