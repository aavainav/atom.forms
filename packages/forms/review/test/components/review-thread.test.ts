import { act, createElement } from "react";
import { afterEach, describe, expect, it } from "vitest";
import type { FormModel } from "@forms/core";

import { ReviewThread } from "../../src/components/review-thread";
import type { IReviewComment } from "../../src/models/review-comment";
import { firstName, lastName, osei, review } from "../fixtures/review-form";
import type { IReviewOptions } from "../fixtures/review-form";
import { click, findButton, mount, type, unmountAll } from "../fixtures/mount";

afterEach(unmountAll);

const held: IReviewComment = { at: 1_700_000_000_000, author: osei, id: "held-1", isResolved: false, target: firstName, text: "Wrong date." };

/** Mounts the thread on the first name field, with the comments already held; they are loaded rather than added, which an editable form refuses. */
function thread(options: IReviewOptions = {}, comments: ReadonlyArray<IReviewComment> = []) {
    const reviewed = review(options);
    reviewed.controller.load(comments);

    return { ...reviewed, container: mount(createElement(ReviewThread, { controllers: reviewed.controllers, target: firstName })) };
}

describe("ReviewThread", () => {
    it("says so when there are no comments yet", () => {
        expect(thread().container.textContent).toContain("No comments yet.");
    });

    it("shows the comments on its target, and only those", () => {
        const { container } = thread({}, [held, { ...held, id: "held-2", target: lastName, text: "Wrong plate." }]);

        expect(container.textContent).toContain("Wrong date.");
        expect(container.textContent).toContain("Lt. Osei");
        expect(container.textContent).not.toContain("Wrong plate.");
        expect(container.textContent).not.toContain("No comments yet.");
    });

    describe("while the form is reviewable and in review", () => {
        it("adds a comment from the text typed, and clears the text", () => {
            const { container, controller } = thread();

            type(container.querySelector("textarea"), "Wrong date.");
            click(findButton(container, "Comment"));

            expect(controller.getComments(firstName).map(comment => comment.text)).toEqual(["Wrong date."]);
            expect(container.textContent).toContain("Wrong date.");
            expect(container.querySelector("textarea")!.value).toBe("");
        });

        it("will not add a comment with no text", () => {
            const { container } = thread();

            expect(findButton(container, "Comment")!.disabled).toBe(true);

            type(container.querySelector("textarea"), "   ");

            expect(findButton(container, "Comment")!.disabled).toBe(true);
        });
    });

    describe("while the form is not in review", () => {
        it("offers no way to add a comment", () => {
            const { container } = thread({ status: "rejected" });

            expect(container.querySelector("textarea")).toBeNull();
            expect(findButton(container, "Comment")).toBeUndefined();
        });

        it("stops offering one once the report leaves review", () => {
            const { container, controllers } = thread();

            expect(container.querySelector("textarea")).not.toBeNull();

            act(() => controllers.getFormController().setForm({ ...controllers.getFormController().form, status: "approved" } as FormModel<any>));

            expect(container.querySelector("textarea")).toBeNull();
        });
    });

    describe("while the form is editable", () => {
        it("offers no way to add a comment", () => {
            const { container } = thread({ mode: "editable" });

            expect(container.querySelector("textarea")).toBeNull();
            expect(findButton(container, "Comment")).toBeUndefined();
        });

        it("lets the officer resolve a comment, and reopen it", () => {
            const { container, controller } = thread({ mode: "editable" }, [held]);

            click(findButton(container, "Resolve"));

            expect(controller.openCount).toBe(0);
            expect(container.textContent).toContain("Resolved");

            click(findButton(container, "Reopen"));

            expect(controller.openCount).toBe(1);
        });
    });

    describe("while the form is viewable", () => {
        it("offers neither adding nor resolving", () => {
            const { container } = thread({ mode: "viewable" }, [held]);

            expect(container.textContent).toContain("Wrong date.");
            expect(container.querySelector("textarea")).toBeNull();
            expect(findButton(container, "Resolve")).toBeUndefined();
        });
    });
});
