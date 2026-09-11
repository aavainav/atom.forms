import { beforeEach, describe, expect, it, vi } from "vitest";

import type { IChildValueListOption, IValueListOption } from "../../src/models/value-list-option";
import type { IValueListDefinition } from "../../src/models/value-list-definition";
import { ValueListService } from "../../src/services/value-list";

const states: ReadonlyArray<IValueListOption> = [
    { value: "SC", description: "South Carolina" },
    { value: "GA", description: "Georgia" }
];

const models: ReadonlyArray<IChildValueListOption> = [
    { value: "CAM", description: "Camry", parentValue: "TOYT" },
    { value: "MUS", description: "Mustang", parentValue: "FORD" }
];

function definition(id: string, options: ReadonlyArray<IValueListOption>, parentId?: string): IValueListDefinition {
    return { id, parentId, load: () => Promise.resolve(options) };
}

describe("ValueListService", () => {
    let service: ValueListService;

    beforeEach(() => {
        service = new ValueListService();
    });

    describe("registerList", () => {
        it("reports the ids of every registered list", () => {
            service.registerList(definition("states", states));
            service.registerList(definition("vehicle-models", models, "vehicle-makes"));

            expect(service.listIds).toEqual(["states", "vehicle-models"]);
        });

        /**
         * Replacing rather than refusing is the point of the seam: a host serves one of the built-in lists from
         * somewhere else by registering over its id, and anything already loaded under it is dropped.
         */
        it("replaces a list registered under an id already in use", async () => {
            service.registerList(definition("states", states));
            expect(await service.getOptions("states")).toHaveLength(2);

            service.registerList(definition("states", [{ value: "TX", description: "Texas" }]));

            expect(await service.getOptions("states")).toEqual([{ value: "TX", description: "Texas" }]);
        });

        it("drops what it had already loaded under a replaced id", async () => {
            const first = vi.fn(() => Promise.resolve(states));
            service.registerList({ id: "states", load: first });
            await service.getOptions("states");

            const second = vi.fn(() => Promise.resolve(states));
            service.registerList({ id: "states", load: second });
            await service.getOptions("states");

            expect(second).toHaveBeenCalledTimes(1);
        });
    });

    describe("getOptions", () => {
        it("loads and answers a list's options", async () => {
            service.registerList(definition("states", states));

            expect(await service.getOptions("states")).toHaveLength(2);
        });

        /**
         * An unchosen parent is the common case while a record is being filled in, and answering it here means
         * the chunk backing the child list is not fetched at all until a parent has been picked.
         */
        it("answers a child list with no parent value without loading it", async () => {
            const load = vi.fn(() => Promise.resolve(models));
            service.registerList({ id: "vehicle-models", parentId: "vehicle-makes", load });

            expect(await service.getOptions("vehicle-models")).toHaveLength(0);
            expect(load).not.toHaveBeenCalled();
        });

        it("loads a child list once a parent value is given", async () => {
            service.registerList(definition("vehicle-models", models, "vehicle-makes"));

            expect((await service.getOptions("vehicle-models", "TOYT")).map(option => option.value)).toEqual(["CAM"]);
        });

        it("throws for a list that was never registered", async () => {
            await expect(service.getOptions("nothing"))
                .rejects.toThrowError("No value list has been registered with the id 'nothing'.");
        });
    });

    describe("caching", () => {
        /** The promise is cached rather than the resolved list, so selects opening at once share a single load. */
        it("loads a list once however many callers ask for it", async () => {
            const load = vi.fn(() => Promise.resolve(states));
            service.registerList({ id: "states", load });

            await Promise.all([
                service.getOptions("states"),
                service.getOptions("states"),
                service.findByValue("states", "SC"),
                service.findByDescription("states", "Georgia")
            ]);

            expect(load).toHaveBeenCalledTimes(1);
        });

        /** A rejected load is not left cached, so the next request retries rather than replaying the failure. */
        it("retries after a failed load rather than caching the rejection", async () => {
            const load = vi.fn()
                .mockRejectedValueOnce(new Error("network"))
                .mockResolvedValueOnce(states);

            service.registerList({ id: "states", load });

            await expect(service.getOptions("states")).rejects.toThrowError("network");
            await expect(service.getOptions("states")).resolves.toHaveLength(2);

            expect(load).toHaveBeenCalledTimes(2);
        });
    });

    describe("findByValue and findByDescription", () => {
        beforeEach(() => {
            service.registerList(definition("states", states));
            service.registerList(definition("vehicle-models", models, "vehicle-makes"));
        });

        it("finds an option by code", async () => {
            expect((await service.findByValue("states", "GA"))?.description).toBe("Georgia");
        });

        it("finds an option by description, ignoring case", async () => {
            expect((await service.findByDescription("states", "south carolina"))?.value).toBe("SC");
        });

        it("answers undefined for something the list does not hold", async () => {
            expect(await service.findByValue("states", "ZZ")).toBeUndefined();
        });

        it("scopes a child list's lookup to the parent", async () => {
            expect((await service.findByDescription("vehicle-models", "Camry", "TOYT"))?.value).toBe("CAM");
            expect(await service.findByDescription("vehicle-models", "Camry", "FORD")).toBeUndefined();
        });

        it("throws for a list that was never registered", async () => {
            await expect(service.findByValue("nothing", "SC"))
                .rejects.toThrowError("No value list has been registered with the id 'nothing'.");
        });
    });

    describe("getParentId", () => {
        it("answers the id of the list a child hangs off", () => {
            service.registerList(definition("vehicle-models", models, "vehicle-makes"));

            expect(service.getParentId("vehicle-models")).toBe("vehicle-makes");
        });

        it("answers undefined for a list that hangs off nothing", () => {
            service.registerList(definition("states", states));

            expect(service.getParentId("states")).toBeUndefined();
        });

        it("throws for a list that was never registered", () => {
            expect(() => service.getParentId("nothing"))
                .toThrowError("No value list has been registered with the id 'nothing'.");
        });
    });
});
