import type { FieldDefinition } from "../../src/models/field-definition";
import type { FieldModel, TValueType } from "../../src/models/field";
import type { SectionDefinition } from "../../src/models/section-definition";
import { DefinitionFactory, defineFields } from "../../src/models/definition-factory";
import { FormModel } from "../../src/models/form";
import { BooleanFieldModel } from "../../src/models/boolean-field";
import { NumberFieldModel } from "../../src/models/number-field";
import { OptionFieldModel } from "../../src/models/option-field";
import { PageCollection } from "../../src/models/page-collection";
import { PageModel } from "../../src/models/page";
import { SectionModel } from "../../src/models/section";
import { StringFieldModel } from "../../src/models/string-field";

/**
 * The smallest form that exercises the shared-section machinery: one repeating page carrying a shared `violator`
 * section and a per-page `charge` section, which is the shape every citation form in the repo reduces to.
 *
 * Three things about this file are load-bearing, and a second fixture must repeat all three:
 *
 * - **The definition tree is built once, here, at module scope.** `Entity.set` validates a child definition by
 *   reference identity, so a tree rebuilt per test would mint new definitions and every entity still holding the
 *   old ones would throw. Only the form instance is per-test, through `createTestForm`.
 * - **Every node type is a subclass owned by this file.** `Entity.definitionRegistry` is keyed by model
 *   constructor, so a constructor backs exactly one definition and a shared `PageModel` would collide.
 * - **Nothing calls `FormModel.dispose()`.** It clears both registries process-wide rather than for one form.
 *
 * Imports are deep source paths rather than `src/index.ts`, whose barrel re-exports `src/utils` and with it a
 * value import of react.
 */
export class TestCitationForm extends FormModel { }
export class TestCitationPage extends PageModel { }
export class TestChargeSection extends SectionModel { }
export class TestViolatorSection extends SectionModel { }

export const citationForm = DefinitionFactory.form("test-citation", TestCitationForm);
export const citationPage = DefinitionFactory.page("citation", citationForm, TestCitationPage);

export const violatorSection = DefinitionFactory.section("violator", citationPage, TestViolatorSection, { isShared: true });
export const chargeSection = DefinitionFactory.section("charge", citationPage, TestChargeSection);

export const violatorFields = defineFields(violatorSection, {
    dateOfBirth: { label: "Date of birth", ctor: StringFieldModel },
    driverLicenseNumber: { label: "Driver license number", ctor: StringFieldModel },
    firstName: { label: "First name", ctor: StringFieldModel }
});

export const chargeFields = defineFields(chargeSection, {
    fineAmount: { label: "Fine amount", ctor: NumberFieldModel },
    isSpeedingRelated: { label: "Speeding related", ctor: BooleanFieldModel },
    offenseCode: { label: "Offense code", ctor: OptionFieldModel },
    offenseDescription: { label: "Offense description", ctor: StringFieldModel }
});

/**
 * Builds a fresh form with its pages created.
 *
 * `initialize()` must be awaited -- it is what creates the pages, and a form that has only been constructed holds
 * empty page collections. Seed field values with `setValue` rather than through a field model's constructor; see
 * the characterization test in `test/models/field.test.ts` for why the constructor's value does not survive.
 */
export function createTestForm(): Promise<TestCitationForm> {
    return new TestCitationForm().initialize();
}

/** Returns a form with a second citation page appended, which is what makes per-page behaviour observable. */
export async function addCitationPage(form: TestCitationForm): Promise<TestCitationForm> {
    return form.addPage(await citationPage.createPage(form).initialize(), citationPage);
}

/**
 * Returns a form with one field on the page at the given index set to the given value.
 *
 * This walks the tree by hand rather than going through `FormController`, so that a test of the model layer does
 * not depend on the controller layer being correct. A test that is *about* the controller uses its bindings.
 */
export function setFieldValue<TValue extends TValueType>(
    form: TestCitationForm,
    sectionDefinition: SectionDefinition<SectionModel>,
    fieldDefinition: FieldDefinition<FieldModel<TValueType>>,
    value: TValue,
    pageIndex: number = 0): TestCitationForm {
    const pageCollection = form.get<PageCollection>(citationPage);
    const page = pageCollection.findPageByIndex(pageIndex);

    const section = page.get<SectionModel>(sectionDefinition);
    const updated = section.set(fieldDefinition, section.get<FieldModel<TValueType>>(fieldDefinition).setValue(value));

    return form.set(citationPage, pageCollection.replace(pageIndex, page.set(sectionDefinition, updated)));
}

/** Reads one field off the page at the given index. */
export function getFieldValue<TField extends FieldModel<TValueType>>(
    form: TestCitationForm,
    sectionDefinition: SectionDefinition<SectionModel>,
    fieldDefinition: FieldDefinition<TField>,
    pageIndex: number = 0): TField {
    return form
        .get<PageCollection>(citationPage)
        .findPageByIndex(pageIndex)
        .get<SectionModel>(sectionDefinition)
        .get<TField>(fieldDefinition);
}
