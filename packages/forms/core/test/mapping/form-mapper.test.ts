import { beforeEach, describe, expect, it } from "vitest";

import type { FieldModel, TValueType } from "../../src/models/field";
import type { PageCollection } from "../../src/models/page-collection";
import type { SectionModel } from "../../src/models/section";
import { FormMapper } from "../../src/mapping/form-mapper";
import {
    chargeFields,
    chargeSection,
    citationPage,
    createTestForm,
    getFieldValue,
    setFieldValue,
    TestCitationForm,
    violatorFields,
    violatorSection
} from "../fixtures/citation-form";

/** The slice of the fixture form a mapper would publish. Every key is optional, as an unanswered field is absent. */
interface ITestCitationData {
    readonly firstName?: string;
    readonly fineAmount?: number;
    readonly isSpeedingRelated?: boolean;
    readonly offenseDescription?: string;
}

/**
 * A mapper over the fixture, written the way a form package writes its own: every field listed by name, with
 * `extract` and `populate` adjacent so a missed field shows in one diff.
 */
class TestCitationMapper extends FormMapper<TestCitationForm, ITestCitationData> {
    public extract(form: TestCitationForm): ITestCitationData {
        const data: ITestCitationData = {};

        const violator = form.getPages()[0].get<SectionModel>(violatorSection);
        const charge = form.getPages()[0].get<SectionModel>(chargeSection);

        this.read(data, "firstName", violator.get<FieldModel<TValueType>>(violatorFields.firstName));
        this.read(data, "fineAmount", charge.get<FieldModel<TValueType>>(chargeFields.fineAmount));
        this.read(data, "isSpeedingRelated", charge.get<FieldModel<TValueType>>(chargeFields.isSpeedingRelated));
        this.read(data, "offenseDescription", charge.get<FieldModel<TValueType>>(chargeFields.offenseDescription));

        return data;
    }

    public populate(form: TestCitationForm, data: ITestCitationData): TestCitationForm {
        const pageCollection = form.get<PageCollection>(citationPage);
        const page = pageCollection.findPageByIndex(0);

        const violator = this.write(page.get<SectionModel>(violatorSection), violatorFields.firstName, data.firstName);

        let charge = this.write(page.get<SectionModel>(chargeSection), chargeFields.fineAmount, data.fineAmount);
        charge = this.write(charge, chargeFields.isSpeedingRelated, data.isSpeedingRelated);
        charge = this.write(charge, chargeFields.offenseDescription, data.offenseDescription);

        return form.set(
            citationPage,
            pageCollection.replace(0, page.set(violatorSection, violator).set(chargeSection, charge)));
    }
}

describe("FormMapper", () => {
    const mapper = new TestCitationMapper();
    let form: TestCitationForm;

    beforeEach(async () => {
        form = await createTestForm();
    });

    describe("read", () => {
        /**
         * A key is omitted when its field is empty, so an unanswered field reads as missing rather than as its
         * type's default -- an untouched number field holds 0, which would otherwise be reported as a fine of 0.
         */
        it("omits a key whose field is empty", () => {
            const data = mapper.extract(form);

            expect("firstName" in data).toBe(false);
            expect("fineAmount" in data).toBe(false);
            expect("offenseDescription" in data).toBe(false);
        });

        it("omits an untouched number field rather than reporting zero", () => {
            expect(mapper.extract(setFieldValue(form, chargeSection, chargeFields.fineAmount, 0)))
                .not.toHaveProperty("fineAmount");
        });

        it("includes a number field once it holds a non-zero value", () => {
            expect(mapper.extract(setFieldValue(form, chargeSection, chargeFields.fineAmount, 250)).fineAmount).toBe(250);
        });

        /** A boolean field is never empty when true, so a ticked checkbox always reports its state. */
        it("includes a checkbox once it is ticked, and omits it while it is not", () => {
            expect(mapper.extract(form)).not.toHaveProperty("isSpeedingRelated");

            expect(mapper.extract(setFieldValue(form, chargeSection, chargeFields.isSpeedingRelated, true)).isSpeedingRelated)
                .toBe(true);
        });

        it("includes a string field once it holds text", () => {
            expect(mapper.extract(setFieldValue(form, violatorSection, violatorFields.firstName, "Dana")).firstName)
                .toBe("Dana");
        });
    });

    describe("write", () => {
        it("applies every value the data carries", () => {
            const populated = mapper.populate(form, { firstName: "Dana", fineAmount: 250, offenseDescription: "Speeding" });

            expect(getFieldValue(populated, violatorSection, violatorFields.firstName).getValue()).toBe("Dana");
            expect(getFieldValue(populated, chargeSection, chargeFields.fineAmount).getValue()).toBe(250);
            expect(getFieldValue(populated, chargeSection, chargeFields.offenseDescription).getValue()).toBe("Speeding");
        });

        /** A key the data does not mention leaves the field at whatever it already held. */
        it("leaves a field alone when its value is undefined", () => {
            const seeded = setFieldValue(form, violatorSection, violatorFields.firstName, "Dana");

            const populated = mapper.populate(seeded, { fineAmount: 250 });

            expect(getFieldValue(populated, violatorSection, violatorFields.firstName).getValue()).toBe("Dana");
        });

        it("returns a new form, leaving the original alone", () => {
            const populated = mapper.populate(form, { firstName: "Dana" });

            expect(populated).not.toBe(form);
            expect(getFieldValue(form, violatorSection, violatorFields.firstName).getValue()).toBe("");
        });
    });

    describe("a round trip", () => {
        /**
         * The pair is what a mapper exists for: everything answered on the form has to survive being written out
         * and read back. A field missed in one direction shows up here as a key that does not come back.
         */
        it("returns everything it was given", () => {
            const data: ITestCitationData = {
                firstName: "Dana",
                fineAmount: 250,
                isSpeedingRelated: true,
                offenseDescription: "Speeding"
            };

            expect(mapper.extract(mapper.populate(form, data))).toEqual(data);
        });
    });
});
