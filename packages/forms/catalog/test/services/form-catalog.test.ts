import { beforeEach, describe, expect, it } from "vitest";

import type { IFormCatalogItem } from "../../src/services/form-catalog";
import { FormCatalogService } from "../../src/services/form-catalog";

/**
 * A catalog item is only ever stored and handed back, never constructed from, so a stub carrying the identity is
 * enough. The three constructors and the component loader are what a caller uses *after* resolution.
 */
function item(name: string, version: string, description: string = name): IFormCatalogItem {
    return {
        name,
        description,
        version,
        ctor: class { } as never,
        schema: class { } as never,
        formFactory: class { } as never,
        component: () => Promise.resolve(null as never)
    };
}

describe("FormCatalogService", () => {
    let catalog: FormCatalogService;

    beforeEach(() => {
        catalog = new FormCatalogService();
    });

    describe("registerCatalogItem", () => {
        it("registers a form under its name and version", () => {
            catalog.registerCatalogItem(item("s438", "1.0.0"));

            expect(catalog.catalogItems.get("s438")?.get("1.0.0")).toBeDefined();
        });

        it("keeps several versions of the same form", () => {
            catalog.registerCatalogItem(item("s438", "1.0.0"));
            catalog.registerCatalogItem(item("s438", "2.0.0"));

            expect(catalog.catalogItems.get("s438")?.size).toBe(2);
        });

        it("keeps different forms apart", () => {
            catalog.registerCatalogItem(item("s438", "1.0.0"));
            catalog.registerCatalogItem(item("tr310", "1.0.0"));

            expect(catalog.catalogItems.size).toBe(2);
        });

        /** Registering the same identity twice is a wiring mistake, and a silent overwrite would hide it. */
        it("refuses the same name and version twice", () => {
            catalog.registerCatalogItem(item("s438", "1.0.0"));

            expect(() => catalog.registerCatalogItem(item("s438", "1.0.0")))
                .toThrowError("A form with the name of s438 and version 1.0.0 has already been registered with the form catalog.");
        });
    });

    describe("get", () => {
        beforeEach(() => {
            catalog.registerCatalogItem(item("s438", "1.0.0"));
            catalog.registerCatalogItem(item("s438", "2.0.0"));
        });

        it("resolves the version an identity names", async () => {
            await expect(catalog.get({ name: "s438", version: "1.0.0" })).resolves.toMatchObject({ version: "1.0.0" });
        });

        /** An identity without a version means the latest, which is what a route that pins no version relies on. */
        it("resolves the latest version when the identity names none", async () => {
            await expect(catalog.get({ name: "s438" })).resolves.toMatchObject({ version: "2.0.0" });
        });

        it("throws for a name it does not hold", async () => {
            await expect(catalog.get({ name: "nothing" }))
                .rejects.toThrowError("Form type with name nothing not found in catalog.");
        });

        it("throws for a version it does not hold", async () => {
            await expect(catalog.get({ name: "s438", version: "9.9.9" }))
                .rejects.toThrowError("Form type with name s438 and version 9.9.9 not found in catalog.");
        });

        /**
         * Characterization worth pinning: versions are compared as strings, descending. That reads correctly for
         * the single-digit versions in use, but "10.0.0" would sort below "9.0.0" -- so a tenth major version
         * would stop being resolved as the latest.
         */
        it("compares versions as strings rather than numerically", async () => {
            const stringSorted = new FormCatalogService();
            stringSorted.registerCatalogItem(item("s438", "9.0.0"));
            stringSorted.registerCatalogItem(item("s438", "10.0.0"));

            await expect(stringSorted.get({ name: "s438" })).resolves.toMatchObject({ version: "9.0.0" });
        });

        it("resolves the latest regardless of the order the versions were registered in", async () => {
            const reversed = new FormCatalogService();
            reversed.registerCatalogItem(item("s438", "3.0.0"));
            reversed.registerCatalogItem(item("s438", "1.0.0"));

            await expect(reversed.get({ name: "s438" })).resolves.toMatchObject({ version: "3.0.0" });
        });
    });

    describe("getLatestVersions", () => {
        it("answers the latest of every registered form, keyed by name", async () => {
            catalog.registerCatalogItem(item("s438", "1.0.0"));
            catalog.registerCatalogItem(item("s438", "2.0.0"));
            catalog.registerCatalogItem(item("tr310", "1.0.0"));

            const latest = await catalog.getLatestVersions();

            expect(latest.size).toBe(2);
            expect(latest.get("s438")?.version).toBe("2.0.0");
            expect(latest.get("tr310")?.version).toBe("1.0.0");
        });

        it("answers an empty map when nothing is registered", async () => {
            await expect(catalog.getLatestVersions()).resolves.toEqual(new Map());
        });
    });
});
