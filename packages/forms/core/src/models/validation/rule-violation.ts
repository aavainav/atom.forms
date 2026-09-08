import { IField } from "../field";

/** Defines the severity of the rule. */
export enum RuleViolationSeverity {
    error = 0,
    warning = 1
}

/** Defines a rule violation, which contains the offending field, error message, and severity of the violation. */
export interface IRuleViolation {
    /** The field with the rule violation. */
    readonly field: IField;

    /** The rule violation message. */
    readonly message: string;
    /** The rule violation severity. */
    readonly severity: RuleViolationSeverity;
}
