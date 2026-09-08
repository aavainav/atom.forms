import type { Condition } from "./condition";
import type { IRuleContext } from "./rule-context";
import type { PageDefinition } from "../page-definition";
import { IRuleViolation, RuleViolationSeverity } from "./rule-violation";
import { withChanges } from "../../utils/clone";

/** Defines a validation rule that can be used to validate a form. */
export interface IRule {
    /** The condition that gates whether this rule applies, if any. */
    readonly condition?: Condition;
    /** The name of the rule. */
    readonly name: string;
    /** The message reported when the rule is violated. */
    readonly message: string;
    /** The severity reported when the rule is violated. */
    readonly severity: RuleViolationSeverity;

    /** Returns the page definition whose page instances this rule is evaluated against. */
    getPageDefinition(): PageDefinition;
    /** Validates the given context, returning any resulting violations. */
    validate(context: IRuleContext): Array<IRuleViolation>;
    /** Returns a new rule that only applies when the given condition is satisfied. */
    when(condition: Condition): this;
}

/**
 * Represents an abstract validation rule that can be used to validate a form.
 *
 * A rule resolves the fields it needs from the context it is handed, so a rule is free to read a single field,
 * several fields, or to combine other rules.
 */
export abstract class Rule implements IRule {
    static readonly defaultMessage: string;

    readonly condition?: Condition;
    readonly name: string;
    readonly message: string;
    readonly severity: RuleViolationSeverity;

    constructor(name: string, message?: string, severity?: RuleViolationSeverity) {
        this.name = name;
        // TODO: "The field is invalid" doesn't sound like a good default message.
        this.message = message ?? "The field is invalid";
        this.severity = severity ?? RuleViolationSeverity.error;
    }

    public validate(context: IRuleContext): Array<IRuleViolation> {
        if (this.condition && !this.condition.isSatisfied(context)) {
            return [];
        }

        return this.evaluate(context);
    }

    public when(condition: Condition): this {
        return withChanges(this, { condition });
    }

    abstract getPageDefinition(): PageDefinition;

    /** Evaluates the rule against the given context, once any gating condition has been satisfied. */
    protected abstract evaluate(context: IRuleContext): Array<IRuleViolation>;
}
