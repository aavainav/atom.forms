// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import FDropzone from "../../src/components/dropzone/dropzone";
import { ControllerManager } from "../../src/controllers/controller-manager";
import type { IPageBinding } from "../../src/controllers/form-controller";
import type { FormMode } from "../../src/models/form";
import type { PageDefinition } from "../../src/models/page-definition";
import type { IDraggableItem } from "../../src/models/import/draggable-item";
import type { Dropzone } from "../../src/models/import/dropzone";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const person: IDraggableItem = { id: "person-1", type: "person", data: { firstName: "Dana", lastName: "Reyes" } };
const vehicle: IDraggableItem = { id: "vehicle-1", type: "vehicle", data: { make: "Ford" } as never };

const mounted: Array<() => void> = [];

interface IZoneOptions {
    /** Whom the zone already holds, if anyone. */
    readonly current?: string;
    readonly isLocked?: boolean;
    readonly mode?: FormMode;
}

/** A dropzone for people, which answers a drop with what it was dropped so a test can see it, and holds whom it is told. */
function personDropzone(current?: string): Dropzone {
    return {
        type: "person",
        describe: (fields: { name?: string }) => fields.name,
        getCurrentFields: () => ({ name: current }),
        getFields: () => ({}),
        getIsOccupied: () => current !== undefined,
        getSection: () => ({ getDefinition: () => "violator-section" }),
        onDrop: (data: { firstName?: string; lastName?: string }) => ({ dropped: data, describe: () => `${data.firstName} ${data.lastName}`, getFields: () => ({}) })
    } as unknown as Dropzone;
}

/** A page binding as the zone reads it: the form's mode, whether the section is locked, and the page as it stands. */
function pageBinding({ isLocked = false, mode = "editable" }: IZoneOptions): IPageBinding {
    return {
        mode,
        pageDefinition: {} as PageDefinition,
        pageId: "page-1",
        get: vi.fn(),
        getSection: vi.fn(),
        getSectionCollection: vi.fn(),
        isSectionLocked: () => isLocked,
        update: vi.fn()
    };
}

function mount(onDrop?: (dropzone: Dropzone) => void | Promise<void>, options: IZoneOptions = {}) {
    const controller = new ControllerManager().getDragAndDropController();
    const container = document.createElement("div");
    const root = createRoot(container);

    act(() => root.render(createElement(FDropzone, { binding: pageBinding(options), controller, dropzone: personDropzone(options.current), onDrop }, createElement("span", undefined, "Violator"))));

    const unmount = (): void => act(() => root.unmount());
    mounted.push(unmount);

    return { controller, element: container.firstElementChild as HTMLElement, unmount };
}

/** Drops the item onto the element, letting the drop's awaits settle. */
async function drop(element: HTMLElement, item: unknown = person): Promise<void> {
    const event = dragEvent("drop", { getData: () => JSON.stringify(item) });

    await act(async () => { element.dispatchEvent(event); });
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

        it("hands over what the dropzone makes of an item of its own type", async () => {
            const onDrop = vi.fn();
            const { element } = mount(onDrop);
            const getData = vi.fn(() => JSON.stringify(person));
            const event = dragEvent("drop", { getData });

            await act(async () => { element.dispatchEvent(event); });

            expect(getData).toHaveBeenCalledWith("application/f-importable-person");
            expect(event.defaultPrevented).toBe(true);
            expect(onDrop).toHaveBeenCalledWith(expect.objectContaining({ dropped: person.data }));
        });

        it("does nothing for a drop that carries no item of its type", async () => {
            const onDrop = vi.fn();
            const { element } = mount(onDrop);

            await act(async () => { element.dispatchEvent(dragEvent("drop", { getData: () => "" })); });

            expect(onDrop).not.toHaveBeenCalled();
        });

        it("does nothing for an item whose data is not what its type promises", async () => {
            const onDrop = vi.fn();
            const { element } = mount(onDrop);

            await drop(element, { ...person, data: { firstName: "D" } });

            expect(onDrop).not.toHaveBeenCalled();
        });

        it("waits for a drop that takes a moment, as one needing a lookup does", async () => {
            let finished = false;
            const { element } = mount(async () => { await Promise.resolve(); finished = true; });

            await drop(element);

            expect(finished).toBe(true);
        });
    });

    describe("when it is closed", () => {
        it.each([["a form that is not editable", { mode: "viewable" as FormMode }], ["a locked section", { isLocked: true }]])("ignores a drop on %s", async (_, options) => {
            const onDrop = vi.fn();

            await drop(mount(onDrop, options).element);

            expect(onDrop).not.toHaveBeenCalled();
        });

        it("ignores a drop with nobody to tell, without throwing", async () => {
            const { controller, element } = mount();
            const confirm = vi.fn(async () => true);
            controller.setConfirmReplace(confirm);

            await expect(drop(element)).resolves.toBeUndefined();
            expect(confirm).not.toHaveBeenCalled();
        });
    });

    describe("onto a record already there", () => {
        it("drops onto an empty zone without asking", async () => {
            const onDrop = vi.fn();
            const { controller, element } = mount(onDrop);
            const confirm = vi.fn(async () => true);
            controller.setConfirmReplace(confirm);

            await drop(element);

            expect(confirm).not.toHaveBeenCalled();
            expect(onDrop).toHaveBeenCalledTimes(1);
        });

        it("asks first, naming whom it would replace and with whom, and replaces once told to", async () => {
            const onDrop = vi.fn();
            const { controller, element } = mount(onDrop, { current: "James Whitfield" });
            const confirm = vi.fn(async () => true);
            controller.setConfirmReplace(confirm);

            await drop(element);

            expect(confirm).toHaveBeenCalledWith({ current: "James Whitfield", next: "Dana Reyes", type: "person" });
            expect(onDrop).toHaveBeenCalledTimes(1);
        });

        it("leaves the record, and starts nothing, when told not to replace it", async () => {
            const onDrop = vi.fn();
            const { controller, element } = mount(onDrop, { current: "James Whitfield" });
            controller.setConfirmReplace(async () => false);

            await drop(element);

            expect(onDrop).not.toHaveBeenCalled();
        });

        it("replaces without asking when the host sets no policy", async () => {
            const onDrop = vi.fn();

            await drop(mount(onDrop, { current: "James Whitfield" }).element);

            expect(onDrop).toHaveBeenCalledTimes(1);
        });
    });

    it("stops listening to the controller when it is removed", () => {
        const { controller, unmount } = mount();

        unmount();

        expect(() => act(() => controller.dragStart(person))).not.toThrow();
    });
});
