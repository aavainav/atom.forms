import { DefinitionFactory, defineFields } from "../../src/models/definition-factory";
import { FormModel } from "../../src/models/form";
import { PageModel } from "../../src/models/page";
import { SectionModel } from "../../src/models/section";
import { StringFieldModel } from "../../src/models/string-field";

/**
 * A second form, used only as something the citation form does not own.
 *
 * `FormModel.getPagesFor` answers an empty array for a page definition belonging to another form, while
 * `getFields` throws for one -- a difference that needs a definition from outside the tree under test to show.
 * Its model subclasses are its own, for the same registry reason as every other fixture.
 */
class ForeignForm extends FormModel { }
class ForeignPage extends PageModel { }
class ForeignSection extends SectionModel { }

export const formDefinition = DefinitionFactory.form("foreign", ForeignForm);
export const pageDefinition = DefinitionFactory.page("foreign-page", formDefinition, ForeignPage);
export const sectionDefinition = DefinitionFactory.section("foreign-section", pageDefinition, ForeignSection);

const fields = defineFields(sectionDefinition, {
    reference: { label: "Reference", ctor: StringFieldModel }
});

export const foreignField = fields.reference;
