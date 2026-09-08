import { Definition } from "./definition";
import { Entity, EntityConstructor, IEntity } from "./entity";
import { FieldModel, TValueType } from "./field";
import { FieldDefinition } from "./field-definition";
import { withChanges } from "../utils/clone";

export type SectionModelConstructor<T> = new () => T;

/** Describes the raw shape of a section. */
export interface ISection extends IEntity<Definition> {
    /** The name of the section. */
    readonly name: string;
}

/** Defines the model of a section within a page. */
export interface ISectionModel extends ISection {
    /** Returns a new section with the given name. */
    setName(name: string): this;
    /** Gets the child entity registered for the specified field definition. */
    get<TField>(fieldDefinition: FieldDefinition<FieldModel<TValueType>>): TField;
}

/** Represents a model for a section within a page. */
export class SectionModel extends Entity<FieldDefinition<FieldModel<TValueType>>> implements ISectionModel {
    public readonly name: string;

    public setName(name: string): this {
        return withChanges(this, { name });
    }

    public get<TField>(fieldDefinition: FieldDefinition<FieldModel<TValueType>>): TField {
        return super.get<TField>(fieldDefinition);
    }

    public static registerDefinition<TDefinition extends Definition>(ctor: EntityConstructor<TDefinition>, definition: Definition): void {
        Entity.registerDefinition(ctor, definition);
    }
}
