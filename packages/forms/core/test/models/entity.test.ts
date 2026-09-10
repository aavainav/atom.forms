import { beforeEach, describe, expect, it } from "vitest";

import type { SectionModel } from "../../src/models/section";
import type { StringFieldModel } from "../../src/models/string-field";
import {
    chargeFields,
    chargeSection,
    createTestForm,
    getFieldValue,
    TestCitationForm,
    violatorFields,
    violatorSection
} from "../fixtures/citation-form";
import { foreignField } from "../fixtures/foreign-form";

describe("Entity", () => {
    let form: TestCitationForm;

    beforeEach(async () => {
        form = await createTestForm();
    });

    function violator(): SectionModel {
        return form.getPages()[0].get<SectionModel>(violatorSection);
    }

    describe("get", () => {
        it("resolves a child by its definition", () => {
            expect(violator().get<StringFieldModel>(violatorFields.firstName).name).toBe("first-name");
        });

        /** `get` throws rather than answering undefined, so a missing value surfaces where it happens. */
        it("throws for a definition it holds no value for", () => {
            expect(() => violator().get<StringFieldModel>(foreignField))
                .toThrowError(/A field was not found for definition with name reference/);
        });

        it("throws for a definition belonging to a different section", () => {
            expect(() => violator().get<StringFieldModel>(chargeFields.offenseDescription))
                .toThrowError(/A field was not found for definition/);
        });
    });

    describe("set", () => {
        it("returns a new entity, leaving the original alone", () => {
            const section = violator();
            const field = section.get<StringFieldModel>(violatorFields.firstName);

            const updated = section.set(violatorFields.firstName, field.setValue("Dana"));

            expect(updated).not.toBe(section);
            expect(updated.get<StringFieldModel>(violatorFields.firstName).getValue()).toBe("Dana");
            expect(section.get<StringFieldModel>(violatorFields.firstName).getValue()).toBe("");
        });

        it("keeps the entity's own type", () => {
            const section = violator();

            expect(section.set(violatorFields.firstName, section.get<StringFieldModel>(violatorFields.firstName)))
                .toBeInstanceOf(section.constructor);
        });

        it("leaves the entity's other children untouched", () => {
            const section = violator();
            const field = section.get<StringFieldModel>(violatorFields.firstName);

            const updated = section.set(violatorFields.firstName, field.setValue("Dana"));

            expect(updated.get<StringFieldModel>(violatorFields.dateOfBirth))
                .toBe(section.get<StringFieldModel>(violatorFields.dateOfBirth));
        });

        /** A child definition is validated by reference identity, not by name or id. */
        it("throws for a definition that is not one of its children", () => {
            const section = violator();

            expect(() => section.set(chargeFields.offenseDescription, section.get<StringFieldModel>(violatorFields.firstName)))
                .toThrowError(/is not a child of entity definition/);
        });
    });

    describe("identity", () => {
        it("gives every entity its own id and starts it at revision zero", () => {
            const page = form.getPages()[0];

            expect(page.id).toBeTruthy();
            expect(page.revision).toBe(0);
            expect(page.id).not.toBe(violator().id);
        });

        it("resolves its own definition with no argument", () => {
            expect(violator().definition).toBe(violatorSection);
            expect(form.getPages()[0].get<SectionModel>(chargeSection).definition).toBe(chargeSection);
        });
    });

    describe("getDefinitionByName", () => {
        it("finds a child definition by its wire name", () => {
            expect(violator().getDefinitionByName("first-name")).toBe(violatorFields.firstName);
        });

        it("throws for a name it does not declare", () => {
            expect(() => violator().getDefinitionByName("offense-description"))
                .toThrowError("Definition with name offense-description not found in entity definitions.");
        });
    });

    describe("initializeDefinitionValues", () => {
        it("creates a value for every child definition", () => {
            expect(violator().getChildDefinitions()).toHaveLength(3);
            expect(getFieldValue(form, violatorSection, violatorFields.dateOfBirth).getValue()).toBe("");
        });
    });
});
