import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ServicesContext } from "@common/react";
import type { IServiceCollection } from "@shrub/core";

import NotificationManager from "../../src/components/notification/manager";
import { maxNotifications } from "../../src/components/notification/notification-items";
import { NotificationService } from "../../src/services/notification";

// react-dom picks the event name it listens for when it loads, and without an AnimationEvent it takes jsdom for an
// old browser and listens for the webkit-prefixed one instead
vi.hoisted(() => { (globalThis as { AnimationEvent?: unknown }).AnimationEvent = class extends Event { }; });

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mounted: Array<() => void> = [];

/** Mounts the real manager, and the real notification it renders, against a real service. */
function mount(): { readonly container: HTMLElement; readonly service: NotificationService } {
    const service = new NotificationService();
    const services = { get: () => service } as unknown as IServiceCollection;
    const container = document.createElement("div");
    const root = createRoot(container);

    act(() => root.render(createElement(ServicesContext.Provider, { value: services }, createElement(NotificationManager))));
    mounted.push(() => act(() => root.unmount()));

    return { container, service };
}

function shown(container: HTMLElement): Array<Element> {
    return Array.from(container.querySelectorAll(".f-notification"));
}

function countdown(container: HTMLElement): Element | null {
    return container.querySelector(".f-notification__countdown");
}

/** Lets the countdown run out, which is what closes a notification; jsdom runs no animations of its own. */
function endCountdown(container: HTMLElement): void {
    act(() => { countdown(container)!.dispatchEvent(new Event("animationend", { bubbles: true })); });
}

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
});

describe("NotificationManager", () => {
    it("closes a notification when its countdown ends", () => {
        const { container, service } = mount();
        act(() => service.showNotification({ message: "Saved.", type: "success" }));

        expect(shown(container)).toHaveLength(1);

        endCountdown(container);

        expect(shown(container)).toHaveLength(0);
    });

    it("shows a repeat once, with its count, and restarts the countdown", () => {
        const { container, service } = mount();
        act(() => service.showNotification({ message: "3 validation issue(s) found.", type: "danger" }));
        const first = countdown(container);

        act(() => service.showNotification({ message: "3 validation issue(s) found.", type: "danger" }));
        act(() => service.showNotification({ message: "3 validation issue(s) found.", type: "danger" }));

        expect(shown(container)).toHaveLength(1);
        expect(container.textContent).toContain("×3");
        expect(countdown(container)).not.toBe(first);
    });

    it("keeps a notification up, with no countdown, when its duration is 0", () => {
        const { container, service } = mount();
        act(() => service.showNotification({ duration: 0, message: "Stays.", type: "info" }));

        expect(shown(container)).toHaveLength(1);
        expect(countdown(container)).toBeNull();
    });

    it("keeps only the newest few", () => {
        const { container, service } = mount();
        act(() => {
            for (let index = 0; index <= maxNotifications; index++) {
                service.showNotification({ message: `Message ${index}`, type: "info" });
            }
        });

        expect(shown(container)).toHaveLength(maxNotifications);
        expect(container.textContent).not.toContain("Message 0");
    });

    it("closes one notification without touching the others", () => {
        const { container, service } = mount();
        act(() => {
            service.showNotification({ message: "First", type: "info" });
            service.showNotification({ message: "Second", type: "info" });
        });

        act(() => { (container.querySelector(".btn-close") as HTMLElement).click(); });

        expect(shown(container).map(element => element.textContent)).toEqual(["Second"]);
    });
});
