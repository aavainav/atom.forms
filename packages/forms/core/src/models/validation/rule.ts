import type { Condition } from "./condition";
import type { IRuleContext } from "./rule-context";
import type { PageDefinition } from "../page-definition";
import { IRuleIssue, RuleIssueSeverity } from "./rule-issue";
import { withChanges } from "../../utils/clone";

/** Defines a validation rule that can be used to validate a form. */
export interface IRule {
    /** The condition that gates whether this rule applies, if any. */
    readonly condition?: Condition;
    /** The name of the rule. */
    readonly name: string;
    /** The message reported when the rule is broken. */
    readonly message: string;
    /** The severity reported when the rule is broken. */
    readonly severity: RuleIssueSeverity;

    /** Returns the page definition whose page instances this rule is evaluated against. */
    getPageDefinition(): PageDefinition;
    /** Returns whether every field this rule reads belongs to a shared section, and so is evaluated once for the form rather than once per page. */
    isShared(): boolean;
    /** Validates the given context, returning any resulting issues. */
    validate(context: IRuleContext): Array<IRuleIssue>;
    /** Returns a new rule that only applies when the given condition is satisfied. */
    when(condition: Condition): this;
}

/** Abstract validation rule. A rule resolves the fields it needs from the context it's handed, so it's free to read one field, several, or combine other rules. */
export abstract class Rule implements IRule {
    static readonly defaultMessage: string;

    readonly condition?: Condition;
    readonly name: string;
    readonly message: string;
    readonly severity: RuleIssueSeverity;

    constructor(name: string, message?: string, severity?: RuleIssueSeverity) {
        this.name = name;
        // TODO: "The field is invalid" doesn't sound like a good default message.
        this.message = message ?? "The field is invalid";
        this.severity = severity ?? RuleIssueSeverity.error;
    }

    public validate(context: IRuleContext): Array<IRuleIssue> {
        if (this.condition && !this.condition.isSatisfied(context)) {
            return [];
        }

        return this.evaluate(context);
    }

    /**
     * Whether the rule reads only shared sections, whose values are the same on every page instance.
     *
     * A rule that does is evaluated against the first page alone -- otherwise the same issue reports once per
     * page, e.g. three copies of "First name is required" on a citation with three violations. A rule that can't
     * say returns false and is evaluated per page.
     */
    public isShared(): boolean {
        return false;
    }

    public when(condition: Condition): this {
        return withChanges(this, { condition });
    }

    abstract getPageDefinition(): PageDefinition;

    /** Evaluates the rule against the given context, once any gating condition has been satisfied. */
    protected abstract evaluate(context: IRuleContext): Array<IRuleIssue>;
}
