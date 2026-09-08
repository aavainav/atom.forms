import type { FieldModel, TValueType } from "../../field";
import type { FieldDefinition } from "../../field-definition";
import { FieldRule, IFieldRule } from "../field-rule";
import { RegisterRule } from "../rules-controller";
import { IRuleIssue, RuleIssueSeverity } from "../rule-issue";

/** Defines the bounds a date field's value must fall within. */
export interface IDateRange {
    /** The earliest date the field may hold. */
    readonly minimum?: Date;
    /** The latest date the field may hold. */
    readonly maximum?: Date;
    /** Whether the field may not hold a date later than the day validation runs. */
    readonly notInFuture?: boolean;
}

/** Defines a validation rule that enforces a range of allowed dates on a field's value. */
export interface IDateRangeFieldRule extends IFieldRule {
    /** The bounds the field's value must fall within. */
    readonly range: IDateRange;
}

/** Represents a validation rule that enforces a range of allowed dates on a field's value. */
@RegisterRule(DateRangeFieldRule.name)
export class DateRangeFieldRule extends FieldRule implements IDateRangeFieldRule {
    static readonly defaultMessage = "This field is not within the allowed range of dates.";

    readonly range: IDateRange;

    constructor(fieldDefinition: FieldDefinition<FieldModel<TValueType>>, range: IDateRange, message?: string, severity?: RuleIssueSeverity) {
        super(DateRangeFieldRule.name, fieldDefinition, message ?? DateRangeFieldRule.defaultMessage, severity);

        this.range = range;
    }

    /** Creates a rule that rejects a date later than the day validation runs. */
    public static notInFuture(fieldDefinition: FieldDefinition<FieldModel<TValueType>>, message?: string, severity?: RuleIssueSeverity): DateRangeFieldRule {
        return new DateRangeFieldRule(fieldDefinition, { notInFuture: true }, message, severity);
    }

    /** Creates a rule that rejects a date earlier than the given minimum. */
    public static notBefore(fieldDefinition: FieldDefinition<FieldModel<TValueType>>, minimum: Date, message?: string, severity?: RuleIssueSeverity): DateRangeFieldRule {
        return new DateRangeFieldRule(fieldDefinition, { minimum }, message, severity);
    }

    protected validateField(field: FieldModel<TValueType>): Array<IRuleIssue> {
        // an empty value is the required rule's concern, and an unparseable one the format rule's.
        if (field.getIsEmpty()) {
            return [];
        }

        const value = this.parseDate(String(field.getValue()));
        if (!value) {
            return [];
        }

        if (this.getIsOutOfRange(value)) {
            return [{ field: field, message: this.message, severity: this.severity }];
        }

        return [];
    }

    private getIsOutOfRange(value: Date): boolean {
        if (this.range.minimum && value.getTime() < this.range.minimum.getTime()) {
            return true;
        }

        if (this.range.maximum && value.getTime() > this.range.maximum.getTime()) {
            return true;
        }

        return this.range.notInFuture === true && value.getTime() > DateRangeFieldRule.getToday().getTime();
    }

    /**
     * Parses a `YYYY-MM-DD` value at UTC midnight, returning undefined when the value is not a real date.
     *
     * The parts are compared back against the parsed date because `Date.UTC` silently rolls over out-of-range
     * values, which would otherwise turn 2026-02-31 into 2026-03-03 and validate it.
     */
    private parseDate(value: string): Date | undefined {
        const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
        if (!match) {
            return undefined;
        }

        const year = Number(match[1]);
        const month = Number(match[2]);
        const day = Number(match[3]);

        const date = new Date(Date.UTC(year, month - 1, day));
        const isRealDate = date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;

        return isRealDate ? date : undefined;
    }

    /** Returns the day validation is running on, at UTC midnight, so it compares against parsed values. */
    private static getToday(): Date {
        const now = new Date();
        return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    }
}
