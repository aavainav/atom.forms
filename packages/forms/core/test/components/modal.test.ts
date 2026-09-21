// @vitest-environment jsdom
import { act, createElement, createRef } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import FModal from "../../src/components/modal/modal";
import type { IFModal, IModalAction } from "../../src/components/modal/modal";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type Props = Parameters<typeof FModal>[0];

const mounted: Array<() => void> = [];

function mount(props: Props = {}) {
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    const ref = createRef<IFModal>();

    const render = (next: Props = props): void => {
        act(() => root.render(createElement(FModal, { ...next, ref }, createElement("p", undefined, "Body"))));
    };

    render();

    const unmount = (): void => {
        act(() => root.unmount());
        container.remove();
    };
    mounted.push(unmount);

    return {
        backdrop: () => document.querySelector<HTMLElement>(".modal-backdrop"),
        container,
        modal: () => container.querySelector<HTMLElement>(".modal")!,
        ref,
        render,
        unmount
    };
}

const button = (container: HTMLElement, text: string): HTMLButtonElement | undefined =>
    Array.from(container.querySelectorAll("button")).find(candidate => candidate.textContent?.includes(text));

/** Lets the action a click started run to completion. */
async function settle(): Promise<void> {
    await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
    });
}

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
    document.body.innerHTML = "";
    document.body.className = "";
});

