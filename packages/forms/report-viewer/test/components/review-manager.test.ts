import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ServicesContext } from "@common/react";
import { ControllerManager } from "@forms/core";
import type { FormMode, FormModel } from "@forms/core";
import { getReviewController } from "@forms/review";
import type { IReviewComment, ReviewTarget } from "@forms/review";
import type { IServiceCollection } from "@shrub/core";

import ReviewManager from "../../src/components/review/manager";
import type { IReportViewerDataManager } from "../../src/services/report-viewer";
import { IModalService } from "../../src/services/modal";
import { ReviewService } from "../../src/services/review";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const rivera = { id: "4471", name: "Sgt. Rivera" };
const report: ReviewTarget = { level: "form" };
const held: IReviewComment = { at: 1, author: { id: "9", name: "Lt. Osei" }, id: "held-1", isResolved: false, target: report, text: "Needs a narrative." };

const mounted: Array<() => void> = [];

interface IMountOptions {
    /** Comments the report viewer form has already loaded onto the controller when the manager mounts. */
    readonly comments?: ReadonlyArray<IReviewComment>;
    readonly dataManager?: Partial<IReportViewerDataManager<any>>;
    readonly mode?: FormMode;
}

/** Mounts the real manager, and the layer and panel it renders, over a form with no fields and against a real review service. */
function mount(options: IMountOptions = {}) {
    const { mode = "reviewable" } = options;
    const controllers = new ControllerManager();
    controllers.loadForm({
        id: "form-1",
        mode,
        getFieldPlacements: () => new Map(),
        getPages: () => [],
        getPagesFor: () => []
    } as unknown as FormModel<any>);

    // the report viewer form holds the user and the comments on the controller before this mounts
    controllers.setUser(rivera);
    const review = getReviewController(controllers);
    review.load(options.comments ?? []);

    const reviewService = new ReviewService();
    const showModal = vi.fn();
    const onError = vi.fn();
    const services = { get: (service: unknown) => service === IModalService ? { showModal } : reviewService } as unknown as IServiceCollection;
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);

    const render = (dataManager = options.dataManager): void => {
        act(() => root.render(createElement(ServicesContext.Provider, { value: services }, createElement(ReviewManager, { controllers, dataManager: dataManager as IReportViewerDataManager<any>, onError }))));
    };

    render();
    mounted.push(() => { act(() => root.unmount()); container.remove(); });

    return { container, controllers, onError, render, review, reviewService, showModal };
}

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
    document.body.innerHTML = "";
});

describe("ReviewManager", () => {
    describe("saving", () => {
        it("writes nothing until a comment changes, and does not write back what was loaded before it mounted", () => {
            const writeComments = vi.fn(async () => undefined);

            mount({ comments: [held], dataManager: { writeComments } });

            expect(writeComments).not.toHaveBeenCalled();
        });

        it("writes all the comments after each change", async () => {
            const writeComments = vi.fn(async () => undefined);
            const { review } = mount({ comments: [held], dataManager: { writeComments } });

            await act(async () => { review.add(report, "Wrong date."); });
            expect(writeComments).toHaveBeenLastCalledWith(review.comments);
            expect(review.comments).toHaveLength(2);

            await act(async () => { review.setResolved("held-1", true); });
            expect(writeComments).toHaveBeenCalledTimes(2);
            expect(writeComments).toHaveBeenLastCalledWith(review.comments);
        });

        it("works with no data manager, the comments lasting as long as the form is on screen", async () => {
            const { review } = mount();

            await act(async () => { review.add(report, "Needs a narrative."); });

            expect(review.comments).toHaveLength(1);
        });

        it("writes one at a time, following a change that lands mid-write with one write of the latest comments", async () => {
            const finishes: Array<() => void> = [];
            const writeComments = vi.fn((_comments: ReadonlyArray<IReviewComment>) => new Promise<void>(resolve => { finishes.push(resolve); }));
            const { review } = mount({ dataManager: { writeComments } });

            await act(async () => { review.add(report, "First."); });
            await act(async () => { review.add(report, "Second."); });
            await act(async () => { review.add(report, "Third."); });

            expect(writeComments).toHaveBeenCalledTimes(1);

            await act(async () => { finishes[0](); });

            expect(writeComments).toHaveBeenCalledTimes(2);
            expect(writeComments.mock.calls[1][0]).toHaveLength(3);

            await act(async () => { finishes[1](); });

            expect(writeComments).toHaveBeenCalledTimes(2);
        });

        it("reports comments that cannot be written, and goes on saving the next change", async () => {
            const writeComments = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValue(undefined);
            const { onError, review } = mount({ dataManager: { writeComments } });

            await act(async () => { review.add(report, "First."); });
            expect(onError).toHaveBeenCalledWith("The review comments could not be saved.");

            await act(async () => { review.add(report, "Second."); });
            expect(writeComments).toHaveBeenCalledTimes(2);
        });

        it("reads the data manager as it is now, not as it was when it mounted", async () => {
            const first = vi.fn(async () => undefined);
            const second = vi.fn(async () => undefined);
            const { render, review } = mount({ dataManager: { writeComments: first } });

            render({ writeComments: second });
            await act(async () => { review.add(report, "Wrong date."); });

            expect(first).not.toHaveBeenCalled();
            expect(second).toHaveBeenCalledTimes(1);
        });

        it("stops saving once it is unmounted", async () => {
            const writeComments = vi.fn(async () => undefined);
            const { review } = mount({ dataManager: { writeComments } });

            mounted.splice(0).forEach(unmount => unmount());
            review.add(report, "Wrong date.");

            expect(writeComments).not.toHaveBeenCalled();
        });
    });

    describe("the panel", () => {
        it("opens and closes each time it is toggled", () => {
            const { container, reviewService } = mount();

            expect(container.querySelector(".offcanvas")!.classList.contains("show")).toBe(false);

            act(() => reviewService.togglePanel());
            expect(container.querySelector(".offcanvas")!.classList.contains("show")).toBe(true);

            act(() => reviewService.togglePanel());
            expect(container.querySelector(".offcanvas")!.classList.contains("show")).toBe(false);
        });

        it("closes from its header", () => {
            const { container, reviewService } = mount();

            act(() => reviewService.togglePanel());
            act(() => container.querySelector<HTMLElement>(".btn-close")!.click());

            expect(container.querySelector(".offcanvas")!.classList.contains("show")).toBe(false);
        });

        it("opens the thread for the whole report through the modal service", () => {
            const { container, showModal } = mount();

            act(() => Array.from(container.querySelectorAll("button")).find(button => button.textContent === "Comment on the report")!.click());

            expect(showModal).toHaveBeenCalledWith(expect.objectContaining({ title: "Report" }));
        });
    });
});
