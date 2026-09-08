import { IField } from "../field";

/** Defines the severity of the rule. */
export enum RuleIssueSeverity {
    error = 0,
    warning = 1
}

/** Defines a rule issue, which contains the offending field, error message, and severity of the issue. */
export interface IRuleIssue {
    /** The field with the rule issue. */
    readonly field: IField;

    /** The rule issue message. */
    readonly message: string;
    /** The rule issue severity. */
    readonly severity: RuleIssueSeverity;
}