describe("FModal", () => {
    describe("showing", () => {
        it("shows its title and its content", () => {
            const { container } = mount({ title: "Print report" });

            expect(container.querySelector(".modal-title")!.textContent).toBe("Print report");
            expect(container.querySelector(".modal-body")!.textContent).toBe("Body");
        });

        it("is shown as a dialog, over a backdrop, when it mounts", () => {
            const { backdrop, modal } = mount();

            expect(modal().style.display).toBe("block");
            expect(modal().classList.contains("show")).toBe(true);
            expect(modal().getAttribute("aria-modal")).toBe("true");
            expect(modal().getAttribute("role")).toBe("dialog");
            expect(backdrop()).not.toBeNull();
            expect(document.body.classList.contains("modal-open")).toBe(true);
        });

        it("is not shown when told not to be", () => {
            const { backdrop, modal } = mount({ show: false });

            expect(modal().style.display).toBe("none");
            expect(backdrop()).toBeNull();
        });

        it("shows and hides as the show flag changes", () => {
            const { backdrop, modal, render } = mount();

            render({ show: false });

            expect(modal().style.display).toBe("none");
            expect(modal().getAttribute("aria-hidden")).toBe("true");
            expect(backdrop()).toBeNull();
            expect(document.body.classList.contains("modal-open")).toBe(false);

            render({ show: true });

            expect(modal().style.display).toBe("block");
            expect(backdrop()).not.toBeNull();
        });

        it("has no backdrop when told not to", () => {
            expect(mount({ backdrop: false }).backdrop()).toBeNull();
        });

        it("takes down its backdrop when it is removed", () => {
            const { backdrop, unmount } = mount();

            unmount();

            expect(backdrop()).toBeNull();
            expect(document.body.classList.contains("modal-open")).toBe(false);
        });
    });

    describe("its size", () => {
        it.each([
            ["sm", "modal-sm"],
            ["lg", "modal-lg"],
            ["xl", "modal-xl"]
        ] as const)("is %s as %s", (size, expected) => {
            expect(mount({ size }).container.querySelector(".modal-dialog")!.classList.contains(expected)).toBe(true);
        });

        it("can fill the screen", () => {
            expect(mount({ fullscreen: true }).container.querySelector(".modal-dialog")!.classList.contains("modal-fullscreen")).toBe(true);
        });

        it("is the default size otherwise", () => {
            const dialog = mount().container.querySelector(".modal-dialog")!;

            expect(dialog.classList.contains("modal-sm")).toBe(false);
            expect(dialog.classList.contains("modal-fullscreen")).toBe(false);
        });
    });

    describe("stacking", () => {
        it("sits above the one beneath it, backdrop and all, when it is not the first", () => {
            const { backdrop, modal } = mount({ modalIndex: 2 });

            expect(backdrop()!.style.zIndex).toBe("1062");
            expect(modal().style.zIndex).toBe("1063");
        });

        it("leaves the backdrop's stacking to bootstrap when it is the first", () => {
            expect(mount().backdrop()!.style.zIndex).toBe("");
        });
    });

    describe("its actions", () => {
        const actions = (invoke: () => Promise<{ result: boolean }>): IModalAction[] => [
            { title: "Cancel", invoke: async () => ({ result: true }) },
            { title: "Print", primary: true, invoke }
        ];

        it("has none unless it is given some", () => {
            expect(mount().container.querySelector(".modal-footer")).toBeNull();
            expect(mount({ actions: [] }).container.querySelector(".modal-footer")).toBeNull();
        });

        it("shows each as a button, the primary one emphasised", () => {
            const { container } = mount({ actions: actions(async () => ({ result: true })) });

            expect(button(container, "Print")!.classList.contains("btn-primary")).toBe(true);
            expect(button(container, "Cancel")!.classList.contains("btn-outline-secondary")).toBe(true);
        });

        it("closes when an action says it succeeded", async () => {
            const onClose = vi.fn();
            const { container } = mount({ actions: actions(async () => ({ result: true })), onClose });

            act(() => button(container, "Print")!.click());
            await settle();

            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it("stays open when an action says it did not", async () => {
            const onClose = vi.fn();
            const invoke = vi.fn(async () => ({ result: false }));
            const { container } = mount({ actions: actions(invoke), onClose });

            act(() => button(container, "Print")!.click());
            await settle();

            expect(invoke).toHaveBeenCalledTimes(1);
            expect(onClose).not.toHaveBeenCalled();
        });

        it("waits for an action, showing that it is working and refusing another meanwhile", async () => {
            let finish!: (result: { result: boolean }) => void;
            const invoke = () => new Promise<{ result: boolean }>(resolve => { finish = resolve; });
            const { container } = mount({ actions: actions(invoke) });

            act(() => button(container, "Print")!.click());

            expect(button(container, "Print")!.querySelector(".spinner-border")).not.toBeNull();
            expect(button(container, "Print")!.disabled).toBe(true);
            expect(button(container, "Cancel")!.disabled).toBe(true);

            await act(async () => { finish({ result: false }); });

            expect(button(container, "Print")!.querySelector(".spinner-border")).toBeNull();
            expect(button(container, "Cancel")!.disabled).toBe(false);
        });
    });

    describe("closing", () => {
        it("offers a close button only when it has a close action", () => {
            expect(mount().container.querySelector(".btn-close")).toBeNull();
            expect(mount({ close: { invoke: async () => ({ result: true }) } }).container.querySelector(".btn-close")).not.toBeNull();
        });

        it("runs the close action from the close button, and closes when it succeeds", async () => {
            const onClose = vi.fn();
            const invoke = vi.fn(async () => ({ result: true }));
            const { container } = mount({ close: { invoke }, onClose });

            act(() => container.querySelector<HTMLElement>(".btn-close")!.click());
            await settle();

            expect(invoke).toHaveBeenCalledTimes(1);
            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it("stays open when the close action refuses", async () => {
            const onClose = vi.fn();
            const { container } = mount({ close: { invoke: async () => ({ result: false }) }, onClose });

            act(() => container.querySelector<HTMLElement>(".btn-close")!.click());
            await settle();

            expect(onClose).not.toHaveBeenCalled();
        });

        it("closes when the backdrop is clicked, through the close action when there is one", async () => {
            const invoke = vi.fn(async () => ({ result: true }));
            const onClose = vi.fn();
            const { backdrop } = mount({ close: { invoke }, onClose });

            act(() => backdrop()!.click());
            await settle();

            expect(invoke).toHaveBeenCalledTimes(1);
            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it("closes when the backdrop is clicked, straight away when there is no close action", () => {
            const onClose = vi.fn();
            const { backdrop } = mount({ onClose });

            act(() => backdrop()!.click());

            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it("ignores the backdrop when it is persistent", () => {
            const onClose = vi.fn();
            const { backdrop } = mount({ onClose, persistent: true });

            act(() => backdrop()!.click());

            expect(onClose).not.toHaveBeenCalled();
        });
    });
});
