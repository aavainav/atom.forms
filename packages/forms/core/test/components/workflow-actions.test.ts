// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import FWorkflowActions from "../../src/components/workflow-actions/workflow-actions";
import type { IActor } from "../../src/models/actor";
import type { IAvailableTransition } from "../../src/models/workflow";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const officer: IActor = { id: "officer-1", name: "Officer One" };

const submit: IAvailableTransition = { id: "submit", transition: { from: ["draft"], mode: "editable", title: "Submit for review", to: "inReview" } };
const approve: IAvailableTransition = { id: "approve", transition: { from: ["inReview"], mode: "reviewable", title: "Approve", to: "approved" } };
const reject: IAvailableTransition = { id: "reject", transition: { from: ["inReview"], guards: ["hasOpenComments"], mode: "reviewable", title: "Reject", to: "rejected" } };
const resubmit: IAvailableTransition = { id: "submit", transition: { from: ["rejected"], guards: ["noOpenComments"], mode: "editable", title: "Submit for review", to: "inReview" } };

type Props = Parameters<typeof FWorkflowActions>[0];

const mounted: Array<() => void> = [];

function mount(props: Partial<Props> = {}) {
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    const onSelect = vi.fn();

    act(() => root.render(createElement(FWorkflowActions, { onSelect, openComments: 0, transitions: [submit], user: officer, ...props })));

    const unmount = (): void => { act(() => root.unmount()); container.remove(); };
    mounted.push(unmount);

    return {
        button: (id: string) => container.querySelector<HTMLButtonElement>(`#workflow-${id}-button`),
        buttons: () => Array.from(container.querySelectorAll("button")).map(button => button.textContent),
        click: (id: string) => act(() => container.querySelector<HTMLButtonElement>(`#workflow-${id}-button`)!.click()),
        onSelect,
        tooltip: (id: string) => container.querySelector<HTMLElement>(`#workflow-${id}-button`)!.closest("[data-bs-toggle=tooltip]")?.getAttribute("data-bs-original-title") ?? undefined,
        unmount
    };
}

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
});

describe("FWorkflowActions", () => {
    it("has one button for each transition, labeled by its title", () => {
        expect(mount({ transitions: [approve, reject] }).buttons()).toEqual(["Approve", "Reject"]);
    });

    it("has none when it is given none", () => {
        expect(mount({ transitions: [] }).buttons()).toEqual([]);
    });

    it("reports which transition was chosen, and by whom, when an enabled button is clicked", () => {
        const { click, onSelect } = mount({ transitions: [submit] });

        click("submit");

        expect(onSelect).toHaveBeenCalledWith(submit, officer);
    });

    describe("without a user", () => {
        it("disables every button, and says why", () => {
            const { button, tooltip } = mount({ user: undefined });

            expect(button("submit")!.disabled).toBe(true);
            expect(tooltip("submit")).toBe("Say who is using the report before making this change.");
        });

        it("reports nothing when a disabled button is clicked", () => {
            const { click, onSelect } = mount({ user: undefined });

            click("submit");

            expect(onSelect).not.toHaveBeenCalled();
        });
    });

    describe("a transition that needs an open comment", () => {
        it("is disabled until one is open, and says what to do", () => {
            const { button, tooltip } = mount({ openComments: 0, transitions: [approve, reject] });

            expect(button("reject")!.disabled).toBe(true);
            expect(tooltip("reject")).toBe("Add a comment first, so the author knows what to fix.");
            expect(button("approve")!.disabled).toBe(false);
        });

        it("is enabled once a comment is open", () => {
            expect(mount({ openComments: 1, transitions: [reject] }).button("reject")!.disabled).toBe(false);
        });
    });

    describe("a transition blocked while a comment is open", () => {
        it("is disabled while one is open, and says what to do", () => {
            const { button, tooltip } = mount({ openComments: 1, transitions: [resubmit] });

            expect(button("submit")!.disabled).toBe(true);
            expect(tooltip("submit")).toBe("Resolve every open comment before submitting again.");
        });

        it("is enabled once none are open", () => {
            expect(mount({ openComments: 0, transitions: [resubmit] }).button("submit")!.disabled).toBe(false);
        });
    });
});
