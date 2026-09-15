import { beforeEach, describe, expect, it } from "vitest";

import type { IResolvedFormCatalogItem } from "@forms/catalog";
import type { IControllerManager } from "@forms/core";
import type { IPrintProfile } from "../../src/models/print-profile";
import { allPagesProfileId, PrintService } from "../../src/services/print";

/**
 * The service reads only `new ctor().getChildDefinitions()` off a catalog item, plus its name for error messages,
 * so a stub carrying those is enough to exercise profile resolution and validation.
 */
function catalogItem(name: string, ...pageNames: Array<string>): IResolvedFormCatalogItem {
    const pageDefinitions = pageNames.map(pageName => ({ name: pageName } as never));

    return {
        name,
        description: name,
        type: "none",
        version: "1.0.0",
        load: () => Promise.reject(new Error("not expected to be called on an already-resolved item")),
        ctor: class { getChildDefinitions() { return pageDefinitions; } } as never,
        schema: class { } as never,
        component: null as never
    };
}

function profile(id: string, pages: Array<string>, overrides: Partial<IPrintProfile> = {}): IPrintProfile {
    return { id, name: id, pages, ...overrides };
}

describe("PrintService", () => {
    let service: PrintService;

    beforeEach(() => {
        service = new PrintService({});
    });

    describe("getProfiles", () => {
        /** Every form prints, whether or not it has been given copies of its own. */
        it("falls back to a copy of every page for a form that registered none", () => {
            const profiles = service.getProfiles(catalogItem("s438", "front-page", "notice-page"));

            expect(profiles).toHaveLength(1);
            expect(profiles[0].id).toBe(allPagesProfileId);
            expect(profiles[0].pages).toEqual(["front-page", "notice-page"]);
            expect(profiles[0].layout).toBe("top-down");
        });

        it("answers the copies a form registered", () => {
            const item = catalogItem("s438", "front-page", "notice-page");
            service.registerProfiles({ name: "s438", version: "1.0.0" }, [profile("violator", ["front-page"])]);

            expect(service.getProfiles(item).map(entry => entry.id)).toEqual(["violator"]);
        });

        /** The list is copied on the way out, so a caller cannot reach the registered set through it. */
        it("hands back a copy of the registered set", () => {
            const item = catalogItem("s438", "front-page");
            service.registerProfiles({ name: "s438", version: "1.0.0" }, [profile("violator", ["front-page"])]);

            service.getProfiles(item).push(profile("extra", ["front-page"]));

            expect(service.getProfiles(item)).toHaveLength(1);
        });

        it("keeps the copies of two versions of the same form apart", () => {
            service.registerProfiles({ name: "s438", version: "1.0.0" }, [profile("violator", ["front-page"])]);
            service.registerProfiles({ name: "s438", version: "2.0.0" }, [profile("court", ["front-page"])]);

            const v1 = { ...catalogItem("s438", "front-page"), version: "1.0.0" };
            const v2 = { ...catalogItem("s438", "front-page"), version: "2.0.0" };

            expect(service.getProfiles(v1).map(entry => entry.id)).toEqual(["violator"]);
            expect(service.getProfiles(v2).map(entry => entry.id)).toEqual(["court"]);
        });
    });

    describe("registerProfiles", () => {
        /**
         * Copies are always looked up against a resolved catalog item, which names a concrete version, so a set
         * registered without one could never be matched and would surface as a form that silently prints whole.
         */
        it("refuses an identity that names no version", () => {
            expect(() => service.registerProfiles({ name: "s438" }, [profile("violator", ["front-page"])]))
                .toThrowError("Print profiles must be registered with the version of the form they belong to, but those for s438 named none.");
        });

        it("refuses a second set for the same identity", () => {
            service.registerProfiles({ name: "s438", version: "1.0.0" }, [profile("violator", ["front-page"])]);

            expect(() => service.registerProfiles({ name: "s438", version: "1.0.0" }, [profile("court", ["front-page"])]))
                .toThrowError("Print profiles for the form with the name of s438 and version 1.0.0 have already been registered.");
        });

        /** Two copies under one id would make the second unreachable, since a copy is resolved by id. */
        it("refuses two copies carrying the same id", () => {
            expect(() => service.registerProfiles({ name: "s438", version: "1.0.0" }, [
                profile("violator", ["front-page"]),
                profile("violator", ["notice-page"])
            ])).toThrowError("More than one print profile for s438 carries the id violator.");
        });

        it("accepts a set whose ids are distinct", () => {
            expect(() => service.registerProfiles({ name: "s438", version: "1.0.0" }, [
                profile("violator", ["front-page"]),
                profile("court", ["notice-page"])
            ])).not.toThrow();
        });

        it("accepts an empty set, which then answers as registered rather than falling back", () => {
            service.registerProfiles({ name: "s438", version: "1.0.0" }, []);

            expect(service.getProfiles(catalogItem("s438", "front-page"))).toEqual([]);
        });
    });

    describe("print", () => {
        /** The controllers are only reached after the copy has been resolved and checked, so a stub suffices. */
        const controllers = {} as IControllerManager;

        it("refuses a copy id the form does not publish", async () => {
            const item = catalogItem("s438", "front-page");

            await expect(service.print(controllers, item, { profileId: "nothing" }))
                .rejects.toThrowError("No print profile with the id of nothing is registered for s438.");
        });

        /** Failing here is better than printing a blank sheet for a page the form does not carry. */
        it("refuses a copy naming a page the form does not carry", async () => {
            service.registerProfiles({ name: "s438", version: "1.0.0" }, [profile("violator", ["front-page", "missing-page"])]);
            const item = catalogItem("s438", "front-page");

            await expect(service.print(controllers, item, { profileId: "violator" }))
                .rejects.toThrowError("The print profile violator for s438 names the page missing-page, which the form does not carry.");
        });
    });
});
