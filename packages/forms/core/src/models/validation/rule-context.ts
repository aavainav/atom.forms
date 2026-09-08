import type { FieldModel, TValueType } from "../field";
import type { FieldDefinition } from "../field-definition";
import type { FormModel } from "../form";
import type { PageDefinition } from "../page-definition";
import type { PageModel } from "../page";
import type { SectionModel } from "../section";

/**
 * Defines the scope a rule is validated against, resolving field definitions to the field instances within that scope.
 *
 * A context is bound to a single page instance, so a rule that reads more than one field always compares fields
 * belonging to the same page rather than fields from different copies of a repeatable page.
 */
export interface IRuleContext {
    /** The form being validated. */
    readonly form: FormModel;
    /** The page instance the rule is being validated against. */
    readonly page: PageModel;

    /** Gets the field for the specified definition, or undefined when no field could be resolved. */
    getField<TField extends FieldModel<TValueType>>(fieldDefinition: FieldDefinition<TField>): TField | undefined;
}

/** Represents the form and page scope a rule is validated against. */
export class RuleContext implements IRuleContext {
    public readonly form: FormModel;
    public readonly page: PageModel;

    constructor(form: FormModel, page: PageModel) {
        this.form = form;
        this.page = page;
    }

    public getField<TField extends FieldModel<TValueType>>(fieldDefinition: FieldDefinition<TField>): TField | undefined {
        const sectionDefinition = fieldDefinition.getSectionDefinition();

        if (this.page.getDefinition<PageDefinition>().children.includes(sectionDefinition)) {
            return this.page.get<SectionModel>(sectionDefinition).get<TField>(fieldDefinition);
        }

        // the field belongs to a different page definition, so fall back to the first instance of it on the form
        return this.form
            .getPagesFor(fieldDefinition.getPageDefinition())
            .flatMap(page => page.getFields<TField>(fieldDefinition))[0];
    }
}
