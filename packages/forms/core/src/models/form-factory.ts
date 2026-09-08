import { FormModel } from "./form";
import { PageDefinition } from "./page-definition";
import { PageModel } from "./page";

/** Defines a factory capable of creating a form and describing its available page types. */
export interface FormFactory<TForm extends FormModel = FormModel> {
    /** The display name of the form the factory creates. */
    readonly name: string;
    /** The version of the form the factory creates. */
    readonly version: string;
    /** Creates a new, uninitialized form instance. */
    createForm(): TForm;
    /** Returns the page definitions available for the form, keyed by name. */
    getPageTypes(): Map<string, PageDefinition<PageModel>>;
}

export type FormFactoryConstructor<TForm extends FormModel = FormModel> = new () => FormFactory<TForm>;
