import { beforeEach, describe, expect, it, vi } from "vitest";

import type { IViolation } from "../../src/models/violation";
import type { IViolationBinding } from "../../src/models/violation-binding";
import { ViolationService } from "../../src/services/violation";

const violations: ReadonlyArray<IViolation> = [
    { code: "56-5-1520", description: "Speeding", category: "Speed" },
    { code: "56-1-20", description: "Driving without a licence", category: "Licence" }
];

function binding(listId: string = "sc-s438:violation"): IViolationBinding {
    return {
        listId,
        pageName: "citation",
        apply: () => Promise.resolve(),
        getApplied: () => []
    };
}

describe("ViolationService", () => {
    let service: ViolationService;

    beforeEach(() => {
        service = new ViolationService();
    });

    describe("registerList", () => {
        it("reports the ids of every registered list", () => {
            service.registerList({ id: "sc-s438:violation", load: () => Promise.resolve(violations) });

            expect(service.listIds).toEqual(["sc-s438:violation"]);
        });

        /** An agency serves its own current code list by registering over the id the bundled one used. */
        it("replaces a list registered under an id already in use", async () => {
            service.registerList({ id: "sc-s438:violation", load: () => Promise.resolve(violations) });
            service.registerList({ id: "sc-s438:violation", load: () => Promise.resolve([{ code: "X", description: "Replaced" }]) });

            expect(await service.getViolations("sc-s438:violation")).toEqual([{ code: "X", description: "Replaced" }]);
        });

        it("drops what it had already loaded under a replaced id", async () => {
            const first = vi.fn(() => Promise.resolve(violations));
            service.registerList({ id: "list", load: first });
            await service.getViolations("list");

            const second = vi.fn(() => Promise.resolve(violations));
            service.registerList({ id: "list", load: second });
            await service.getViolations("list");

            expect(second).toHaveBeenCalledTimes(1);
        });
    });

    describe("reading a list", () => {
        beforeEach(() => {
            service.registerList({ id: "list", load: () => Promise.resolve(violations) });
        });

        it("answers every violation", async () => {
            expect(await service.getViolations("list")).toHaveLength(2);
        });

        it("finds a violation by code", async () => {
            expect((await service.findByCode("list", "56-1-20"))?.description).toBe("Driving without a licence");
        });

        it("answers the list's categories, alphabetically", async () => {
            expect(await service.getCategories("list")).toEqual(["Licence", "Speed"]);
        });

        it("searches within a category", async () => {
            expect(await service.search("list", "", "Speed")).toHaveLength(1);
        });

        it("throws for a list that was never registered", async () => {
            await expect(service.getViolations("nothing"))
                .rejects.toThrowError("No violation list has been registered with the id 'nothing'.");

            await expect(service.search("nothing", ""))
                .rejects.toThrowError("No violation list has been registered with the id 'nothing'.");
        });
    });

    describe("caching", () => {
        /** A selector opened twice before the first load settles shares that one load. */
        it("loads a list once however many callers ask for it", async () => {
            const load = vi.fn(() => Promise.resolve(violations));
            service.registerList({ id: "list", load });

            await Promise.all([
                service.getViolations("list"),
                service.getCategories("list"),
                service.findByCode("list", "56-1-20"),
                service.search("list", "speed")
            ]);

            expect(load).toHaveBeenCalledTimes(1);
        });

        it("retries after a failed load rather than caching the rejection", async () => {
            const load = vi.fn()
                .mockRejectedValueOnce(new Error("network"))
                .mockResolvedValueOnce(violations);

            service.registerList({ id: "list", load });

            await expect(service.getViolations("list")).rejects.toThrowError("network");
            await expect(service.getViolations("list")).resolves.toHaveLength(2);

            expect(load).toHaveBeenCalledTimes(2);
        });
    });

    describe("registerViolations", () => {
        it("registers a binding against a form identity", () => {
            const registered = binding();

            service.registerViolations({ name: "sc-s438", version: "1.0.0" }, registered);

            expect(service.getBinding({ name: "sc-s438", version: "1.0.0" })).toBe(registered);
        });

        it("keeps bindings for two versions of the same form apart", () => {
            const first = binding("list-one");
            const second = binding("list-two");

            service.registerViolations({ name: "sc-s438", version: "1.0.0" }, first);
            service.registerViolations({ name: "sc-s438", version: "2.0.0" }, second);

            expect(service.getBinding({ name: "sc-s438", version: "1.0.0" })).toBe(first);
            expect(service.getBinding({ name: "sc-s438", version: "2.0.0" })).toBe(second);
        });

        /** Both sides of the lookup name a concrete version, so registration refuses an identity without one. */
        it("refuses an identity that names no version", () => {
            expect(() => service.registerViolations({ name: "sc-s438" }, binding()))
                .toThrowError("A violation binding for the form with the name of sc-s438 must be registered with a version.");
        });

        it("refuses a second binding for the same identity", () => {
            service.registerViolations({ name: "sc-s438", version: "1.0.0" }, binding());

            expect(() => service.registerViolations({ name: "sc-s438", version: "1.0.0" }, binding()))
                .toThrowError("A violation binding for the form with the name of sc-s438 and version 1.0.0 has already been registered.");
        });
    });

    describe("getBinding", () => {
        it("answers undefined for a form that declared none", () => {
            expect(service.getBinding({ name: "nothing", version: "1.0.0" })).toBeUndefined();
        });

        /**
         * Characterization worth pinning: a binding is keyed by name *and* version, so a lookup without a version
         * never resolves one -- unlike the catalog, where a missing version means the latest.
         */
        it("does not resolve a binding for an identity that names no version", () => {
            service.registerViolations({ name: "sc-s438", version: "1.0.0" }, binding());

            expect(service.getBinding({ name: "sc-s438" })).toBeUndefined();
        });
    });
});
