import { describe, expect, it } from "vitest";

import { ActivityEventArgs } from "../../src/controllers/controller-activity";
import { ControllerManager } from "../../src/controllers/controller-manager";

/** Manages its own controllers, and asks for a navigation controller that no form has to be loaded for. */
function navigation() {
    const manager = new ControllerManager();
    const controller = manager.getNavigationController();

    let changes = 0;
    controller.onChanged(() => { changes += 1; });

    const reported: Array<ActivityEventArgs> = [];
    manager.onActivity(args => reported.push(args));

    return { controller, getChanges: () => changes, reported };
}

const first = { page: "citation", pageOrdinal: 0 };
const second = { page: "citation", pageOrdinal: 1 };

describe("NavigationController", () => {
    describe("setActivePage", () => {
        it("records the page showing, and raises a change", () => {
            const { controller, getChanges } = navigation();

            controller.setActivePage("page-1");

            expect(controller.activePageId).toBe("page-1");
            expect(getChanges()).toBe(1);
        });

        it("raises nothing when the page is the one already showing", () => {
            const { controller, getChanges } = navigation();

            controller.setActivePage("page-1");
            controller.setActivePage("page-1");

            expect(getChanges()).toBe(1);
        });

        it("forgets the page when told none is showing", () => {
            const { controller } = navigation();

            controller.setActivePage("page-1");
            controller.setActivePage(undefined);

            expect(controller.activePageId).toBeUndefined();
        });

        it("is separate from the pending target, which it leaves alone", () => {
            const { controller } = navigation();

            controller.goTo({ fieldId: "field-1", pageId: "page-2" });
            controller.setActivePage("page-1");

            expect(controller.target).toEqual({ fieldId: "field-1", pageId: "page-2" });
        });
    });

    describe("reporting a page coming into view", () => {
        it("reports nothing for the first page shown, which is the one the form opened on", () => {
            const { controller, reported } = navigation();

            controller.setActivePage("page-1", first);

            expect(reported).toEqual([]);
        });

        it("reports a different page, naming it, and reports going back to a page too", () => {
            const { controller, reported } = navigation();

            controller.setActivePage("page-1", first);
            controller.setActivePage("page-2", second);
            controller.setActivePage("page-1", first);

            expect(reported).toEqual([
                { activity: { kind: "page-focused", page: "citation", pageOrdinal: 1 } },
                { activity: { kind: "page-focused", page: "citation", pageOrdinal: 0 } }
            ]);
        });

        it("reports nothing when the page is the one already showing", () => {
            const { controller, reported } = navigation();

            controller.setActivePage("page-1", first);
            controller.setActivePage("page-2", second);
            controller.setActivePage("page-2", second);

            expect(reported).toHaveLength(1);
        });

        /** A print takes the tabs away and gives them back, and the page that returns is not one that came into view. */
        it("reports nothing when the same page comes back after none was showing", () => {
            const { controller, reported } = navigation();

            controller.setActivePage("page-1", first);
            controller.setActivePage("page-2", second);
            controller.setActivePage(undefined);
            controller.setActivePage("page-2", second);

            expect(reported).toHaveLength(1);
        });

        it("counts the first page shown for a different form as the first, and reports nothing for it", () => {
            const { controller, reported } = navigation();

            controller.setActivePage("page-1", { ...first, formId: "form-1" });
            controller.setActivePage("page-2", { ...second, formId: "form-1" });
            controller.setActivePage("page-3", { ...first, formId: "form-2" });
            controller.setActivePage("page-4", { ...second, formId: "form-2" });

            expect(reported).toEqual([
                { activity: { kind: "page-focused", page: "citation", pageOrdinal: 1 } },
                { activity: { kind: "page-focused", page: "citation", pageOrdinal: 1 } }
            ]);
        });

        it("reports nothing when it is not told what the page is", () => {
            const { controller, reported } = navigation();

            controller.setActivePage("page-1");
            controller.setActivePage("page-2");

            expect(reported).toEqual([]);
        });

        it("counts the next page shown as the first again once disposed", () => {
            const { controller, reported } = navigation();
            controller.setActivePage("page-1", first);

            controller.dispose();
            controller.setActivePage("page-2", second);

            expect(reported).toEqual([]);
        });
    });

    it("lets go of the active page when disposed", () => {
        const { controller } = navigation();
        controller.setActivePage("page-1");

        controller.dispose();

        expect(controller.activePageId).toBeUndefined();
    });
});
