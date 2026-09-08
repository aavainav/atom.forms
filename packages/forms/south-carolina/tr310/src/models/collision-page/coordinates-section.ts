import { ISection, FieldDefinition, FormModel, SectionModel, StringFieldModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface ICoordinatesSection extends ISection {
}

export interface ICoordinatesSectionModel extends ICoordinatesSection {
}

/** Represents the model for the GPS coordinates of the collision, in the decimal format the form asks for. */
export class CoordinatesSectionModel extends SectionModel implements ICoordinatesSectionModel {
    private schema: TR310FormSchema = FormModel.getSchema<TR310FormSchema>(TR310FormSchema);

    public readonly latitude: FieldDefinition<StringFieldModel> = this.schema.coordinatesFields.coordinatesLatitude;
    public readonly longitude: FieldDefinition<StringFieldModel> = this.schema.coordinatesFields.coordinatesLongitude;

    public getLatitude(): StringFieldModel { return this.get<StringFieldModel>(this.latitude); }
    public getLongitude(): StringFieldModel { return this.get<StringFieldModel>(this.longitude); }
}
