import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import FComment from "../../src/components/comment/comment";
import FCommentMarker from "../../src/components/comment-marker/comment-marker";

const noop = (): void => undefined;

describe("FCommentMarker", () => {
    it("invites a first comment when it stands for none", () => {
        const markup = renderToStaticMarkup(createElement(FCommentMarker, { count: 0, label: "Add a comment", onClick: noop }));

        expect(markup).toContain("f-comment-marker--empty");
        expect(markup).toContain("bi-chat-left-text");
        expect(markup).toContain('aria-label="Add a comment"');
    });

    it("shows how many comments it stands for, drawing attention while any is open", () => {
        const markup = renderToStaticMarkup(createElement(FCommentMarker, { count: 3, hasOpen: true, label: "3 comments", onClick: noop }));

        expect(markup).toContain(">3<");
        expect(markup).toContain("f-comment-marker--commented");
        expect(markup).toContain("f-comment-marker--open");
        expect(markup).not.toContain("f-comment-marker--empty");
    });

    it("does not draw attention once every comment is resolved", () => {
        const markup = renderToStaticMarkup(createElement(FCommentMarker, { count: 3, label: "3 comments, all resolved", onClick: noop }));

        expect(markup).toContain("f-comment-marker--commented");
        expect(markup).not.toContain("f-comment-marker--open");
    });

    it("is a button that does not submit a form it happens to sit in", () => {
        expect(renderToStaticMarkup(createElement(FCommentMarker, { count: 1, label: "1 comment", onClick: noop }))).toContain('type="button"');
    });
});

describe("FComment", () => {
    const at = Date.UTC(2026, 8, 20, 12, 0, 0);

    it("shows who made the comment, when, and what it says", () => {
        const markup = renderToStaticMarkup(createElement(FComment, { at, author: "Sgt. Rivera", text: "Wrong date." }));

        expect(markup).toContain("Sgt. Rivera");
        expect(markup).toContain('dateTime="2026-09-20T12:00:00.000Z"');
        expect(markup).toContain("Wrong date.");
        expect(markup).not.toContain("f-comment--resolved");
        expect(markup).not.toContain("f-comment-actions");
    });

    it("marks a resolved comment", () => {
        const markup = renderToStaticMarkup(createElement(FComment, { at, author: "Sgt. Rivera", isResolved: true, text: "Wrong date." }));

        expect(markup).toContain("f-comment--resolved");
        expect(markup).toContain("Resolved");
    });

    it("shows what can be done with the comment as its actions", () => {
        const markup = renderToStaticMarkup(createElement(FComment, { at, author: "Sgt. Rivera", text: "Wrong date." }, createElement("button", undefined, "Resolve")));

        expect(markup).toContain('<div class="f-comment-actions"><button>Resolve</button></div>');
    });

    it("leaves room below itself, unless told otherwise", () => {
        expect(renderToStaticMarkup(createElement(FComment, { at, author: "Sgt. Rivera", text: "Wrong date." }))).toContain("margin-bottom:16px");
        expect(renderToStaticMarkup(createElement(FComment, { at, author: "Sgt. Rivera", margin: { bottom: 0 }, text: "Wrong date." }))).toContain("margin-bottom:0");
    });
});
