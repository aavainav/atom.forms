import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ServicesContext } from "@common/react";
import { ControllerManager } from "@forms/core";
import type { FormModel } from "@forms/core";
import { getReviewController } from "@forms/review";
import type { IReviewComment } from "@forms/review";
import type { IServiceCollection } from "@shrub/core";

import { ReviewOption } from "../../src/components/options/review-option";
import { ReviewService } from "../../src/services/review";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const held: IReviewComment = { at: 1, author: { id: "9", name: "Lt. Osei" }, id: "held-1", isResolved: false, target: { level: "form" }, text: "Needs a narrative." };

const mounted: Array<() => void> = [];

function mount() {
    const controllers = new ControllerManager();
    controllers.loadForm({ id: "form-1", mode: "reviewable" } as FormModel<any>);

    const reviewService = new ReviewService();
    const services = { get: () => reviewService } as unknown as IServiceCollection;
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);

    act(() => root.render(createElement(ServicesContext.Provider, {
        value: services
    }, createElement(ReviewOption, { catalogItem: {} as never, controllers, onError: vi.fn(), showModal: vi.fn(), title: "Review comments" }))));
    mounted.push(() => { act(() => root.unmount()); container.remove(); });

    return { container, review: getReviewController(controllers), reviewService };
}

/** What the tooltip will say: bootstrap moves a title into this attribute when it builds the tooltip. */
function tooltipTitle(container: HTMLElement): string | null {
    return container.querySelector("[data-bs-toggle=tooltip]")!.getAttribute("data-bs-original-title");
}

/** The badge on the button, where the number of open comments is shown. */
function badge(container: HTMLElement): HTMLElement | null {
    return container.querySelector<HTMLElement>("#review-button .badge");
}

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
    document.body.innerHTML = "";
});

describe("ReviewOption", () => {
    it("asks for the review panel to be toggled when it is clicked", () => {
        const { container, reviewService } = mount();
        const toggled = vi.fn();
        reviewService.onTogglePanel(toggled);

        act(() => container.querySelector<HTMLElement>("#review-button")!.click());

        expect(toggled).toHaveBeenCalledTimes(1);
    });

    it("is named for what it opens, however many comments are open", () => {
        const { container, review } = mount();
        expect(tooltipTitle(container)).toBe("Review comments");

        act(() => review.load([held]));
        expect(tooltipTitle(container)).toBe("Review comments");
    });

    it("has no badge while every comment is resolved", () => {
        expect(badge(mount().container)).toBeNull();
    });

    it("badges the button with how many comments are open, following them as they are added and resolved", () => {
        const { container, review } = mount();

        act(() => review.load([held, { ...held, id: "held-2" }]));
        expect(badge(container)!.textContent).toBe("2 open");

        act(() => review.setResolved("held-1", true));
        expect(badge(container)!.textContent).toBe("1 open");

        act(() => review.setResolved("held-2", true));
        expect(badge(container)).toBeNull();
    });
});
