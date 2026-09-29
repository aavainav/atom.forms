import type { FieldModel, TValueType } from "./field";
import type { FieldDefinition } from "./field-definition";

/** Where a field instance sits in a form: the definition it was made from, and the page it is on. */
export interface IFieldPlacement {
    /** The definition the field was made from, which leads up to its section and page definitions. */
    readonly definition: FieldDefinition<FieldModel<TValueType>>;
    /** The id of the page instance the field is on. */
    readonly pageId: string;
    /** Which of the page definition's pages this is, counting from zero. */
    readonly pageOrdinal: number;
    /** Which of a section collection's repeated instances this is, counting from zero. Always 0 for a field in an ordinary section. */
    readonly sectionOrdinal: number;
}
