import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ReviewEntry } from "../../src/components/review-entry";
import type { IReviewComment } from "../../src/models/review-comment";
import { firstName, osei, report, review } from "../fixtures/review-form";
import type { IReviewOptions } from "../fixtures/review-form";
import { click, findButton, mount, unmountAll } from "../fixtures/mount";

afterEach(unmountAll);

const held: IReviewComment = { at: 1_700_000_000_000, author: osei, id: "held-1", isResolved: false, target: firstName, text: "Wrong date." };

/** Mounts an entry for the comment, which the controller holds so that resolving it has something to act on. */
function entry(comment: IReviewComment = held, options: IReviewOptions = {}) {
    const reviewed = review(options);
    const onNavigate = vi.fn();
    reviewed.controller.load([comment]);

    return { ...reviewed, container: mount(createElement(ReviewEntry, { comment, controllers: reviewed.controllers, onNavigate })), onNavigate };
}

describe("ReviewEntry", () => {
    it("shows the comment, who made it, and where in the form it was made", () => {
        const { container } = entry();

        expect(container.textContent).toContain("Wrong date.");
        expect(container.textContent).toContain("Lt. Osei");
        expect(container.textContent).toContain("Person > Person details > First name");
    });

    it("takes the user to what the comment is about, and says it has", () => {
        const { container, controllers, onNavigate } = entry();

        click(findButton(container, "Person > Person details > First name"));

        expect(controllers.getNavigationController().target).toEqual({ fieldId: "field-1", pageId: "page-1" });
        expect(onNavigate).toHaveBeenCalledTimes(1);
    });

    it("offers nowhere to go for a comment on the whole report", () => {
        const { container } = entry({ ...held, target: report });

        expect(findButton(container, "Report")).toBeUndefined();
        expect(container.textContent).toContain("Report");
    });

    it("offers nowhere to go for a comment whose page has since gone", () => {
        const { container, onNavigate } = entry({ ...held, target: { level: "page", page: "person-page", pageOrdinal: 4 } });

        expect(container.querySelectorAll("button")).toHaveLength(1);
        expect(onNavigate).not.toHaveBeenCalled();
    });

    it("resolves an open comment", () => {
        const { container, controller } = entry();

        click(findButton(container, "Resolve"));

        expect(controller.openCount).toBe(0);
    });

    it("marks a resolved comment, and reopens it", () => {
        const { container, controller } = entry({ ...held, isResolved: true });

        expect(container.textContent).toContain("Resolved");

        click(findButton(container, "Reopen"));

        expect(controller.openCount).toBe(1);
    });

    it("offers no way to resolve a comment while the form is viewable", () => {
        const { container } = entry(held, { mode: "viewable" });

        expect(findButton(container, "Resolve")).toBeUndefined();
    });
});
