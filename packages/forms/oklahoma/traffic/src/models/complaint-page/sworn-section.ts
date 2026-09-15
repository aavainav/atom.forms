import { FieldDefinition, FormModel, ISection, SectionModel, StringFieldModel } from "@forms/core";
import { OKTrafficFormSchema } from "../traffic-form-schema";

export interface ISwornSection extends ISection {
}

export interface ISwornSectionModel extends ISwornSection {
}

/**
 * Represents the model for the jurat of the traffic citation form's complaint page - who the complaint was
 * subscribed and sworn before, and when.
 *
 * The name field is `swornName` rather than `name`, because `SectionModel` already declares a `name` holding the
 * section's own name and a field definition cannot shadow it.
 */
export class SwornSectionModel extends SectionModel implements ISwornSectionModel {
    private schema: OKTrafficFormSchema = FormModel.getSchema<OKTrafficFormSchema>(SwornSectionModel);

    public readonly swornName: FieldDefinition<StringFieldModel> = this.schema.swornFields.swornName;
    public readonly date: FieldDefinition<StringFieldModel> = this.schema.swornFields.swornDate;
    public readonly title: FieldDefinition<StringFieldModel> = this.schema.swornFields.swornTitle;

    public getDate(): StringFieldModel { return this.get<StringFieldModel>(this.date); }
    public getSwornName(): StringFieldModel { return this.get<StringFieldModel>(this.swornName); }
    public getTitle(): StringFieldModel { return this.get<StringFieldModel>(this.title); }
}
