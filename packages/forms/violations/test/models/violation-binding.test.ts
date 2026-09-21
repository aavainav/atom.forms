import { describe, expect, it } from "vitest";

import { isViolationsClosed } from "../../src/models/violation-binding";
import { createBinding, createStubForm } from "../fixtures/stub-form";

describe("isViolationsClosed", () => {
    const binding = createBinding();

    it("is false for an editable form that has locked nothing", () => {
        expect(isViolationsClosed(createStubForm(), binding)).toBe(false);
    });

    it("is true once the form is no longer editable, whatever it has locked", () => {
        expect(isViolationsClosed(createStubForm({ mode: "reviewable" }), binding)).toBe(true);
        expect(isViolationsClosed(createStubForm({ mode: "viewable" }), binding)).toBe(true);
    });

    it("is true while the form has locked the pages a violation lands on, though it is still editable", () => {
        expect(isViolationsClosed(createStubForm({ lockedPageSets: ["citation"] }), binding)).toBe(true);
    });

    it("is false while the form has locked only some other set of pages", () => {
        expect(isViolationsClosed(createStubForm({ lockedPageSets: ["notice"] }), binding)).toBe(false);
    });

    it("follows the page the binding names, not a fixed one", () => {
        expect(isViolationsClosed(createStubForm({ lockedPageSets: ["notice"] }), { ...binding, pageName: "notice" })).toBe(true);
    });

    it("is false for a binding that names a page the form does not have", () => {
        expect(isViolationsClosed(createStubForm({ lockedPageSets: ["citation", "notice"] }), { ...binding, pageName: "missing" })).toBe(false);
    });
});
