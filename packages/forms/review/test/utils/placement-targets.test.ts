import { describe, expect, it } from "vitest";

import type { IFieldPlacement } from "@forms/core";

import { getPlacementTargets } from "../../src/utils/placement-targets";

/** Stands in for a placement: the helper reads only the names, whether the section is shared, and the ordinals. */
function placement(options: { readonly isShared?: boolean; readonly pageOrdinal?: number; readonly sectionOrdinal?: number } = {}): IFieldPlacement {
    const page = { name: "person-page" };
    const section = { getPageDefinition: () => page, isShared: options.isShared ?? false, name: "person" };

    return {
        definition: { getSectionDefinition: () => section, name: "first-name" },
        pageId: "page-2",
        pageOrdinal: options.pageOrdinal ?? 1,
        sectionOrdinal: options.sectionOrdinal ?? 0
    } as IFieldPlacement;
}

describe("getPlacementTargets", () => {
    it("names the field, its section and its page by their definitions, with the page's ordinal", () => {
        expect(getPlacementTargets(placement())).toEqual({
            field: { field: "first-name", level: "field", page: "person-page", pageOrdinal: 1, section: "person", sectionOrdinal: 0 },
            page: { level: "page", page: "person-page", pageOrdinal: 1 },
            section: { level: "section", page: "person-page", pageOrdinal: 1, section: "person", sectionOrdinal: 0 }
        });
    });

    /** A shared section holds the same values on every page, so a comment on it is about all of them. */
    it("counts a shared section's field, and the section, as on the first page, but not the page", () => {
        const targets = getPlacementTargets(placement({ isShared: true, pageOrdinal: 2 }));

        expect(targets.field).toMatchObject({ pageOrdinal: 0 });
        expect(targets.section).toMatchObject({ pageOrdinal: 0 });
        expect(targets.page).toMatchObject({ pageOrdinal: 2 });
    });

    /** Unlike a page's ordinal, a section collection's is never reset -- there is no cross-instance sharing for it to stand in for. */
    it("carries the section's own ordinal straight through, for the field and the section but not the page", () => {
        const targets = getPlacementTargets(placement({ sectionOrdinal: 2 }));

        expect(targets.field).toMatchObject({ sectionOrdinal: 2 });
        expect(targets.section).toMatchObject({ sectionOrdinal: 2 });
        expect(targets.page).not.toHaveProperty("sectionOrdinal");
    });
});
