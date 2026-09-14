import { ISection, FieldDefinition, SectionModel, StringFieldModel } from "@forms/core";
import { OKTrafficFormSchema } from "../traffic-form-schema";

export interface IHeaderSection extends ISection {
}

export interface IHeaderSectionModel extends IHeaderSection {
}

/** Represents the model for the header section of the traffic citation form's complaint page. */
export class HeaderSectionModel extends SectionModel implements IHeaderSectionModel {
    private formSchema: OKTrafficFormSchema = this.getSchema<OKTrafficFormSchema>();

    public readonly citationNumber: FieldDefinition<StringFieldModel> = this.formSchema.headerFields.headerCitationNumber;

    public getCitationNumber(): StringFieldModel { return this.get<StringFieldModel>(this.citationNumber); }
}
