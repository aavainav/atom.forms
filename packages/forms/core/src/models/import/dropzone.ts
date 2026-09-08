import { DraggableItemType } from "./draggable-item";
import { IImportablePerson } from "./importable-person";
import { IImportableVehicle } from "./importable-vehicle";
import { DropzoneHelper } from "./dropzone-helper";
import { FieldModel, TValueType } from "../field";
import { FieldDefinition } from "../field-definition";
import { PageModel } from "../page";
import { SectionModel } from "../section";
import { withChanges } from "../../utils/clone";

/** Constructs a dropzone; a dropzone's constructor doubles as the key it is registered under on its page. */
export type DropzoneConstructor<TDropzone extends Dropzone = Dropzone> = new (...args: any[]) => TDropzone;

/** Defines a drop target that accepts an importable item and maps it onto a set of fields. */
export interface IDropzone<T = IImportablePerson | IImportableVehicle> {
    /** The page the dropzone belongs to. */
    readonly page: PageModel;
    /** The section the dropzone belongs to. */
    readonly section: SectionModel;
    /** The fields the dropzone maps dropped data onto, keyed by field name. */
    readonly fields: Record<string, FieldModel<TValueType> | undefined>;

    /** The kind of dragged item this dropzone accepts. */
    readonly type: DraggableItemType;

    /** Returns a new section with this dropzone's fields applied onto it. */
    applyTo<TSection extends SectionModel>(section: TSection, fieldMap: Record<string, FieldDefinition<FieldModel<TValueType>> | undefined>): TSection;
    /** Gets the fields the dropzone maps dropped data onto. */
    getFields(): Record<string, FieldModel<TValueType> | undefined>;
    /** Returns whether the dropzone's current fields are valid. */
    getIsValid(): boolean;
    /** Gets the page the dropzone belongs to. */
    getPage(): PageModel;
    /** Gets the section the dropzone belongs to. */
    getSection(): SectionModel;
    /** Returns a new dropzone with the given fields. */
    setFields(fields: Record<string, FieldModel<TValueType> | undefined>): this;
    /** Returns a new dropzone with the given validity. */
    setIsValid(isValid: boolean): this;
    /** Returns a new dropzone with its fields populated from the dropped data. */
    onDrop(data: T): this;
}

/** Represents an abstract base class for a dropzone that handles drag-and-drop for a specific importable item type. */
export abstract class Dropzone<T = IImportablePerson | IImportableVehicle> implements IDropzone<T> {
    public readonly page: PageModel;
    public readonly section: SectionModel;
    public readonly fields: Record<string, FieldModel<TValueType> | undefined> = {};

    abstract readonly type: DraggableItemType;
    public readonly isValid: boolean = true;

    constructor(page: PageModel, section: SectionModel, fields: Record<string, FieldModel<TValueType> | undefined>) {
        this.page = page;
        this.section = section;

        this.fields = DropzoneHelper.cleanFieldRecord(fields);
    }

    /** Returns a new section with this dropzone's fields applied onto it; the section is passed in because {@link section} is the snapshot captured when the dropzone was created, not the page's current one. */
    public applyTo<TSection extends SectionModel>(section: TSection, fieldMap: Record<string, FieldDefinition<FieldModel<TValueType>> | undefined>): TSection {
        let updated = section;

        for (const key of Object.keys(fieldMap)) {
            const definition = fieldMap[key];
            const field = this.fields[key];

            if (definition && field !== undefined) {
                updated = updated.set(definition, field);
            }
        }

        return updated;
    }

    public getFields(): Record<string, FieldModel<TValueType> | undefined> {
        return this.fields;
    }

    public getIsValid(): boolean {
        return this.isValid;
    }

    public getPage(): PageModel {
        return this.page;
    }

    public getSection(): SectionModel {
        return this.section;
    }

    public setFields(fields: Record<string, FieldModel<TValueType> | undefined>): this {
        return withChanges(this, { fields: DropzoneHelper.cleanFieldRecord(fields) });
    }

    public setIsValid(isValid: boolean): this {
        return withChanges(this, { isValid });
    }

    abstract onDrop(data: T): this;

    protected clearFields(): this {
        const fields: Record<string, FieldModel<TValueType> | undefined> = {};

        for (const key in this.fields) {
            fields[key] = this.fields[key]?.setDefaultValue();
        }

        return this.setFields(fields);
    }
}
