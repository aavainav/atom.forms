import { FieldDefinition, IRuleContext, IRuleIssue, NumberFieldModel, PageDefinition, RegisterRule, Rule, RuleIssueSeverity, StringFieldModel } from "@forms/core";

/** How many miles per hour over the limit a speeding statute covers; a band with no maximum has no upper bound. */
export interface ISpeedingBand {
    readonly minimum: number;
    readonly maximum?: number;
}

/** The speeding statutes, as the violation list writes them. */
export const speedingStatutes: Readonly<Record<string, ISpeedingBand>> = {
    "56-05-1520(G)(1)": { minimum: 1, maximum: 10 },
    "56-05-1520(G)(2)": { minimum: 11, maximum: 14 },
    "56-05-1520(G)(3)": { minimum: 15, maximum: 24 },
    "56-05-1520(G)(4)": { minimum: 25 },
    "56-05-1570(A)": { minimum: 1 }
};

/** Checks that the recorded speed is over the limit by as much as the charged speeding statute covers. */
@RegisterRule(SpeedingRule.name)
export class SpeedingRule extends Rule {
    static readonly defaultMessage = "Violation Section Number does not conform to state speeding statutes";

    readonly sectionNumberDefinition: FieldDefinition<StringFieldModel>;
    readonly speedDefinition: FieldDefinition<NumberFieldModel>;
    readonly speedLimitDefinition: FieldDefinition<NumberFieldModel>;

    constructor(
        sectionNumberDefinition: FieldDefinition<StringFieldModel>,
        speedDefinition: FieldDefinition<NumberFieldModel>,
        speedLimitDefinition: FieldDefinition<NumberFieldModel>,
        message?: string,
        severity?: RuleIssueSeverity) {
        super(SpeedingRule.name, message ?? SpeedingRule.defaultMessage, severity);

        this.sectionNumberDefinition = sectionNumberDefinition;
        this.speedDefinition = speedDefinition;
        this.speedLimitDefinition = speedLimitDefinition;
    }

    public getPageDefinition(): PageDefinition {
        return this.sectionNumberDefinition.getPageDefinition();
    }

    protected evaluate(context: IRuleContext): Array<IRuleIssue> {
        const sectionNumber = context.getField(this.sectionNumberDefinition);
        const band = sectionNumber && speedingStatutes[String(sectionNumber.getValue())];

        if (!sectionNumber || !band) {
            return [];
        }

        const speed = context.getField(this.speedDefinition);
        const speedLimit = context.getField(this.speedLimitDefinition);

        // a speed not yet entered is the required rules' concern
        if (!speed || !speedLimit || speed.getIsEmpty() || speedLimit.getIsEmpty()) {
            return [];
        }

        const over = Number(speed.getValue()) - Number(speedLimit.getValue());

        if (over >= band.minimum && (band.maximum === undefined || over <= band.maximum)) {
            return [];
        }

        return [{ field: sectionNumber, section: this.sectionNumberDefinition.getSectionDefinition(), message: this.message, severity: this.severity }];
    }
}
