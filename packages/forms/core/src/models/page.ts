import { Definition } from "./definition";
import { Entity, EntityConstructor, IEntity } from "./entity";
import { FieldModel, TValueType } from "./field";
import { FieldDefinition } from "./field-definition";
import { SectionDefinition } from "./section-definition";
import { SectionModel } from "./section";
import { withChanges } from "../utils/clone";
import { Dropzone, DropzoneConstructor } from "./import/dropzone";

export type PageModelConstructor<T extends PageModel> = new () => T;

/** Describes the raw shape of a page. */
export interface IPage extends IEntity<Definition> {
    /** The name of the page. */
    readonly name: string;
    /** A human-readable description of the page. */
    readonly description?: string;

    /** The dropzones registered on this page, keyed by the dropzone type that produced them. */
    readonly dropzones: ReadonlyMap<DropzoneConstructor, Dropzone>;
}

/** Defines the model of a page. */
export interface IPageModel extends IPage {
    /** Creates and initializes the page's sections. */
    initialize(): Promise<this>;
    /** Gets the child entity registered for the specified section definition. */
    get<TSection>(sectionDefinition: SectionDefinition): TSection;
    /** Gets the dropzone registered for the specified dropzone type. */
    getDropzone<TDropzone extends Dropzone>(dropzoneType: DropzoneConstructor<TDropzone>): TDropzone;
    /** Gets every dropzone registered on the page. */
    getDropzones(): Array<Dropzone>;
    /** Gets every field on the page that matches the specified field definition. */
    getFields<TField>(fieldDefinition: FieldDefinition<FieldModel<TValueType>>): Array<TField>;
    /** Returns a new page with the given dropzone registered under its own type. */
    setDropzone<TDropzone extends Dropzone>(dropzone: TDropzone): this;
    /** Returns a new page with the given name. */
    setName(name: string): this;
}

/** Represents a model for a page, extending `Entity` with a section definition. */
export class PageModel extends Entity<SectionDefinition> implements IPageModel {
    public readonly name: string;
    public readonly description?: string;

    public readonly dropzones: ReadonlyMap<DropzoneConstructor, Dropzone> = new Map<DropzoneConstructor, Dropzone>();

    public async initialize(): Promise<this> {
        // Initialization logic if needed
        return this;
    }

    public get<TSection>(sectionDefinition: SectionDefinition): TSection {
        return super.get<TSection>(sectionDefinition);
    }

    public getDropzone<TDropzone extends Dropzone>(dropzoneType: DropzoneConstructor<TDropzone>): TDropzone {
        const dropzone = this.dropzones.get(dropzoneType) as TDropzone | undefined;
        if (!dropzone) {
            throw new Error(`Dropzone ${dropzoneType.name} must be registered on page ${this.name} before accessing.`);
        }

        return dropzone;
    }

    public getDropzones(): Array<Dropzone> {
        return Array.from(this.dropzones.values());
    }

    public getFields<TField>(fieldDefinition: FieldDefinition<FieldModel<TValueType>>): Array<TField> {
        return this.getFieldsInPage<TField>(fieldDefinition);
    }

    public setDropzone<TDropzone extends Dropzone>(dropzone: TDropzone): this {
        const dropzones = new Map(this.dropzones).set(dropzone.constructor as DropzoneConstructor, dropzone);
        return withChanges(this, { dropzones });
    }

    public setName(name: string): this {
        return withChanges(this, { name });
    }

    public static registerDefinition<TDefinition extends Definition>(ctor: EntityConstructor<TDefinition>, definition: Definition): void {
        Entity.registerDefinition(ctor, definition);
    }

    private getFieldsInPage<TField>(fieldDefinition: FieldDefinition<FieldModel<TValueType>>): Array<TField> {
        const fields: Array<TField> = [];

        const section = this.get<SectionModel>(fieldDefinition.getSectionDefinition());
        if (section) {
            fields.push(section.get<TField>(fieldDefinition));
        }
        return fields;
    }
}
