import { vi } from "vitest";
import { ControllerManager } from "@forms/core";
import type { IActor, IFieldPlacement, FormMode, FormModel } from "@forms/core";

import { getReviewController } from "../../src/controllers/review-controller";
import type { ReviewTarget } from "../../src/models/review-comment";

const fieldLabels: Readonly<Record<string, string>> = { "first-name": "First name", "last-name": "Last name", make: "Make" };
const sectionTitles: Readonly<Record<string, string>> = { person: "Person details", vehicle: "Vehicle" };

export interface IPlacementOptions {
    readonly isShared?: boolean;
    readonly pageId?: string;
    readonly pageOrdinal?: number;
    readonly sectionName?: string;
}

/** Stands in for a placement: the controller reads only names, titles, whether the section is shared, and the page. */
export function placement(fieldName: string, options: IPlacementOptions = {}): IFieldPlacement {
    const { isShared = false, pageId = "page-1", pageOrdinal = 0, sectionName = "person" } = options;
    const page = { name: "person-page", title: "Person" };
    const section = { getPageDefinition: () => page, isShared, name: sectionName, title: sectionTitles[sectionName] };

    return { definition: { getSectionDefinition: () => section, label: fieldLabels[fieldName], name: fieldName }, pageId, pageOrdinal } as IFieldPlacement;
}

/** Three fields on one page: two in the person section and one in the vehicle section. */
export const placements = new Map<string, IFieldPlacement>([
    ["field-1", placement("first-name")],
    ["field-2", placement("last-name")],
    ["field-3", placement("make", { sectionName: "vehicle" })]
]);

export const firstName: ReviewTarget = { field: "first-name", level: "field", page: "person-page", pageOrdinal: 0, section: "person" };
export const lastName: ReviewTarget = { field: "last-name", level: "field", page: "person-page", pageOrdinal: 0, section: "person" };
export const person: ReviewTarget = { level: "section", page: "person-page", pageOrdinal: 0, section: "person" };
export const vehicle: ReviewTarget = { level: "section", page: "person-page", pageOrdinal: 0, section: "vehicle" };
export const personPage: ReviewTarget = { level: "page", page: "person-page", pageOrdinal: 0 };
export const report: ReviewTarget = { level: "form" };

export const rivera: IActor = { agency: "Riverside Police Department", badgeId: "4471", id: "4471", name: "Sgt. Rivera", rank: "Sergeant" };
export const osei: IActor = { agency: "Riverside Police Department", badgeId: "0912", id: "9", name: "Lt. Osei", rank: "Lieutenant" };

export interface IReviewOptions {
    readonly mode?: FormMode;
    /** How many pages the form holds of the one page definition. */
    readonly pageCount?: number;
    /** The form's placements, when the ones every test shares will not do. */
    readonly placements?: ReadonlyMap<string, IFieldPlacement>;
    /** Who is commenting; null for nobody. Sgt. Rivera when omitted. */
    readonly user?: IActor | null;
}

/** Loads a stub form into a manager and gets its review controller, counting the changes it raises. */
export function review(options: IReviewOptions = {}) {
    const { mode = "reviewable", pageCount = 1, user = rivera } = options;
    const pageIds = ["page-1"];
    const getFieldPlacements = vi.fn(() => new Map(options.placements ?? placements));
    const form = {
        id: "form-1",
        mode,
        getFieldPlacements,
        getPages: () => pageIds.map(id => ({ id })),
        getPagesFor: () => Array.from({ length: pageCount }, (_, index) => ({ id: `page-${index + 1}` }))
    } as unknown as FormModel<any>;

    const manager = new ControllerManager();

    if (user) {
        manager.setUser(user);
    }

    manager.loadForm(form);

    const controller = getReviewController(manager);

    let changes = 0;
    controller.onChanged(() => { changes += 1; });

    return { controller, controllers: manager, getChanges: () => changes, getFieldPlacements, pageIds };
}
