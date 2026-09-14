import { describe, expect, it } from "vitest";

import { DefinitionFactory, defineFields } from "../../src/models/definition-factory";
import { FormModel } from "../../src/models/form";
import { NumberFieldModel } from "../../src/models/number-field";
import { PageModel } from "../../src/models/page";
import { SectionModel } from "../../src/models/section";
import { StringFieldModel } from "../../src/models/string-field";

/**
 * This file declares its own model subclasses and builds its tree once, for the same reason the shared fixture
 * does: `Entity.definitionRegistry` is keyed by model constructor, so a constructor backs exactly one definition.
 */
class FactoryTestForm extends FormModel { }
class FactoryTestPage extends PageModel { }
class FactoryTestSection extends SectionModel { }
class FactoryTestSharedSection extends SectionModel { }

const formDefinition = DefinitionFactory.form("factory-test", FactoryTestForm, {});
const pageDefinition = DefinitionFactory.page("details", formDefinition, FactoryTestPage);
const sectionDefinition = DefinitionFactory.section("vehicle", pageDefinition, FactoryTestSection);
const sharedSectionDefinition = DefinitionFactory.section("owner", pageDefinition, FactoryTestSharedSection, { isShared: true });

const fields = defineFields(sectionDefinition, {
    driverLicenseNumber: { label: "Driver license number", ctor: StringFieldModel },
    make: { label: "Make", ctor: StringFieldModel },
    modelYear: { label: "Model year", ctor: NumberFieldModel },
    vin: { label: "VIN", ctor: StringFieldModel, name: "vehicle-identification-number" }
});

describe("DefinitionFactory", () => {
    it("registers a page as a child of its form and a section as a child of its page", () => {
        expect(formDefinition.children).toContain(pageDefinition);
        expect(pageDefinition.children).toContain(sectionDefinition);
        expect(pageDefinition.children).toContain(sharedSectionDefinition);
    });

    it("gives every definition its own id", () => {
        expect(sectionDefinition.id).not.toBe(sharedSectionDefinition.id);
    });

    it("treats a section as not shared unless it says otherwise", () => {
        expect(sectionDefinition.isShared).toBe(false);
        expect(sharedSectionDefinition.isShared).toBe(true);
    });

    it("walks back up from a field to its section and page", () => {
        expect(fields.make.getSectionDefinition()).toBe(sectionDefinition);
        expect(fields.make.getPageDefinition()).toBe(pageDefinition);
    });
});

describe("defineFields", () => {
    it("derives the wire name from the spec key, camel to kebab", () => {
        expect(fields.driverLicenseNumber.name).toBe("driver-license-number");
        expect(fields.modelYear.name).toBe("model-year");
    });

    it("leaves a single-word key alone", () => {
        expect(fields.make.name).toBe("make");
    });

    it("takes an explicit name over the derived one", () => {
        expect(fields.vin.name).toBe("vehicle-identification-number");
    });

    /** The returned map is keyed by the spec key, while the definition carries the kebab-cased wire name. */
    it("keys the result by the spec key rather than the wire name", () => {
        expect(Object.keys(fields)).toEqual(["driverLicenseNumber", "make", "modelYear", "vin"]);
    });

    it("carries the label through and registers each field on its section", () => {
        expect(fields.modelYear.label).toBe("Model year");
        expect(sectionDefinition.children).toHaveLength(4);
        expect(sectionDefinition.children).toContain(fields.vin);
    });

    it("builds a field of the type its spec named", () => {
        expect(fields.modelYear.createNew()).toBeInstanceOf(NumberFieldModel);
        expect(fields.make.createNew()).toBeInstanceOf(StringFieldModel);
    });
});
