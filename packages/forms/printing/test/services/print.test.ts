import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { IResolvedFormCatalogItem } from "@forms/catalog";
import type { FormMode, FormModel, IControllerManager } from "@forms/core";
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

/** Stands in for a form: only `mode`/`setMode` matter here, since the service reads and switches nothing else. */
function stubForm(mode: FormMode): FormModel<any> {
    return { mode, setMode: (next: FormMode) => stubForm(next) } as FormModel<any>;
}

/** A controllers manager whose form and print controllers are plain, inspectable stubs. */
function controllersStub(mode: FormMode) {
    const formController = {
        form: stubForm(mode),
        setForm(this: { form: FormModel<any> }, form: FormModel<any>) { this.form = form; }
    };

    const printController = { begin: vi.fn(), end: vi.fn() };

    const controllers = {
        getFormController: () => formController,
        getPrintController: () => printController
    } as unknown as IControllerManager;

    return { controllers, formController, printController };
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

        /** A print is a copy of the record, so it renders exactly as viewing a finished one would. */
        describe("mode", () => {
            beforeEach(() => {
                vi.spyOn(window, "print").mockImplementation(() => {});
                vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { callback(0); return 0; });
            });

            afterEach(() => {
                vi.restoreAllMocks();
                vi.unstubAllGlobals();
            });

            it.each(["editable", "reviewable"] as const)("is viewable for the duration of the print, when it started out %s", async (mode) => {
                const item = catalogItem("s438", "front-page");
                const { controllers, formController, printController } = controllersStub(mode);

                let modeWhilePrinting: FormMode | undefined;
                printController.begin.mockImplementation(() => { modeWhilePrinting = formController.form.mode; });

                await service.print(controllers, item, { profileId: allPagesProfileId });

                expect(modeWhilePrinting).toBe("viewable");
            });

            it.each(["editable", "reviewable"] as const)("restores the original form object once the print finishes, when it started out %s", async (mode) => {
                const item = catalogItem("s438", "front-page");
                const { controllers, formController } = controllersStub(mode);
                const original = formController.form;

                await service.print(controllers, item, { profileId: allPagesProfileId });

                expect(formController.form).toBe(original);
            });

            it("leaves a form already viewable alone, rather than replacing it and back again", async () => {
                const item = catalogItem("s438", "front-page");
                const { controllers, formController } = controllersStub("viewable");
                const original = formController.form;
                const setForm = vi.spyOn(formController, "setForm");

                await service.print(controllers, item, { profileId: allPagesProfileId });

                expect(setForm).not.toHaveBeenCalled();
                expect(formController.form).toBe(original);
            });
        });
    });
});
