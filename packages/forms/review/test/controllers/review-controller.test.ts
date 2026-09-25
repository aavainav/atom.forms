import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { IControllerManager, ControllerActivity, FormModel } from "@forms/core";

import type { IReviewComment } from "../../src/models/review-comment";
import { firstName, lastName, osei, person, personPage, placement, report, review, rivera, vehicle } from "../fixtures/review-form";

const now = 1_700_000_000_000;

beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
});

afterEach(() => {
    vi.useRealTimers();
});

describe("ReviewController", () => {
    describe("canComment", () => {
        it.each([
            ["editable", false],
            ["reviewable", true],
            ["viewable", false]
        ] as const)("is decided by the form's mode while it is in review: %s is %s", (mode, expected) => {
            expect(review({ mode }).controller.canComment).toBe(expected);
        });

        it.each([
            ["draft", false],
            ["inProgress", false],
            ["inReview", true],
            ["rejected", false],
            ["approved", false]
        ] as const)("is decided by the form's status while it is reviewable: %s is %s", (status, expected) => {
            expect(review({ status }).controller.canComment).toBe(expected);
        });

        it("follows the report out of review", () => {
            const { controller, controllers } = review();

            controllers.getFormController().setForm({ ...controllers.getFormController().form, status: "rejected" } as FormModel<any>);

            expect(controller.canComment).toBe(false);
        });

        it("is false until a user has been set, even on a reviewable form in review", () => {
            const { controller, controllers } = review({ user: null });

            expect(controller.canComment).toBe(false);

            controllers.setUser(rivera);

            expect(controller.canComment).toBe(true);
        });
    });

    describe("canResolve", () => {
        it.each([
            ["editable", true],
            ["reviewable", true],
            ["viewable", false]
        ] as const)("is decided by the form's mode: %s is %s", (mode, expected) => {
            expect(review({ mode }).controller.canResolve).toBe(expected);
        });
    });

    describe("add", () => {
        it("stamps a comment with its author, the time and an id, and appends it", () => {
            const { controller, getChanges } = review();

            const comment = controller.add(firstName, "  Wrong date.  ");

            expect(comment).toMatchObject({ at: now, author: rivera, isResolved: false, target: firstName, text: "Wrong date." });
            expect(comment.id).toBeTruthy();
            expect(controller.comments).toEqual([comment]);
            expect(getChanges()).toBe(1);
        });

        it("keeps everything known about the user on the comment, not only their name", () => {
            const { author } = review().controller.add(firstName, "Wrong date.");

            expect(author).toEqual({ agency: "Riverside Police Department", badgeId: "4471", id: "4471", name: "Sgt. Rivera", rank: "Sergeant" });
        });

        it("refuses while the form is not reviewable", () => {
            expect(() => review({ mode: "editable" }).controller.add(firstName, "Wrong date."))
                .toThrowError("Comments can only be added while the form is reviewable and in review.");
        });

        it("refuses while the form is not in review", () => {
            expect(() => review({ status: "draft" }).controller.add(firstName, "Wrong date."))
                .toThrowError("Comments can only be added while the form is reviewable and in review.");
        });

        it("refuses until a user has been set", () => {
            expect(() => review({ user: null }).controller.add(firstName, "Wrong date."))
                .toThrowError("A user must be set before comments can be added.");
        });

        it("refuses a comment with no text", () => {
            expect(() => review().controller.add(firstName, "   ")).toThrowError("A comment needs some text.");
        });
    });

    describe("getComments", () => {
        it("gets the comments made on exactly the target, not those beneath it", () => {
            const { controller } = review();
            const onField = controller.add(firstName, "Field.");
            controller.add(person, "Section.");
            controller.add(report, "Report.");

            expect(controller.getComments(firstName)).toEqual([onField]);
            expect(controller.getComments(lastName)).toEqual([]);
        });
    });

    describe("setResolved", () => {
        it("marks a comment resolved, and open again, raising a change each time", () => {
            const { controller, getChanges } = review();
            const { id } = controller.add(firstName, "Wrong date.");

            controller.setResolved(id, true);

            expect(controller.comments[0].isResolved).toBe(true);
            expect(controller.openCount).toBe(0);

            controller.setResolved(id, false);

            expect(controller.openCount).toBe(1);
            expect(getChanges()).toBe(3);
        });

        it("does nothing for a comment it does not hold", () => {
            const { controller, getChanges } = review();

            controller.setResolved("missing", true);

            expect(getChanges()).toBe(0);
        });

        it("lets the officer resolve a comment while the form is editable", () => {
            const { controller } = review({ mode: "editable" });
            controller.load([{ at: 1, author: osei, id: "held-1", isResolved: false, target: firstName, text: "Wrong date." }]);

            controller.setResolved("held-1", true);

            expect(controller.openCount).toBe(0);
        });

        it("refuses while the form is viewable", () => {
            const { controller } = review({ mode: "viewable" });
            controller.load([{ at: 1, author: osei, id: "held-1", isResolved: false, target: firstName, text: "Wrong date." }]);

            expect(() => controller.setResolved("held-1", true)).toThrowError("Comments cannot be resolved or reopened while the form is viewable.");
            expect(controller.openCount).toBe(1);
        });
    });

    describe("activity", () => {
        function collect(controllers: IControllerManager): Array<ControllerActivity> {
            const reported: Array<ControllerActivity> = [];
            controllers.onActivity(args => {
                if (!("form" in args)) {
                    reported.push(args.activity);
                }
            });

            return reported;
        }

        it("reports a comment added, naming where", () => {
            const { controller, controllers } = review();
            const reported = collect(controllers);

            const { id } = controller.add(firstName, "Wrong date.");

            expect(reported).toEqual([{ kind: "comment-added", commentId: id, target: "Person > Person details > First name" }]);
        });

        it("reports a comment resolved, and then reopened", () => {
            const { controller, controllers } = review();
            const { id } = controller.add(person, "Section.");
            const reported = collect(controllers);

            controller.setResolved(id, true);
            controller.setResolved(id, false);

            expect(reported).toEqual([
                { kind: "comment-resolved", commentId: id, target: "Person > Person details" },
                { kind: "comment-reopened", commentId: id, target: "Person > Person details" }
            ]);
        });

        it("reports nothing when a comment is already as asked", () => {
            const { controller, controllers } = review();
            const { id } = controller.add(firstName, "Wrong date.");
            const reported = collect(controllers);

            controller.setResolved(id, false);

            expect(reported).toEqual([]);
        });

        it("reports nothing for a comment it does not hold", () => {
            const { controller, controllers } = review();
            const reported = collect(controllers);

            controller.setResolved("missing", true);

            expect(reported).toEqual([]);
        });

        it("reports nothing when the host loads its comments", () => {
            const { controller, controllers } = review();
            const reported = collect(controllers);

            controller.load([{ at: 1, author: osei, id: "held-1", isResolved: false, target: firstName, text: "Wrong date." }]);

            expect(reported).toEqual([]);
        });
    });

    describe("getFieldComments", () => {
        it("gets the comments made on the field a control draws, and no others", () => {
            const { controller } = review();
            const onField = controller.add(firstName, "Field.");
            controller.add(lastName, "Another field.");
            controller.add(person, "Section.");

            expect(controller.getFieldComments("field-1")).toEqual([onField]);
        });

        it("gets nothing for an id no field carries", () => {
            expect(review().controller.getFieldComments("missing")).toEqual([]);
        });
    });

    describe("getFieldIds", () => {
        it("gets the ids of a page's fields, in the order the form defines them", () => {
            expect(review().controller.getFieldIds("page-1")).toEqual(["field-1", "field-2", "field-3"]);
        });

        it("leaves out the fields on other pages", () => {
            const { controller } = review({
                placements: new Map([
                    ["field-1", placement("first-name")],
                    ["field-2", placement("first-name", { pageId: "page-2", pageOrdinal: 1 })]
                ])
            });

            expect(controller.getFieldIds("page-2")).toEqual(["field-2"]);
        });

        it("gets nothing for a page the form does not hold", () => {
            expect(review().controller.getFieldIds("page-9")).toEqual([]);
        });
    });

    describe("describeTarget", () => {
        it("names the whole form the report", () => {
            expect(review().controller.describeTarget(report)).toBe("Report");
        });

        it("names a page, a section or a field by the titles the form gives them, outermost first", () => {
            const { controller } = review();

            expect(controller.describeTarget(personPage)).toBe("Person");
            expect(controller.describeTarget(person)).toBe("Person > Person details");
            expect(controller.describeTarget(firstName)).toBe("Person > Person details > First name");
        });

        it("says which of a repeating page's pages a target is on", () => {
            const { controller } = review({
                pageCount: 2,
                placements: new Map([["field-1", placement("first-name", { pageId: "page-2", pageOrdinal: 1 })]])
            });

            expect(controller.describeTarget({ level: "page", page: "person-page", pageOrdinal: 1 })).toBe("Person 2");
            expect(controller.describeTarget({ field: "first-name", level: "field", page: "person-page", pageOrdinal: 1, section: "person" }))
                .toBe("Person 2 > Person details > First name");
        });

        it("does not number a shared section, which is the same on every page", () => {
            const { controller } = review({
                pageCount: 2,
                placements: new Map([["field-1", placement("first-name", { isShared: true })]])
            });

            expect(controller.describeTarget(firstName)).toBe("Person > Person details > First name");
        });

        it("falls back to the names a comment was made with when its definitions have gone", () => {
            const { controller } = review();

            expect(controller.describeTarget({ field: "gone", level: "field", page: "person-page", pageOrdinal: 0, section: "person" })).toBe("person-page > person > gone");
            expect(controller.describeTarget({ level: "page", page: "removed-page", pageOrdinal: 0 })).toBe("removed-page");
        });
    });

    describe("load", () => {
        it("replaces the comments with the host's, and raises a change", () => {
            const { controller, getChanges } = review();
            const held: IReviewComment = { at: 1, author: osei, id: "held-1", isResolved: true, target: report, text: "Approved once fixed." };

            controller.add(firstName, "Wrong date.");
            controller.load([held]);

            expect(controller.comments).toEqual([held]);
            expect(controller.openCount).toBe(0);
            expect(getChanges()).toBe(2);
        });
    });

    describe("locateField", () => {
        it("gets the field target for a field's id", () => {
            expect(review().controller.locateField("field-2")).toEqual(lastName);
        });

        it("answers undefined for an id no field carries", () => {
            expect(review().controller.locateField("missing")).toBeUndefined();
        });

        it("walks the form once for repeated lookups, and again only when a page is added", () => {
            const { controller, getFieldPlacements, pageIds } = review();

            controller.locateField("field-1");
            controller.locateField("field-2");

            expect(getFieldPlacements).toHaveBeenCalledTimes(1);

            pageIds.push("page-2");
            controller.locateField("field-1");

            expect(getFieldPlacements).toHaveBeenCalledTimes(2);
        });
    });

    describe("getNavigationTarget", () => {
        it("finds the page and field a field's comment is about", () => {
            expect(review().controller.getNavigationTarget(lastName)).toEqual({ fieldId: "field-2", pageId: "page-1" });
        });

        it("sends a section or a page to its first field", () => {
            const { controller } = review();

            expect(controller.getNavigationTarget(vehicle)).toEqual({ fieldId: "field-3", pageId: "page-1" });
            expect(controller.getNavigationTarget(personPage)).toEqual({ fieldId: "field-1", pageId: "page-1" });
        });

        it("has nowhere to send the whole form", () => {
            expect(review().controller.getNavigationTarget(report)).toBeUndefined();
        });

        it("has nowhere to send a comment whose page has since been removed", () => {
            expect(review().controller.getNavigationTarget({ level: "page", page: "person-page", pageOrdinal: 3 })).toBeUndefined();
        });
    });

    describe("dispose", () => {
        it("lets go of the comments", () => {
            const { controller } = review();
            controller.add(firstName, "Wrong date.");

            controller.dispose();

            expect(controller.comments).toEqual([]);
        });
    });
});
