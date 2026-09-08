import { FormModel } from "./form";

export type SchemaConstructor<TSchema extends Schema> = new () => TSchema;

/** Marker interface implemented by form schemas. */
export interface ISchema {
}

/** Represents an abstract base class for defining schemas. Subclasses self-register with `FormModel` upon construction. */
export abstract class Schema implements ISchema {
    constructor() {
        FormModel.registerSchema(new.target, this);
    }
}
