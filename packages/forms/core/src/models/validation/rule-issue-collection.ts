import { IRuleIssue } from "./rule-issue";

export type RuleIssueCollectionConstructor = new () => RuleIssueCollection;

/** A collection of issues. */
export interface IRuleIssueCollection {
    readonly issues: ReadonlyArray<IRuleIssue>;

    addIssue(issue: IRuleIssue): RuleIssueCollection;
    getIssues(): Array<IRuleIssue>;
}

/** Represents an immutable collection of rule issues. */
export class RuleIssueCollection implements IRuleIssueCollection {
    public readonly issues: ReadonlyArray<IRuleIssue>;

    constructor(issues: ReadonlyArray<IRuleIssue> = []) {
        this.issues = issues;
    }

    public addIssue(issue: IRuleIssue): RuleIssueCollection {
        return new RuleIssueCollection([...this.issues, issue]);
    }

    public getIssues(): Array<IRuleIssue> {
        return [...this.issues];
    }
}
