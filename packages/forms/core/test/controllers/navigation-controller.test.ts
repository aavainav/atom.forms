import { describe, expect, it } from "vitest";

import { ControllerManager } from "../../src/controllers/controller-manager";

/** Manages its own controllers, and asks for a navigation controller that no form has to be loaded for. */
function navigation() {
    const controller = new ControllerManager().getNavigationController();

    let changes = 0;
    controller.onChanged(() => { changes += 1; });

    return { controller, getChanges: () => changes };
}

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

    it("lets go of the active page when disposed", () => {
        const { controller } = navigation();
        controller.setActivePage("page-1");

        controller.dispose();

        expect(controller.activePageId).toBeUndefined();
    });
});
