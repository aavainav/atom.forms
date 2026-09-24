import { describe, expect, it } from "vitest";

import type { IFieldPlacement } from "@forms/core";

import { getPlacementTargets } from "../../src/utils/placement-targets";

/** Stands in for a placement: the helper reads only the names, whether the section is shared, and the ordinal. */
function placement(options: { readonly isShared?: boolean; readonly pageOrdinal?: number } = {}): IFieldPlacement {
    const page = { name: "person-page" };
    const section = { getPageDefinition: () => page, isShared: options.isShared ?? false, name: "person" };

    return {
        definition: { getSectionDefinition: () => section, name: "first-name" },
        pageId: "page-2",
        pageOrdinal: options.pageOrdinal ?? 1
    } as IFieldPlacement;
}

describe("getPlacementTargets", () => {
    it("names the field, its section and its page by their definitions, with the page's ordinal", () => {
        expect(getPlacementTargets(placement())).toEqual({
            field: { field: "first-name", level: "field", page: "person-page", pageOrdinal: 1, section: "person" },
            page: { level: "page", page: "person-page", pageOrdinal: 1 },
            section: { level: "section", page: "person-page", pageOrdinal: 1, section: "person" }
        });
    });

    /** A shared section holds the same values on every page, so a comment on it is about all of them. */
    it("counts a shared section's field, and the section, as on the first page, but not the page", () => {
        const targets = getPlacementTargets(placement({ isShared: true, pageOrdinal: 2 }));

        expect(targets.field).toMatchObject({ pageOrdinal: 0 });
        expect(targets.section).toMatchObject({ pageOrdinal: 0 });
        expect(targets.page).toMatchObject({ pageOrdinal: 2 });
    });
});
