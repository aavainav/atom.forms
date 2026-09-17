import type { FieldModel, TValueType } from "../../field";
import type { FieldDefinition } from "../../field-definition";
import type { IRuleContext } from "../rule-context";
import type { PageDefinition } from "../../page-definition";
import { IRule, Rule } from "../rule";
import { LogicalOperator } from "../logical-operator";
import { RegisterRule } from "../rules-controller";
import { IRuleIssue, RuleIssueSeverity } from "../rule-issue";

/** Defines a validation rule that combines other rules under a logical operator. */
export interface ICompositeRule extends IRule {
    /** The operator used to combine the child rules. */
    readonly operator: LogicalOperator;
    /** The rules combined by this rule. */
    readonly rules: ReadonlyArray<Rule>;

    /** Gets the rules combined by this rule. */
    getRules(): Array<Rule>;
}

/**
 * A validation rule that groups other rules under a logical operator.
 *
 * `and` reports every issue its rules produce, each keeping its own rule's message. `or` reports nothing once one
 * rule passes; if all fail, it reports their issues, replaced by the group's own message if it was given one.
 *
 * The rules needn't share a field, so a group can express a requirement spanning several -- e.g. one of two
 * fields being filled in.
 */
@RegisterRule(CompositeRule.name)
export class CompositeRule extends Rule implements ICompositeRule {
    readonly operator: LogicalOperator;
    readonly rules: ReadonlyArray<Rule>;

    private readonly hasOwnMessage: boolean;

    constructor(operator: LogicalOperator, rules: ReadonlyArray<Rule>, message?: string, severity?: RuleIssueSeverity) {
        super(CompositeRule.name, message, severity);

        if (rules.length === 0) {
            throw new Error("A composite rule requires at least one rule.");
        }

        this.operator = operator;
        this.rules = rules;
        this.hasOwnMessage = message !== undefined;
    }

    public getPageDefinition(): PageDefinition {
        return this.rules[0].getPageDefinition();
    }

    public getRules(): Array<Rule> {
        return [...this.rules];
    }

    /** A group is shared only when every rule in it is, since one rule reading a per-page field makes the group's answer differ per page. */
    public isShared(): boolean {
        return this.rules.every(rule => rule.isShared());
    }

    /** Creates a group in which every rule built for the given field must pass. */
    public static and(fieldDefinition: FieldDefinition<FieldModel<TValueType>>, build: (fieldDefinition: FieldDefinition<FieldModel<TValueType>>) => Array<Rule>): CompositeRule {
        return new CompositeRule(LogicalOperator.and, build(fieldDefinition));
    }

    /** Creates a group in which every one of the given rules must pass. */
    public static all(...rules: Array<Rule>): CompositeRule {
        return new CompositeRule(LogicalOperator.and, rules);
    }

    /** Creates a group in which at least one of the given rules must pass. */
    public static any(...rules: Array<Rule>): CompositeRule {
        return new CompositeRule(LogicalOperator.or, rules);
    }

    /** Creates a group in which at least one of the rules built for the given field must pass. */
    public static or(fieldDefinition: FieldDefinition<FieldModel<TValueType>>, build: (fieldDefinition: FieldDefinition<FieldModel<TValueType>>) => Array<Rule>, message?: string, severity?: RuleIssueSeverity): CompositeRule {
        return new CompositeRule(LogicalOperator.or, build(fieldDefinition), message, severity);
    }

    protected evaluate(context: IRuleContext): Array<IRuleIssue> {
        return this.operator === LogicalOperator.and ? this.evaluateAll(context) : this.evaluateAny(context);
    }

    /** Runs every rule in the group, reporting each issue so nothing is hidden behind an earlier failure. */
    private evaluateAll(context: IRuleContext): Array<IRuleIssue> {
        return this.rules.flatMap(rule => rule.validate(context));
    }

    /** Runs the rules in the group until one of them passes, reporting their issues only when they all fail. */
    private evaluateAny(context: IRuleContext): Array<IRuleIssue> {
        const issues: Array<IRuleIssue> = [];

        for (const rule of this.rules) {
            const result = rule.validate(context);
            if (result.length === 0) {
                return [];
            }

            issues.push(...result);
        }

        return this.hasOwnMessage ? this.replaceMessages(issues) : issues;
    }

    /** Reports the group's own message once per offending field, in place of the individual rules' messages. */
    private replaceMessages(issues: Array<IRuleIssue>): Array<IRuleIssue> {
        const fields = new Set(issues.map(issue => issue.field));

        return [...fields].map(field => ({ field: field, message: this.message, severity: this.severity }));
    }
}
