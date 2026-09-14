import { ISection, FieldDefinition, SectionModel, StringFieldModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface IBaseIntersectionSection extends ISection {
}

export interface IBaseIntersectionSectionModel extends IBaseIntersectionSection {
}

/** Represents the model for the base intersection, the junction the collision's distance offset is measured from. */
export class BaseIntersectionSectionModel extends SectionModel implements IBaseIntersectionSectionModel {
    private formSchema: TR310FormSchema = this.getSchema<TR310FormSchema>();

    public readonly category: FieldDefinition<StringFieldModel> = this.formSchema.baseIntersectionFields.baseIntersectionCategory;
    public readonly auxiliary: FieldDefinition<StringFieldModel> = this.formSchema.baseIntersectionFields.baseIntersectionAuxiliary;
    public readonly routeNumber: FieldDefinition<StringFieldModel> = this.formSchema.baseIntersectionFields.baseIntersectionRouteNumber;
    public readonly routeName: FieldDefinition<StringFieldModel> = this.formSchema.baseIntersectionFields.baseIntersectionRouteName;

    public getCategory(): StringFieldModel { return this.get<StringFieldModel>(this.category); }
    public getAuxiliary(): StringFieldModel { return this.get<StringFieldModel>(this.auxiliary); }
    public getRouteNumber(): StringFieldModel { return this.get<StringFieldModel>(this.routeNumber); }
    public getRouteName(): StringFieldModel { return this.get<StringFieldModel>(this.routeName); }
}
