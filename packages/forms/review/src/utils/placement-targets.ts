import type { IFieldPlacement } from "@forms/core";

import type { ReviewTarget } from "../models/review-comment";

/** The targets a field can be commented on as: itself, its section, or its page. */
export function getPlacementTargets(placement: IFieldPlacement): Record<"field" | "page" | "section", ReviewTarget> {
    const section = placement.definition.getSectionDefinition();
    const page = section.getPageDefinition();
    // a shared section holds the same values on every page, so a comment on it is about all of them
    const pageOrdinal = section.isShared ? 0 : placement.pageOrdinal;

    return {
        field: { field: placement.definition.name, level: "field", page: page.name, pageOrdinal, section: section.name },
        page: { level: "page", page: page.name, pageOrdinal: placement.pageOrdinal },
        section: { level: "section", page: page.name, pageOrdinal, section: section.name }
    };
}
