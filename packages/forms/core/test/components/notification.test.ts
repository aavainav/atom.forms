// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import FNotification from "../../src/components/notification/notification";

// react-dom picks the event name it listens for when it loads, and without an AnimationEvent it takes jsdom for an
// old browser and listens for the webkit-prefixed one instead
vi.hoisted(() => { (globalThis as { AnimationEvent?: unknown }).AnimationEvent = class extends Event { }; });

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type Props = Parameters<typeof FNotification>[0];

const mounted: Array<() => void> = [];

function mount(props: Props): HTMLElement {
    const container = document.createElement("div");
    const root = createRoot(container);

    act(() => root.render(createElement(FNotification, props, "Report saved.")));
    mounted.push(() => act(() => root.unmount()));

    return container;
}

const countdown = (container: HTMLElement): HTMLElement | null => container.querySelector<HTMLElement>(".f-notification__countdown");

function setTabHidden(isHidden: boolean): void {
    Object.defineProperty(document, "hidden", { configurable: true, get: () => isHidden });
}

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
    setTabHidden(false);
});

describe("FNotification", () => {
    it("shows its message as an alert of its type", () => {
        const container = mount({ type: "success" });

        expect(container.textContent).toContain("Report saved.");
        expect(container.querySelector(".alert.alert-success")).not.toBeNull();
    });

    it.each([
        ["danger", "bi-exclamation-circle"],
        ["warning", "bi-exclamation-triangle"],
        ["success", "bi-check-circle"],
        ["info", "bi-info-circle"]
    ] as const)("shows the %s icon for a %s notification", (type, icon) => {
        expect(mount({ type }).querySelector("i.bi")!.className).toContain(icon);
    });

    it("is announced as an alert when it is a danger, and as a status otherwise", () => {
        expect(mount({ type: "danger" }).querySelector(".f-notification")!.getAttribute("role")).toBe("alert");
        expect(mount({ type: "info" }).querySelector(".f-notification")!.getAttribute("role")).toBe("status");
    });

    it("can be dismissible", () => {
        expect(mount({ dismissible: true, type: "info" }).querySelector(".alert-dismissible")).not.toBeNull();
        expect(mount({ type: "info" }).querySelector(".alert-dismissible")).toBeNull();
    });

    describe("the count", () => {
        it("says how many times it was raised once it is more than one", () => {
            expect(mount({ count: 3, type: "danger" }).querySelector(".f-notification__count")!.textContent).toBe("×3");
        });

        it("shows no count for a single one", () => {
            expect(mount({ type: "danger" }).querySelector(".f-notification__count")).toBeNull();
            expect(mount({ count: 1, type: "danger" }).querySelector(".f-notification__count")).toBeNull();
        });
    });

    describe("closing", () => {
        it("calls its close handler when the close button is clicked", () => {
            const onClose = vi.fn();
            const container = mount({ onClose, type: "info" });

            act(() => container.querySelector<HTMLElement>(".btn-close")!.click());

            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it("can be closed with no handler to call", () => {
            const container = mount({ type: "info" });

            expect(() => act(() => container.querySelector<HTMLElement>(".btn-close")!.click())).not.toThrow();
        });
    });

    describe("the countdown", () => {
        it("counts down along its bottom edge for as long as it is given", () => {
            expect(countdown(mount({ duration: 5000, type: "info" }))!.style.animationDuration).toBe("5000ms");
        });

        it("draws no countdown, and never closes itself, without a duration or with none", () => {
            expect(countdown(mount({ type: "info" }))).toBeNull();
            expect(countdown(mount({ duration: 0, type: "info" }))).toBeNull();
        });

        it("closes when the countdown ends", () => {
            const onClose = vi.fn();
            const container = mount({ duration: 5000, onClose, type: "info" });

            act(() => { countdown(container)!.dispatchEvent(new Event("animationend", { bubbles: true })); });

            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it("is hidden from assistive technology, since the message says it all", () => {
            expect(countdown(mount({ duration: 5000, type: "info" }))!.getAttribute("aria-hidden")).toBe("true");
        });
    });

    describe("while the tab is hidden", () => {
        it("holds the countdown, so it cannot run out before anyone sees it", () => {
            setTabHidden(true);

            expect(mount({ duration: 5000, type: "info" }).querySelector(".f-notification--paused")).not.toBeNull();
        });

        it("holds and releases the countdown as the tab is hidden and shown", () => {
            const container = mount({ duration: 5000, type: "info" });
            expect(container.querySelector(".f-notification--paused")).toBeNull();

            act(() => { setTabHidden(true); document.dispatchEvent(new Event("visibilitychange")); });
            expect(container.querySelector(".f-notification--paused")).not.toBeNull();

            act(() => { setTabHidden(false); document.dispatchEvent(new Event("visibilitychange")); });
            expect(container.querySelector(".f-notification--paused")).toBeNull();
        });
    });
});
