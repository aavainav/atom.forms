import type { IRuleContext } from "../rule-context";
import { Condition, ICondition } from "../condition";
import { LogicalOperator } from "../logical-operator";

/** Defines a condition that combines other conditions under a logical operator. */
export interface ICompositeCondition extends ICondition {
    /** The operator used to combine the child conditions. */
    readonly operator: LogicalOperator;
    /** The conditions combined by this condition. */
    readonly conditions: ReadonlyArray<Condition>;

    /** Gets the conditions combined by this condition. */
    getConditions(): Array<Condition>;
}

/** Represents a condition that is satisfied when every, or any, of its child conditions are satisfied. */
export class CompositeCondition extends Condition implements ICompositeCondition {
    readonly operator: LogicalOperator;
    readonly conditions: ReadonlyArray<Condition>;

    constructor(operator: LogicalOperator, conditions: ReadonlyArray<Condition>) {
        super(CompositeCondition.name);

        if (conditions.length === 0) {
            throw new Error("A composite condition requires at least one condition.");
        }

        this.operator = operator;
        this.conditions = conditions;
    }

    public getConditions(): Array<Condition> {
        return [...this.conditions];
    }

    public isSatisfied(context: IRuleContext): boolean {
        return this.operator === LogicalOperator.and
            ? this.conditions.every(condition => condition.isSatisfied(context))
            : this.conditions.some(condition => condition.isSatisfied(context));
    }

    /** Creates a condition that is satisfied only when every one of the given conditions is satisfied. */
    public static all(...conditions: Array<Condition>): CompositeCondition {
        return new CompositeCondition(LogicalOperator.and, conditions);
    }

    /** Creates a condition that is satisfied when any one of the given conditions is satisfied. */
    public static any(...conditions: Array<Condition>): CompositeCondition {
        return new CompositeCondition(LogicalOperator.or, conditions);
    }
}
