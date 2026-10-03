// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import FApplyButton from "../../src/components/apply-button/apply-button";
import { ControllerManager } from "../../src/controllers/controller-manager";
import type { IDropTarget } from "../../src/controllers/drag-and-drop-controller";
import type { IDraggableItem } from "../../src/models/import/draggable-item";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const person: IDraggableItem = { id: "person-1", type: "person", data: { firstName: "Dana", lastName: "Reyes" } };

const mounted: Array<() => void> = [];

/** A dropzone as it registers itself, filling with a spy, on the page showing unless told otherwise. */
function target(id: string, title: string, overrides: Partial<IDropTarget> = {}): IDropTarget {
    return { id, isClosed: false, pageId: "page-1", title, type: "person", fill: vi.fn(async () => undefined), ...overrides };
}

/** Mounts the button for the item over a form showing page-1, with the given dropzones registered. */
function mount(targets: ReadonlyArray<IDropTarget>, disabled = false) {
    const controllers = new ControllerManager();
    controllers.getNavigationController().setActivePage("page-1");
    targets.forEach(entry => controllers.getDragAndDropController().registerTarget(entry));

    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);

    act(() => root.render(createElement(FApplyButton, { controllers, disabled, item: person })));
    mounted.push(() => { act(() => root.unmount()); container.remove(); });

    const button = (): HTMLButtonElement => container.querySelector("button")!;
    const rows = (): Array<HTMLElement> => Array.from(container.querySelectorAll<HTMLElement>(".list-group-item"));

    return { button, container, controllers, rows };
}

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
});

describe("FApplyButton", () => {
    it("says nothing on the page takes the item when no zone does, and cannot be pressed", () => {
        const { button } = mount([target("vehicle", "Vehicle Section", { type: "vehicle" })]);

        expect(button().textContent).toContain("Nothing here takes a person");
        expect(button().disabled).toBe(true);
    });

    it("leaves out zones on a page that isn't showing", () => {
        const { button } = mount([target("violator", "Violator Section", { pageId: "page-2" })]);

        expect(button().textContent).toContain("Nothing here takes a person");
    });

    it("fills the one zone that takes the item straight away", async () => {
        const violator = target("violator", "Violator Section");
        const { button } = mount([violator]);

        expect(button().textContent).toContain("Fill Violator Section");

        await act(async () => { button().click(); });

        expect(violator.fill).toHaveBeenCalledWith(person);
    });

    it("says the one zone is locked, and cannot be pressed", () => {
        const { button } = mount([target("violator", "Violator Section", { isClosed: true })]);

        expect(button().textContent).toContain("Violator Section is locked");
        expect(button().disabled).toBe(true);
    });

    it("cannot be pressed while the item itself cannot be applied", () => {
        expect(mount([target("violator", "Violator Section")], true).button().disabled).toBe(true);
    });

    describe("with several zones that take the item", () => {
        it("offers them in a list beneath it once pressed", () => {
            const { button, rows } = mount([target("violator", "Violator Section"), target("owner", "Owner Section")]);

            expect(button().textContent).toContain("Apply to…");
            expect(rows()).toHaveLength(0);

            act(() => button().click());

            expect(rows().map(row => row.textContent!.trim())).toEqual(["Violator Section", "Owner Section"]);
        });

        it("fills the zone chosen, and closes the list", async () => {
            const owner = target("owner", "Owner Section");
            const { button, rows } = mount([target("violator", "Violator Section"), owner]);

            act(() => button().click());
            await act(async () => { rows()[1].click(); });

            expect(owner.fill).toHaveBeenCalledWith(person);
            expect(rows()).toHaveLength(0);
        });

        it("marks a locked zone, which cannot be chosen", async () => {
            const owner = target("owner", "Owner Section", { isClosed: true });
            const { button, rows } = mount([target("violator", "Violator Section"), owner]);

            act(() => button().click());
            await act(async () => { rows()[1].click(); });

            expect(rows()[1].textContent).toContain("Locked");
            expect(owner.fill).not.toHaveBeenCalled();
        });

        it("cannot be pressed when every zone is locked", () => {
            const { button } = mount([target("violator", "Violator Section", { isClosed: true }), target("owner", "Owner Section", { isClosed: true })]);

            expect(button().disabled).toBe(true);
        });

        it("closes the list on Escape", () => {
            const { button, rows } = mount([target("violator", "Violator Section"), target("owner", "Owner Section")]);

            act(() => button().click());
            act(() => { rows()[0].dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Escape" })); });

            expect(rows()).toHaveLength(0);
        });
    });
});
