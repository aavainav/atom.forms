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

const report: ReviewTarget = { level: "form" };
const held: IReviewComment = { at: 1, author: "Lt. Osei", id: "held-1", isResolved: false, target: report, text: "Needs a narrative." };

const mounted: Array<() => void> = [];

interface IMountOptions {
    readonly dataManager?: Partial<IReportViewerDataManager<any>>;
    readonly mode?: FormMode;
    readonly reviewer?: string;
}

/** Mounts the real manager, and the layer and panel it renders, over a form with no fields and against a real review service. */
function mount(options: IMountOptions = {}) {
    const { mode = "reviewable", reviewer = "Sgt. Rivera" } = options;
    const controllers = new ControllerManager();
    controllers.loadForm({
        id: "form-1",
        mode,
        getFieldPlacements: () => new Map(),
        getPages: () => [],
        getPagesFor: () => []
    } as unknown as FormModel<any>);

    const review = getReviewController(controllers);
    const reviewService = new ReviewService();
    const showModal = vi.fn();
    const onError = vi.fn();
    const services = { get: (service: unknown) => service === IModalService ? { showModal } : reviewService } as unknown as IServiceCollection;
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);

    const render = (dataManager = options.dataManager): void => {
        act(() => root.render(createElement(ServicesContext.Provider, { value: services }, createElement(ReviewManager, { controllers, dataManager: dataManager as IReportViewerDataManager<any>, reviewer, onError }))));
    };

    render();
    mounted.push(() => { act(() => root.unmount()); container.remove(); });

    return { container, controllers, onError, render, review, reviewService, showModal };
}

/** Lets the manager's read, and whatever it starts once that is done, run to completion. */
async function settle(): Promise<void> {
    await act(async () => { await Promise.resolve(); });
}

afterEach(() => {
    mounted.splice(0).forEach(unmount => unmount());
    document.body.innerHTML = "";
});

describe("ReviewManager", () => {
    describe("loading", () => {
        it("loads the comments the data manager holds", async () => {
            const { review } = mount({ dataManager: { readComments: async () => [held] } });

            await settle();

            expect(review.comments).toEqual([held]);
        });

        it("reads them once, even when the host hands over a new data manager each time it renders", async () => {
            const readComments = vi.fn(async () => [held]);
            const { render } = mount({ dataManager: { readComments } });

            await settle();
            render({ readComments: vi.fn(async () => []) });
            await settle();

            expect(readComments).toHaveBeenCalledTimes(1);
        });

        it("works with no data manager, the comments lasting as long as the form is on screen", async () => {
            const { review } = mount();

            await settle();
            await act(async () => { review.add(report, "Needs a narrative."); });

            expect(review.comments).toHaveLength(1);
        });

        it("reports comments that cannot be read", async () => {
            const { onError } = mount({ dataManager: { readComments: async () => { throw new Error("offline"); } } });

            await settle();

            expect(onError).toHaveBeenCalledWith("The review comments could not be loaded.");
        });
    });

    describe("saving", () => {
        it("does not write back the comments it has just loaded", async () => {
            const writeComments = vi.fn(async () => undefined);
            mount({ dataManager: { readComments: async () => [held], writeComments } });

            await settle();

            expect(writeComments).not.toHaveBeenCalled();
        });

        it("writes the comments after each change", async () => {
            const writeComments = vi.fn(async () => undefined);
            const { review } = mount({ dataManager: { readComments: async () => [held], writeComments } });
            await settle();

            await act(async () => { review.add(report, "Wrong date."); });
            expect(writeComments).toHaveBeenLastCalledWith(review.comments);
            expect(review.comments).toHaveLength(2);

            await act(async () => { review.setResolved("held-1", true); });
            expect(writeComments).toHaveBeenCalledTimes(2);
            expect(writeComments).toHaveBeenLastCalledWith(review.comments);
        });

        it("saves even when the data manager holds no comments to read", async () => {
            const writeComments = vi.fn(async () => undefined);
            const { review } = mount({ dataManager: { writeComments } });
            await settle();

            await act(async () => { review.add(report, "Wrong date."); });

            expect(writeComments).toHaveBeenCalledTimes(1);
        });

        it("writes one at a time, following a change that lands mid-write with one write of the latest comments", async () => {
            const finishes: Array<() => void> = [];
            const writeComments = vi.fn((_comments: ReadonlyArray<IReviewComment>) => new Promise<void>(resolve => { finishes.push(resolve); }));
            const { review } = mount({ dataManager: { writeComments } });
            await settle();

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
            await settle();

            await act(async () => { review.add(report, "First."); });
            expect(onError).toHaveBeenCalledWith("The review comments could not be saved.");

            await act(async () => { review.add(report, "Second."); });
            expect(writeComments).toHaveBeenCalledTimes(2);
        });

        it("stops saving once it is unmounted", async () => {
            const writeComments = vi.fn(async () => undefined);
            const { review } = mount({ dataManager: { writeComments } });
            await settle();

            mounted.splice(0).forEach(unmount => unmount());
            review.add(report, "Wrong date.");

            expect(writeComments).not.toHaveBeenCalled();
        });
    });

    describe("the reviewer", () => {
        it("attributes comments to the reviewer it is given", async () => {
            const { review } = mount({ reviewer: "Sgt. Rivera" });
            await settle();

            expect(review.canComment).toBe(true);
            expect(review.add(report, "Wrong date.").author).toBe("Sgt. Rivera");
        });

        it("leaves a form with no reviewer unable to take comments", async () => {
            const { review } = mount({ reviewer: "" });
            await settle();

            expect(review.canComment).toBe(false);
        });
    });

    describe("the panel", () => {
        it("opens and closes each time it is toggled", async () => {
            const { container, reviewService } = mount();
            await settle();

            expect(container.querySelector(".offcanvas")!.classList.contains("show")).toBe(false);

            act(() => reviewService.togglePanel());
            expect(container.querySelector(".offcanvas")!.classList.contains("show")).toBe(true);

            act(() => reviewService.togglePanel());
            expect(container.querySelector(".offcanvas")!.classList.contains("show")).toBe(false);
        });

        it("closes from its header", async () => {
            const { container, reviewService } = mount();
            await settle();

            act(() => reviewService.togglePanel());
            act(() => container.querySelector<HTMLElement>(".btn-close")!.click());

            expect(container.querySelector(".offcanvas")!.classList.contains("show")).toBe(false);
        });

        it("opens the thread for the whole report through the modal service", async () => {
            const { container, showModal } = mount();
            await settle();

            act(() => Array.from(container.querySelectorAll("button")).find(button => button.textContent === "Comment on the report")!.click());

            expect(showModal).toHaveBeenCalledWith(expect.objectContaining({ title: "Report" }));
        });
    });
});
