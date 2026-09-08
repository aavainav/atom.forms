import { Rule } from "./rule";

export interface IRuleCollection {
    /** Add a rule to the collection. */
    addRule: (rule: Rule) => RuleCollection;
    /** Adds a collection of rules to the existing rule collection. */
    addRuleCollection: (ruleCollection: RuleCollection) => RuleCollection;
    /** Gets the rules from the collection. */
    getRules: () => Array<Rule>;
}

/**
 * Represents a collection of validation rules that can be managed and validated as a group.
 * This class provides methods to add individual rules, combine rule collections,
 * retrieve the list of rules, and validate all rules in the collection.
 */
export class RuleCollection implements IRuleCollection {
    private rules: ReadonlyArray<Rule> = [];

    constructor(rules: ReadonlyArray<Rule> = []) {
        this.rules = rules;
    }

    public addRule(rule: Rule): RuleCollection {
        return new RuleCollection([...this.rules, rule]);
    }

    public addRuleCollection(ruleCollection: RuleCollection): RuleCollection {
        return new RuleCollection([...this.rules, ...ruleCollection.getRules()]);
    }

    public getRules(): Array<Rule> {
        return [...this.rules];
    }
}