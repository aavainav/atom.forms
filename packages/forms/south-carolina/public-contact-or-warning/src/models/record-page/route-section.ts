import { ISection, FieldDefinition, FormModel, SectionModel, StringFieldModel } from "@forms/core";
import { PublicContactOrWarningFormSchema } from "../public-contact-or-warning-form-schema";

export interface IRouteSection extends ISection {
}

export interface IRouteSectionModel extends IRouteSection {
}

/** Represents the model for the route section of the public contact/warning record. */
export class RouteSectionModel extends SectionModel implements IRouteSectionModel {
    private schema: PublicContactOrWarningFormSchema = FormModel.getSchema<PublicContactOrWarningFormSchema>(PublicContactOrWarningFormSchema);

    public readonly type: FieldDefinition<StringFieldModel> = this.schema.routeFields.routeType;
    public readonly numberOrName: FieldDefinition<StringFieldModel> = this.schema.routeFields.routeNumberOrName;

    public getType(): StringFieldModel { return this.get<StringFieldModel>(this.type); }
    public getNumberOrName(): StringFieldModel { return this.get<StringFieldModel>(this.numberOrName); }
}
