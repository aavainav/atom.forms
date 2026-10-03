import { describe, expect, it } from "vitest";

import type { PageCollection } from "../../src/models/page-collection";
import type { PageModel } from "../../src/models/page";
import type { SectionModel } from "../../src/models/section";
import { BooleanFieldModel } from "../../src/models/boolean-field";
import { NumberFieldModel } from "../../src/models/number-field";
import { OptionFieldModel } from "../../src/models/option-field";
import { StringFieldModel } from "../../src/models/string-field";
import { PersonDropzone } from "../../src/models/import/person-dropzone";
import { VehicleDropzone } from "../../src/models/import/vehicle-dropzone";
import { ViolationDropzone } from "../../src/models/import/violation-dropzone";
import { chargeFields, chargeSection, citationPage, createTestForm, setFieldValue, TestCitationForm, violatorFields, violatorSection } from "../fixtures/citation-form";

/** The citation's first page as it stands. */
function firstPage(form: TestCitationForm): PageModel {
    return form.get<PageCollection>(citationPage).findPageByIndex(0);
}

/** A person dropzone over the violator's first name, built from the page given, as a page builds its own. */
function personZone(page: PageModel): PersonDropzone {
    const section = page.get<SectionModel>(violatorSection);

    return new PersonDropzone(page, section, section.get<StringFieldModel>(violatorFields.firstName));
}

describe("Dropzone", () => {
    describe("getCurrentFields", () => {
        /** A dropzone's own fields are the copies taken when the page was built, so what is there now comes off the page. */
        it("reads the fields as they stand on the page given, not as they stood when the dropzone was made", async () => {
            const form = await createTestForm();
            const zone = personZone(firstPage(form));
            const answered = setFieldValue(form, violatorSection, violatorFields.firstName, "James");

            expect(zone.getFields().first_name?.getValue()).toBe("");
            expect(zone.getCurrentFields(firstPage(answered)).first_name?.getValue()).toBe("James");
        });
    });

    describe("getIsOccupied", () => {
        it("is false on a blank section, and true once any field it writes is answered", async () => {
            const form = await createTestForm();
            const zone = personZone(firstPage(form));

            expect(zone.getIsOccupied(firstPage(form))).toBe(false);
            expect(zone.getIsOccupied(firstPage(setFieldValue(form, violatorSection, violatorFields.firstName, "James")))).toBe(true);
        });

        it("does not count a blank option box, a number left alone, or an unchecked box as a record", async () => {
            const form = await createTestForm();
            const page = firstPage(form);
            const section = page.get<SectionModel>(chargeSection);
            const vehicle = new VehicleDropzone(page, section, section.get<OptionFieldModel>(chargeFields.offenseCode), undefined, section.get<NumberFieldModel>(chargeFields.fineAmount));
            const violation = new ViolationDropzone(page, section, undefined, undefined, undefined, undefined, undefined, section.get<BooleanFieldModel>(chargeFields.isSpeedingRelated));

            expect(vehicle.getIsOccupied(page)).toBe(false);
            expect(violation.getIsOccupied(firstPage(setFieldValue(form, chargeSection, chargeFields.isSpeedingRelated, false)))).toBe(false);
        });
    });

    describe("describe", () => {
        it("names a person by first and last name, as far as they go", async () => {
            const zone = personZone(firstPage(await createTestForm()));

            expect(zone.describe(zone.onDrop({ firstName: "Dana", lastName: "Price" }).getFields())).toBe("Dana");
            expect(zone.describe(zone.getFields())).toBeUndefined();
        });

        it("names a vehicle by year, make and model, an option box by its description", async () => {
            const form = await createTestForm();
            const page = firstPage(form);
            const section = page.get<SectionModel>(chargeSection);
            const zone = new VehicleDropzone(page, section, section.get<OptionFieldModel>(chargeFields.offenseCode), undefined, section.get<NumberFieldModel>(chargeFields.fineAmount));
            const answered = firstPage(setFieldValue(setFieldValue(form, chargeSection, chargeFields.offenseCode, { value: "TOYT", description: "Toyota" }), chargeSection, chargeFields.fineAmount, 2021));

            expect(zone.describe(zone.getCurrentFields(answered))).toBe("2021 Toyota");
        });

        it("names a violation by its description, or its statute when it has none", async () => {
            const form = await createTestForm();
            const page = firstPage(form);
            const section = page.get<SectionModel>(chargeSection);
            const byStatute = new ViolationDropzone(page, section, undefined, undefined, section.get<StringFieldModel>(chargeFields.offenseDescription));
            const byDescription = new ViolationDropzone(page, section, undefined, section.get<StringFieldModel>(chargeFields.offenseDescription));
            const answered = firstPage(setFieldValue(form, chargeSection, chargeFields.offenseDescription, "56-5-1520"));

            expect(byStatute.describe(byStatute.getCurrentFields(answered))).toBe("56-5-1520");
            expect(byDescription.describe(byDescription.getCurrentFields(answered))).toBe("56-5-1520");
        });
    });
});
