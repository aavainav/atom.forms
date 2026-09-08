import { IDefinition, Definition } from "./definition";
import { FormModel, FormModelConstructor } from "./form";
import { IPageDefinition } from "./page-definition";

export type FormDefinitionConstructor<
    TForm extends FormModel,
    TDefinition extends FormDefinition<TForm>
> = new (
    name: string,
    ctor: FormModelConstructor<TForm>
) => TDefinition;

/** Defines the definition of a form. */
export interface IFormDefinition extends IDefinition {
    /** Registers a page definition as a child of this form. */
    registerPage(pageDefinition: IPageDefinition): void;
    /** Not supported for form definitions; use the `FormModel` constructor directly instead. */
    createNew(): FormModel;
}

export class NotSupportedError extends Error {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, NotSupportedError.prototype);
    }
}

/** Represents the definition of a form, serving as a blueprint for creating form models. */
export class FormDefinition<TForm extends FormModel = FormModel> extends Definition implements IFormDefinition {
    constructor(name: string, ctor: FormModelConstructor<TForm>) {
        super(
            name,
            ctor,
            undefined, // No parent for the form definition
        );

        FormModel.registerDefinition(ctor, this);
    }

    public registerPage(pageDefinition: IPageDefinition): void {
        this.registerChild(pageDefinition);
    }

    /** Not supported; use the `FormModel` constructor directly instead. */
    public createNew(): FormModel {
        throw new NotSupportedError("FormDefinition.createNew is not supported. Use FormModel constructor instead.");
    }
}
