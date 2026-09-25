import { act, createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { FormModel } from "@forms/core";

import { ReviewLayer } from "../../src/components/review-layer";
import { ReviewThread } from "../../src/components/review-thread";
import type { IReviewComment } from "../../src/models/review-comment";
import { firstName, osei, placement, review } from "../fixtures/review-form";
import type { IReviewOptions } from "../fixtures/review-form";
import { click, mount, unmountAll } from "../fixtures/mount";

afterEach(unmountAll);

const held: IReviewComment = { at: 1_700_000_000_000, author: osei, id: "held-1", isResolved: false, target: firstName, text: "Wrong date." };

/** Puts a control for each field id in the document, as the page collection does for the fields on the page showing. */
function drawControls(...fieldIds: string[]): void {
    for (const fieldId of fieldIds) {
        const control = document.createElement("div");
        control.dataset.fieldId = fieldId;
        document.body.append(control);
    }
}

function control(fieldId: string): Element {
    return document.querySelector(`[data-field-id="${fieldId}"]`)!;
}

function markers(): Array<Element> {
    return Array.from(document.querySelectorAll(".f-comment-marker"));
}

/** Mounts the layer over a form showing page 1, with the comments already held. */
function layer(options: IReviewOptions = {}, comments: ReadonlyArray<IReviewComment> = []) {
    const reviewed = review(options);
    const showModal = vi.fn();
    reviewed.controller.load(comments);
    reviewed.controllers.getNavigationController().setActivePage("page-1");

    mount(createElement(ReviewLayer, { controllers: reviewed.controllers, showModal }));

    return { ...reviewed, showModal };
}

describe("ReviewLayer", () => {
    it("puts a marker in the control of every field on the page showing, for a reviewer to comment with", () => {
        drawControls("field-1", "field-2", "field-3");

        layer();

        expect(control("field-1").querySelectorAll(".f-comment-marker--empty")).toHaveLength(1);
        expect(control("field-2").querySelectorAll(".f-comment-marker--empty")).toHaveLength(1);
        expect(control("field-3").querySelectorAll(".f-comment-marker--empty")).toHaveLength(1);
        expect(control("field-1").querySelector(".f-comment-marker")!.getAttribute("aria-label")).toBe("Add a comment");
    });

    it("draws nothing until a page is showing", () => {
        drawControls("field-1");
        const reviewed = review();

        mount(createElement(ReviewLayer, { controllers: reviewed.controllers, showModal: vi.fn() }));

        expect(markers()).toHaveLength(0);
    });

    it("marks only the fields on the page showing", () => {
        drawControls("field-1", "field-2");

        layer({ placements: new Map([["field-1", placement("first-name")], ["field-2", placement("first-name", { pageId: "page-2", pageOrdinal: 1 })]]) });

        expect(markers()).toHaveLength(1);
        expect(control("field-1").querySelector(".f-comment-marker")).not.toBeNull();
    });

    it("follows the page showing", () => {
        drawControls("field-1", "field-2");

        const { controllers } = layer({ placements: new Map([["field-1", placement("first-name")], ["field-2", placement("first-name", { pageId: "page-2", pageOrdinal: 1 })]]) });

        act(() => controllers.getNavigationController().setActivePage("page-2"));

        expect(markers()).toHaveLength(1);
        expect(control("field-2").querySelector(".f-comment-marker")).not.toBeNull();
    });

    it("skips a field whose control is not in the document", () => {
        drawControls("field-1", "field-3");

        layer();

        expect(markers()).toHaveLength(2);
    });

    it("shows how many comments a field has, and whether any is still open", () => {
        drawControls("field-1", "field-2");

        const { controller } = layer({}, [held, { ...held, id: "held-2", text: "Missing plate." }]);
        const marker = control("field-1").querySelector(".f-comment-marker")!;

        expect(marker.textContent).toBe("2");
        expect(marker.classList.contains("f-comment-marker--open")).toBe(true);
        expect(marker.getAttribute("aria-label")).toBe("2 comments");

        act(() => { controller.setResolved("held-1", true); controller.setResolved("held-2", true); });

        expect(marker.classList.contains("f-comment-marker--open")).toBe(false);
        expect(marker.getAttribute("aria-label")).toBe("2 comments, all resolved");
    });

    it("marks only the fields that have comments when nobody can add one", () => {
        drawControls("field-1", "field-2");

        layer({ mode: "editable" }, [held]);

        expect(markers()).toHaveLength(1);
        expect(control("field-1").querySelector(".f-comment-marker")).not.toBeNull();
    });

    it("marks only the fields that have comments when the report is not in review", () => {
        drawControls("field-1", "field-2");

        layer({ status: "rejected" }, [held]);

        expect(markers()).toHaveLength(1);
        expect(control("field-1").querySelector(".f-comment-marker")).not.toBeNull();
    });

    it("stops inviting a comment on a field once the report leaves review", () => {
        drawControls("field-1", "field-2");

        const { controllers } = layer({}, [held]);

        expect(markers()).toHaveLength(2);

        act(() => controllers.getFormController().setForm({ ...controllers.getFormController().form, status: "rejected" } as FormModel<any>));

        expect(markers()).toHaveLength(1);
        expect(control("field-1").querySelector(".f-comment-marker")).not.toBeNull();
    });

    it("draws a marker for a comment as soon as one is added", () => {
        drawControls("field-1");

        const { controller } = layer();

        act(() => { controller.add(firstName, "Wrong date."); });

        expect(control("field-1").querySelector(".f-comment-marker")!.textContent).toBe("1");
    });

    it("opens the thread for the field when its marker is clicked", () => {
        drawControls("field-1");

        const { controllers, showModal } = layer();

        click(control("field-1").querySelector<HTMLElement>(".f-comment-marker")!);

        expect(showModal).toHaveBeenCalledWith(expect.objectContaining({
            title: "Person > Person details > First name",
            content: ReviewThread,
            contentProps: { controllers, target: firstName }
        }));
    });

    it("draws nothing while the form is printing", () => {
        drawControls("field-1");

        const { controllers } = layer();

        act(() => controllers.getPrintController().begin({ layout: "top-down" }));

        expect(markers()).toHaveLength(0);

        act(() => controllers.getPrintController().end());

        expect(markers()).toHaveLength(1);
    });
});
