// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import FDropzone from "../../src/components/dropzone/dropzone";
import { ControllerManager } from "../../src/controllers/controller-manager";
import type { IDraggableItem } from "../../src/models/import/draggable-item";
import type { Dropzone } from "../../src/models/import/dropzone";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const person: IDraggableItem = { id: "person-1", type: "person", data: { firstName: "Dana", lastName: "Reyes" } };
const vehicle: IDraggableItem = { id: "vehicle-1", type: "vehicle", data: { make: "Ford" } as never };

const mounted: Array<() => void> = [];

/** A dropzone for people, which answers a drop with what it was dropped so a test can see it. */
const personDropzone = { type: "person", onDrop: (data: unknown) => ({ dropped: data }) } as unknown as Dropzone;

function mount(onDrop?: (dropzone: Dropzone) => void) {
    const controller = new ControllerManager().getDragAndDropController();
    const container = document.createElement("div");
    const root = createRoot(container);

    act(() => root.render(createElement(FDropzone, { controller, dropzone: personDropzone, onDrop }, createElement("span", undefined, "Violator"))));

    const unmount = (): void => act(() => root.unmount());
    mounted.push(unmount);

    return { controller, element: container.firstElementChild as HTMLElement, unmount };
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

describe("FDropzone", () => {
    it("shows what it wraps, with nothing to say while nothing is being dragged", () => {
        const { element } = mount();

        expect(element.textContent).toBe("Violator");
        expect(element.className).toBe("");
    });

    describe("while something is dragged", () => {
        it("marks itself as a drop target for an item of the type it accepts", () => {
            const { controller, element } = mount();

            act(() => controller.dragStart(person));

            expect(element.classList.contains("dropzone-dragging")).toBe(true);
            expect(element.classList.contains("dropzone-invalid")).toBe(false);
        });

        it("marks itself invalid for an item of another type", () => {
            const { controller, element } = mount();

            act(() => controller.dragStart(vehicle));

            expect(element.classList.contains("dropzone-dragging")).toBe(true);
            expect(element.classList.contains("dropzone-invalid")).toBe(true);
        });

        it("goes back to nothing to say when the drag ends", () => {
            const { controller, element } = mount();

            act(() => controller.dragStart(vehicle));
            act(() => controller.dragEnd());

            expect(element.className).toBe("");
        });
    });

    describe("dropping", () => {
        it("allows a drop, which a browser refuses unless the drag over is cancelled", () => {
            const { element } = mount();
            const event = dragEvent("dragover");

            act(() => { element.dispatchEvent(event); });

            expect(event.defaultPrevented).toBe(true);
        });

        it("hands over what the dropzone makes of an item of its own type", () => {
            const onDrop = vi.fn();
            const { element } = mount(onDrop);
            const getData = vi.fn(() => JSON.stringify(person));
            const event = dragEvent("drop", { getData });

            act(() => { element.dispatchEvent(event); });

            expect(getData).toHaveBeenCalledWith("application/f-importable-person");
            expect(event.defaultPrevented).toBe(true);
            expect(onDrop).toHaveBeenCalledWith({ dropped: person.data });
        });

        it("does nothing for a drop that carries no item of its type", () => {
            const onDrop = vi.fn();
            const { element } = mount(onDrop);

            act(() => { element.dispatchEvent(dragEvent("drop", { getData: () => "" })); });

            expect(onDrop).not.toHaveBeenCalled();
        });

        it("does nothing for an item whose data is not what its type promises", () => {
            const onDrop = vi.fn();
            const { element } = mount(onDrop);
            const invalid = { ...person, data: { firstName: "D" } };

            act(() => { element.dispatchEvent(dragEvent("drop", { getData: () => JSON.stringify(invalid) })); });

            expect(onDrop).not.toHaveBeenCalled();
        });

        it("accepts a drop with nobody to tell", () => {
            const { element } = mount();

            expect(() => act(() => { element.dispatchEvent(dragEvent("drop", { getData: () => JSON.stringify(person) })); })).not.toThrow();
        });
    });

    it("stops listening to the controller when it is removed", () => {
        const { controller, unmount } = mount();

        unmount();

        expect(() => act(() => controller.dragStart(person))).not.toThrow();
    });
});
