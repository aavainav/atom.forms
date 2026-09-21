import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ReviewPanel } from "../../src/components/review-panel";
import { ReviewThread } from "../../src/components/review-thread";
import type { IReviewComment } from "../../src/models/review-comment";
import { firstName, report, review } from "../fixtures/review-form";
import type { IReviewOptions } from "../fixtures/review-form";
import { click, findButton, mount, unmountAll } from "../fixtures/mount";

afterEach(unmountAll);

const held: IReviewComment = { at: 1_700_000_000_000, author: "Lt. Osei", id: "held-1", isResolved: false, target: firstName, text: "Wrong date." };

/** Mounts the panel open, with the comments already held. */
function panel(options: IReviewOptions = {}, comments: ReadonlyArray<IReviewComment> = [], isOpen = true) {
    const reviewed = review(options);
    const onClose = vi.fn();
    const showModal = vi.fn();
    reviewed.controller.load(comments);

    return { ...reviewed, container: mount(createElement(ReviewPanel, { controllers: reviewed.controllers, isOpen, onClose, showModal })), onClose, showModal };
}

describe("ReviewPanel", () => {
    it("shows the panel only while it is open", () => {
        expect(panel({}, [], true).container.querySelector(".offcanvas")!.classList.contains("show")).toBe(true);

        unmountAll();

        expect(panel({}, [], false).container.querySelector(".offcanvas")!.classList.contains("show")).toBe(false);
    });

    it("says so when there are no comments yet", () => {
        expect(panel().container.textContent).toContain("No comments yet.");
    });

    it("closes from its header", () => {
        const { container, onClose } = panel();

        click(container.querySelector<HTMLElement>(".btn-close")!);

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("lists every comment with where in the form it was made, the open ones first", () => {
        const { container } = panel({}, [
            { ...held, id: "held-1", isResolved: true, text: "Done already." },
            { ...held, id: "held-2", text: "Wrong date." },
            { ...held, id: "held-3", target: report, text: "Needs a narrative." }
        ]);

        const text = container.textContent!;

        expect(text).toContain("Person > Person details > First name");
        expect(text).toContain("Report");
        expect(text.indexOf("Wrong date.")).toBeLessThan(text.indexOf("Done already."));
        expect(text.indexOf("Needs a narrative.")).toBeLessThan(text.indexOf("Done already."));
        expect(text.indexOf("Wrong date.")).toBeLessThan(text.indexOf("Needs a narrative."));
    });

    it("takes the user to what a comment is about, and closes", () => {
        const { container, controllers, onClose } = panel({}, [held]);

        click(findButton(container, "Person > Person details > First name"));

        expect(controllers.getNavigationController().target).toEqual({ fieldId: "field-1", pageId: "page-1" });
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("offers nowhere to go for a comment on the whole report", () => {
        const { container } = panel({}, [{ ...held, target: report }]);

        expect(findButton(container, "Report")).toBeUndefined();
        expect(container.textContent).toContain("Report");
    });

    it("resolves a comment from the list", () => {
        const { container, controller } = panel({}, [held]);

        click(findButton(container, "Resolve"));

        expect(controller.openCount).toBe(0);
        expect(container.textContent).toContain("Resolved");
    });

    it("lets a reviewer comment on the report as a whole", () => {
        const { container, controllers, showModal } = panel();

        click(findButton(container, "Comment on the report"));

        expect(showModal).toHaveBeenCalledWith(expect.objectContaining({
            title: "Report",
            content: ReviewThread,
            contentProps: { controllers, target: report }
        }));
    });

    it("offers no comment on the report while the form is not reviewable", () => {
        expect(findButton(panel({ mode: "editable" }).container, "Comment on the report")).toBeUndefined();
    });
});
