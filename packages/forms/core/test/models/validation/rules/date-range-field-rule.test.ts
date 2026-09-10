import { afterEach, describe, expect, it, vi } from "vitest";

import { DateRangeFieldRule } from "../../../../src/models/validation/rules/date-range-field-rule";
import { StringFieldModel } from "../../../../src/models/string-field";
import { stubRuleContext } from "../../../fixtures/rule-context";
import { violatorFields } from "../../../fixtures/citation-form";

const spec = { label: "Date of birth", name: "date-of-birth", value: "" };

function date(value: string): StringFieldModel {
    return new StringFieldModel(spec).setValue(value);
}

describe("DateRangeFieldRule", () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    describe("notInFuture", () => {
        /** The rule reads the clock, so the day it runs on has to be pinned for the assertion to mean anything. */
        function pinToday(): void {
            vi.useFakeTimers();
            vi.setSystemTime(new Date(2026, 5, 15, 9, 30));
        }

        it("accepts today", () => {
            pinToday();

            expect(DateRangeFieldRule.notInFuture(violatorFields.dateOfBirth).validate(stubRuleContext(date("2026-06-15"))))
                .toHaveLength(0);
        });

        it("accepts a date in the past", () => {
            pinToday();

            expect(DateRangeFieldRule.notInFuture(violatorFields.dateOfBirth).validate(stubRuleContext(date("1990-01-01"))))
                .toHaveLength(0);
        });

        it("reports tomorrow", () => {
            pinToday();

            const issues = DateRangeFieldRule.notInFuture(violatorFields.dateOfBirth).validate(stubRuleContext(date("2026-06-16")));

            expect(issues).toHaveLength(1);
            expect(issues[0].message).toBe("This field is not within the allowed range of dates.");
        });
    });

    describe("notBefore", () => {
        const rule = DateRangeFieldRule.notBefore(violatorFields.dateOfBirth, new Date(Date.UTC(2000, 0, 1)));

        it("accepts the minimum itself and anything after it", () => {
            expect(rule.validate(stubRuleContext(date("2000-01-01")))).toHaveLength(0);
            expect(rule.validate(stubRuleContext(date("2010-05-20")))).toHaveLength(0);
        });

        it("reports a date before the minimum", () => {
            expect(rule.validate(stubRuleContext(date("1999-12-31")))).toHaveLength(1);
        });
    });

    describe("parsing", () => {
        const rule = DateRangeFieldRule.notBefore(violatorFields.dateOfBirth, new Date(Date.UTC(2000, 0, 1)));

        /** An empty value is the required rule's concern, and an unparseable one the format rule's. */
        it("skips an empty value", () => {
            expect(rule.validate(stubRuleContext(new StringFieldModel(spec)))).toHaveLength(0);
        });

        it("skips a value that is not in YYYY-MM-DD form", () => {
            expect(rule.validate(stubRuleContext(date("01/01/1999")))).toHaveLength(0);
            expect(rule.validate(stubRuleContext(date("1999-1-1")))).toHaveLength(0);
            expect(rule.validate(stubRuleContext(date("yesterday")))).toHaveLength(0);
        });

        /**
         * `Date.UTC` silently rolls an out-of-range day over, which would turn 2026-02-31 into 2026-03-03 and
         * validate it. The parts are compared back against the parsed date so the value is treated as unparseable.
         */
        it("skips a date that does not exist rather than rolling it over", () => {
            expect(rule.validate(stubRuleContext(date("2026-02-31")))).toHaveLength(0);
            expect(rule.validate(stubRuleContext(date("2026-13-01")))).toHaveLength(0);
        });

        it("accepts a real leap day", () => {
            expect(rule.validate(stubRuleContext(date("2024-02-29")))).toHaveLength(0);
        });
    });

    describe("an explicit range", () => {
        it("reports a date outside the minimum and maximum", () => {
            const rule = new DateRangeFieldRule(violatorFields.dateOfBirth, {
                minimum: new Date(Date.UTC(2020, 0, 1)),
                maximum: new Date(Date.UTC(2020, 11, 31))
            });

            expect(rule.validate(stubRuleContext(date("2020-06-15")))).toHaveLength(0);
            expect(rule.validate(stubRuleContext(date("2019-12-31")))).toHaveLength(1);
            expect(rule.validate(stubRuleContext(date("2021-01-01")))).toHaveLength(1);
        });
    });
});
