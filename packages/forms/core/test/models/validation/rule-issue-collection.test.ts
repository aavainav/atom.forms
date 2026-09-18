import { describe, expect, it } from "vitest";

import type { IRuleIssue } from "../../../src/models/validation/rule-issue";
import { RuleIssueSeverity } from "../../../src/models/validation/rule-issue";
import { RuleIssueCollection } from "../../../src/models/validation/rule-issue-collection";
import type { ISectionDefinition } from "../../../src/models/section-definition";
import { StringFieldModel } from "../../../src/models/string-field";

// this suite only exercises collection ordering/copy semantics, so the section is never inspected
const section = {} as ISectionDefinition;

function issue(message: string, severity: RuleIssueSeverity = RuleIssueSeverity.error): IRuleIssue {
    return { field: new StringFieldModel({ label: "First name", name: "first-name", value: "" }), section, message, severity };
}

describe("RuleIssueCollection", () => {
    it("starts empty", () => {
        expect(new RuleIssueCollection().getIssues()).toHaveLength(0);
    });

    it("returns a new collection when an issue is added, leaving the original alone", () => {
        const collection = new RuleIssueCollection([issue("required")]);

        const added = collection.addIssue(issue("too long"));

        expect(added).not.toBe(collection);
        expect(added.getIssues()).toHaveLength(2);
        expect(collection.getIssues()).toHaveLength(1);
    });

    it("hands back a copy, so mutating the result does not reach the collection", () => {
        const collection = new RuleIssueCollection([issue("required")]);

        collection.getIssues().push(issue("too long"));

        expect(collection.getIssues()).toHaveLength(1);
    });

    it("keeps issues of either severity", () => {
        const collection = new RuleIssueCollection()
            .addIssue(issue("required"))
            .addIssue(issue("check this", RuleIssueSeverity.warning));

        expect(collection.getIssues().map(entry => entry.severity))
            .toEqual([RuleIssueSeverity.error, RuleIssueSeverity.warning]);
    });
});
