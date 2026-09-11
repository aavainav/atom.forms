import { beforeEach, describe, expect, it, vi } from "vitest";

const load = vi.fn(() => Promise.resolve());
const useSettings = vi.fn((_settings: unknown) => ({ load }));
const useModules = vi.fn((_modules: ReadonlyArray<unknown>) => ({ useSettings }));

/**
 * Only `ModuleLoader` is replaced; everything else `@shrub/core` publishes stays real, because `WorkbenchModule`
 * is built from it at import time and a wholesale mock would leave the module under test with nothing to load.
 */
vi.mock("@shrub/core", async importOriginal => ({
    ...(await importOriginal<Record<string, unknown>>()),
    ModuleLoader: { useModules }
}));

const { WorkbenchBootstrapper } = await import("../src/bootstrapper");
const { WorkbenchModule } = await import("../src/module");

describe("WorkbenchBootstrapper.start", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("always loads the workbench module itself", async () => {
        await WorkbenchBootstrapper.start({ bootstrappers: [], settings: {} });

        expect(useModules).toHaveBeenCalledWith([WorkbenchModule]);
    });

    it("loads the module each bootstrapper answers with, after the workbench module", async () => {
        const first = () => () => Promise.resolve({} as never);
        const second = () => () => Promise.resolve({} as never);

        await WorkbenchBootstrapper.start({ bootstrappers: [first, second], settings: {} });

        expect(useModules.mock.calls[0][0]).toHaveLength(3);
        expect(useModules.mock.calls[0][0][0]).toBe(WorkbenchModule);
    });

    /**
     * A bootstrapper answers with nothing when the form it belongs to is not part of this host, which is how a
     * build drops a jurisdiction it does not serve. Pushing the undefined would fail the load instead.
     */
    it("skips a bootstrapper that answers with nothing", async () => {
        const present = () => () => Promise.resolve({} as never);
        const absent = () => undefined;

        await WorkbenchBootstrapper.start({ bootstrappers: [absent, present, absent], settings: {} });

        expect(useModules.mock.calls[0][0]).toHaveLength(2);
        expect(useModules.mock.calls[0][0].every((entry: unknown) => entry !== undefined)).toBe(true);
    });

    it("passes the settings through and loads", async () => {
        const settings = { "forms-module": { apiUrl: "https://example.test" } };

        await WorkbenchBootstrapper.start({ bootstrappers: [], settings });

        expect(useSettings).toHaveBeenCalledWith(settings);
        expect(load).toHaveBeenCalledTimes(1);
    });
});
