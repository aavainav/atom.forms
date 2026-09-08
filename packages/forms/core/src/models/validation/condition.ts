import type { IRuleContext } from "./rule-context";

/**
 * Defines a condition that decides whether a rule applies, rather than whether a field is valid.
 *
 * Conditions are evaluated against the same context as the rule they gate, so a condition can read any field
 * reachable from that scope.
 */
export interface ICondition {
    /** The name of the condition. */
    readonly name: string;

    /** Returns whether the condition is satisfied within the given context. */
    isSatisfied(context: IRuleContext): boolean;
}

/** Represents an abstract condition that gates whether a rule applies. */
export abstract class Condition implements ICondition {
    readonly name: string;

    constructor(name: string) {
        this.name = name;
    }

    abstract isSatisfied(context: IRuleContext): boolean;
}
