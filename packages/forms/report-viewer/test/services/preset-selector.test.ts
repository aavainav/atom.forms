import { describe, expect, it, vi } from "vitest";

import { PresetSelectorService } from "../../src/services/preset-selector";

describe("PresetSelectorService", () => {
    it("tells whoever is listening that the panel is asked to open", () => {
        const service = new PresetSelectorService();
        const listener = vi.fn();
        service.onOpenSelector(listener);

        service.openSelector();

        expect(listener).toHaveBeenCalledTimes(1);
    });

    it("tells every listener, each time it is asked", () => {
        const service = new PresetSelectorService();
        const first = vi.fn();
        const second = vi.fn();
        service.onOpenSelector(first);
        service.onOpenSelector(second);

        service.openSelector();
        service.openSelector();

        expect(first).toHaveBeenCalledTimes(2);
        expect(second).toHaveBeenCalledTimes(2);
    });

    it("stops telling a listener that was removed, and carries on with the others", () => {
        const service = new PresetSelectorService();
        const removed = vi.fn();
        const kept = vi.fn();
        service.onOpenSelector(removed).remove();
        service.onOpenSelector(kept);

        service.openSelector();

        expect(removed).not.toHaveBeenCalled();
        expect(kept).toHaveBeenCalledTimes(1);
    });

    it("does nothing when nobody is listening", () => {
        expect(() => new PresetSelectorService().openSelector()).not.toThrow();
    });
});
