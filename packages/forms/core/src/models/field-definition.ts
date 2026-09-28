import { IDefinition, Definition } from "./definition";
import { FieldModel, FieldModelConstructor } from "./field";
import { PageModel } from "./page";
import { PageDefinition } from "./page-definition";
import { SectionCollectionDefinition } from "./section-collection-definition";
import { SectionModel } from "./section";
import { SectionDefinition } from "./section-definition";

export type TValueType = string | number | boolean | string[] | number[] | boolean[] | any;

/** The definition a field belongs to: an ordinary section holding one instance, or a section collection holding a fixed number of them. */
export type FieldParentDefinition = SectionDefinition<SectionModel> | SectionCollectionDefinition<SectionModel>;

/** Defines the definition of a field within a section. */
export interface IFieldDefinition extends IDefinition {
    /** The display label for the field. */
    readonly label: string;
    /** Whether the field is deprecated and should no longer be used. */
    readonly isDeprecated?: boolean;

    /** Returns the section, or section collection, definition that this field belongs to. */
    getSectionDefinition(): FieldParentDefinition;
    /** Returns the page definition that this field's section belongs to. */
    getPageDefinition(): PageDefinition<PageModel>;
    /** Creates a new field model instance from this definition. */
    createNew(): FieldModel<TValueType>;
}

/** Represents the definition of a field within a section. */
export class FieldDefinition<TField extends FieldModel<TValueType>> extends Definition implements IFieldDefinition {
    public readonly label: string;
    public readonly isDeprecated: boolean = false;

    constructor(
        name: string,
        label: string,
        sectionDefinition: FieldParentDefinition,
        ctor: FieldModelConstructor<TField>) {
        super(
            name,
            ctor,
            sectionDefinition
        );

        this.label = label;
        sectionDefinition.registerField(this);
    }

    public getSectionDefinition(): FieldParentDefinition {
        return this.parent as FieldParentDefinition;
    }

    public getPageDefinition(): PageDefinition<PageModel> {
        return this.getSectionDefinition().getPageDefinition();
    }

    public createNew(): TField {
        const ctor = this.valueType as FieldModelConstructor<TField>;
        return new ctor({ name: this.name, label: this.label, value: "" });
    }
}
