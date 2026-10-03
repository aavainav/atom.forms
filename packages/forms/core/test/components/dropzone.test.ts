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

/** The section the stub zone sits on, titled as a section is when its schema names no title. */
const violatorSection = { title: "Violator Section" };

/** A dropzone for people, which answers a drop with what it was dropped so a test can see it, and holds whom it is told. */
function personDropzone(current?: string): Dropzone {
    return {
        type: "person",
        describe: (fields: { name?: string }) => fields.name,
        getCurrentFields: () => ({ name: current }),
        getFields: () => ({}),
        getIsOccupied: () => current !== undefined,
        getSection: () => ({ getDefinition: () => violatorSection }),
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

function mount(onDrop?: (dropzone: Dropzone) => void | Promise<void>, options: IZoneOptions = {}, title?: string) {
    const controller = new ControllerManager().getDragAndDropController();
    const container = document.createElement("div");
    const root = createRoot(container);

    act(() => root.render(createElement(FDropzone, { binding: pageBinding(options), controller, dropzone: personDropzone(options.current), title, onDrop }, createElement("span", undefined, "Violator"))));

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
        expect(element.className).toBe("f-dropzone");
    });

    describe("while something is dragged", () => {
        /** The badge on the zone's edge, if it shows one. */
        const badge = (element: HTMLElement): string | undefined => element.querySelector(".f-dropzone__badge")?.textContent ?? undefined;
        const enter = (element: HTMLElement, target: HTMLElement = element): void => act(() => { target.dispatchEvent(dragEvent("dragenter", { types: ["application/f-importable-person"] })); });
        const leave = (element: HTMLElement, target: HTMLElement = element): void => act(() => { target.dispatchEvent(dragEvent("dragleave")); });

        it("marks itself as taking an item of its type, and says nothing more until the item is over it", () => {
            const { controller, element } = mount(vi.fn());

            act(() => controller.dragStart(person));

            expect(element.classList).toContain("f-dropzone--accepts");
            expect(element.classList).not.toContain("f-dropzone--over");
            expect(badge(element)).toBeUndefined();
        });

        it("leaves itself alone for an item of another type, and shows no badge when it is over it", () => {
            const { controller, element } = mount(vi.fn());

            act(() => controller.dragStart(vehicle));
            act(() => { element.dispatchEvent(dragEvent("dragenter", { types: ["application/f-importable-vehicle"] })); });

            expect(element.className).toBe("f-dropzone");
            expect(badge(element)).toBeUndefined();
        });

        it("lights up, and says it can be dropped on, once the item is over it", () => {
            const { controller, element } = mount(vi.fn());

            act(() => controller.dragStart(person));
            enter(element);

            expect(element.classList).toContain("f-dropzone--over");
            expect(badge(element)).toBe("Drop to fill");
        });

        /** Moving between the inputs inside a zone leaves one and enters another, which must not put the zone out. */
        it("stays lit while the item moves between what it holds, and goes out once it leaves the zone", () => {
            const { controller, element } = mount(vi.fn());
            const inner = element.querySelector<HTMLElement>("span")!;

            act(() => controller.dragStart(person));
            enter(element);
            enter(element, inner);
            leave(element);

            expect(element.classList).toContain("f-dropzone--over");

            leave(element, inner);

            expect(element.classList).not.toContain("f-dropzone--over");
            expect(badge(element)).toBeUndefined();
        });

        it.each([["a form that is not editable", { mode: "viewable" as FormMode }], ["a locked section", { isLocked: true }]])("stays unlit on %s, and says it is locked once the item is over it", (_, options) => {
            const { controller, element } = mount(vi.fn(), options);

            act(() => controller.dragStart(person));
            enter(element);

            expect(element.className).toBe("f-dropzone");
            expect(badge(element)).toBe("Locked");
        });

        it("goes back to nothing to say when the drag ends", () => {
            const { controller, element } = mount(vi.fn());

            act(() => controller.dragStart(person));
            enter(element);
            act(() => controller.dragEnd());

            expect(element.className).toBe("f-dropzone");
            expect(badge(element)).toBeUndefined();
        });

        /** A source removed mid-drag never says the drag ended, so the window's own end of it has to put the zones out. */
        it.each([["drop"], ["pointermove"]])("goes out on the window's %s when the item never says the drag ended", type => {
            const { controller, element } = mount(vi.fn());

            act(() => controller.dragStart(person));
            enter(element);
            act(() => { window.dispatchEvent(new Event(type)); });

            expect(element.className).toBe("f-dropzone");
        });
    });

    describe("dropping", () => {
        it("allows a drop of its type, which a browser refuses unless the drag over is cancelled", () => {
            const { controller, element } = mount(vi.fn());
            const transfer = { dropEffect: "none", types: ["application/f-importable-person"] };
            const event = dragEvent("dragover", transfer as Partial<DataTransfer>);

            act(() => controller.dragStart(person));
            act(() => { element.dispatchEvent(event); });

            expect(event.defaultPrevented).toBe(true);
            expect(transfer.dropEffect).toBe("copy");
        });

        it.each([["an item of another type", vehicle, {}], ["a closed zone", person, { mode: "viewable" as FormMode }]])("refuses %s, with the cursor saying so", (_, item, options) => {
            const { controller, element } = mount(vi.fn(), options);
            const transfer = { dropEffect: "copy", types: [`application/f-importable-${item.type}`] };
            const event = dragEvent("dragover", transfer as Partial<DataTransfer>);

            act(() => controller.dragStart(item));
            act(() => { element.dispatchEvent(event); });

            expect(event.defaultPrevented).toBe(false);
            expect(transfer.dropEffect).toBe("none");
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

    describe("offered to be filled by a button", () => {
        it("registers itself while it is mounted, with its section's title, its page and the type it takes", () => {
            const { controller, unmount } = mount(vi.fn());

            expect(controller.targets).toEqual([expect.objectContaining({ isClosed: false, pageId: "page-1", title: "Violator Section", type: "person" })]);

            unmount();
            expect(controller.targets).toEqual([]);
        });

        it("goes by the title it is given in place of its section's", () => {
            expect(mount(vi.fn(), {}, "Violator").controller.targets[0].title).toBe("Violator");
        });

        it("says when it is closed", () => {
            expect(mount(vi.fn(), { isLocked: true }).controller.targets[0].isClosed).toBe(true);
        });

        it("fills as a drop does, asking first when it already holds a record", async () => {
            const onDrop = vi.fn();
            const { controller } = mount(onDrop, { current: "James Whitfield" });
            const confirm = vi.fn(async () => true);
            controller.setConfirmReplace(confirm);

            await act(async () => { await controller.targets[0].fill(person); });

            expect(confirm).toHaveBeenCalledWith({ current: "James Whitfield", next: "Dana Reyes", type: "person" });
            expect(onDrop).toHaveBeenCalledWith(expect.objectContaining({ dropped: person.data }));
        });

        it.each([["an item of another type", vehicle, {}], ["a closed zone", person, { isLocked: true }]])("does nothing for %s", async (_, item, options) => {
            const onDrop = vi.fn();
            const { controller } = mount(onDrop, options);

            await act(async () => { await controller.targets[0].fill(item); });

            expect(onDrop).not.toHaveBeenCalled();
        });
    });
});
