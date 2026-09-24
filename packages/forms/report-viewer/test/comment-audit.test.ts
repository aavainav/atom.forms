import { describe, expect, it } from "vitest";
import { getAuditController } from "@forms/audit";
import { IActor, ControllerManager, FormDefinition, FormModel } from "@forms/core";
import { getReviewController } from "@forms/review";

const reviewer: IActor = { id: "reviewer-1", name: "Reviewer One" };

class CommentStubForm extends FormModel<any> { }

// registers the form's definition once, at module scope -- Entity.set validates by reference identity
new FormDefinition("comment-stub-form", CommentStubForm, {});

async function mount() {
    const controllers = new ControllerManager();
    controllers.loadForm((await new CommentStubForm().initialize()).setMode("reviewable"));

    const audit = getAuditController(controllers);
    const review = getReviewController(controllers);
    audit.setUser(reviewer);
    review.setUser(reviewer);

    return { audit, review };
}

describe("comments in the audit", () => {
    it("records a comment added, resolved and reopened, as the reviewer", async () => {
        const { audit, review } = await mount();

        const { id } = review.add({ level: "form" }, "Needs a narrative.");
        review.setResolved(id, true);
        review.setResolved(id, false);

        expect(audit.session.map(record => record.kind)).toEqual(["form-opened", "comment-added", "comment-resolved", "comment-reopened"]);
        expect(audit.session[1]).toMatchObject({ by: reviewer, commentId: id, target: "Report" });
    });

    it("does not record the comments a host loads", async () => {
        const { audit, review } = await mount();

        review.load([{ at: 1, author: reviewer, id: "held-1", isResolved: false, target: { level: "form" }, text: "Held." }]);

        expect(audit.session.map(record => record.kind)).toEqual(["form-opened"]);
    });
});
