// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import FDraggableItem from "../../src/components/draggable-item/draggable-item";
import { ControllerManager } from "../../src/controllers/controller-manager";
import type { IDraggableItem } from "../../src/models/import/draggable-item";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const item: IDraggableItem = { id: "person-1", type: "person", data: { firstName: "Dana", lastName: "Reyes" } };

const mounted: Array<() => void> = [];

function mount(disabled?: boolean) {
    const controller = new ControllerManager().getDragAndDropController();
    const started: Array<IDraggableItem> = [];
    let ended = 0;
    controller.onDragStart(dragged => started.push(dragged));
    controller.onDragEnd(() => { ended += 1; });

    const container = document.createElement("div");
    const root = createRoot(container);

    act(() => root.render(createElement(FDraggableItem, { controller, disabled, itemData: item }, createElement("span", undefined, "Dana Reyes"))));
    mounted.push(() => act(() => root.unmount()));

    return { element: container.firstElementChild as HTMLElement, getEnded: () => ended, started };
}

/** A drag event as a browser would raise it, carrying a data transfer since jsdom has neither. */
function dragEvent(type: string, dataTransfer?: Partial<DataTransfer>): Event {
    const event = new Event(type, { bubbles: true, cancelable: true });
    Object.defineProperty(event, "dataTransfer", { value: dataTransfer });

    return event;
}

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
});

describe("FDraggableItem", () => {
    it("shows what it is given to drag", () => {
        expect(mount().element.textContent).toBe("Dana Reyes");
    });

    it("can be dragged by default, and cannot be while disabled", () => {
        expect(mount().element.getAttribute("draggable")).toBe("true");
        expect(mount(true).element.getAttribute("draggable")).toBe("false");
    });

    describe("starting a drag", () => {
        it("puts the item on the data transfer under its type, and tells the controller", () => {
            const { element, started } = mount();
            const setData = vi.fn();

            act(() => { element.dispatchEvent(dragEvent("dragstart", { setData })); });

            expect(setData).toHaveBeenCalledWith("application/f-importable-person", JSON.stringify(item));
            expect(started).toEqual([item]);
        });

        it("does nothing while disabled, refusing the drag even if a browser started one", () => {
            const { element, started } = mount(true);
            const setData = vi.fn();
            const event = dragEvent("dragstart", { setData });

            act(() => { element.dispatchEvent(event); });

            expect(event.defaultPrevented).toBe(true);
            expect(setData).not.toHaveBeenCalled();
            expect(started).toEqual([]);
        });
    });

    it("tells the controller when the drag ends", () => {
        const { element, getEnded } = mount();

        act(() => { element.dispatchEvent(dragEvent("dragend")); });

        expect(getEnded()).toBe(1);
    });
});
