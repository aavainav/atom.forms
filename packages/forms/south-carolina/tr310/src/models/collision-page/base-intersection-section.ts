import { FieldDefinition, FormModel, ISection, SectionModel, StringFieldModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface IBaseIntersectionSection extends ISection {
}

export interface IBaseIntersectionSectionModel extends IBaseIntersectionSection {
}

/** Represents the model for the base intersection, the junction the collision's distance offset is measured from. */
export class BaseIntersectionSectionModel extends SectionModel implements IBaseIntersectionSectionModel {
    private schema: TR310FormSchema = FormModel.getSchema<TR310FormSchema>(BaseIntersectionSectionModel);

    public readonly category: FieldDefinition<StringFieldModel> = this.schema.baseIntersectionFields.baseIntersectionCategory;
    public readonly auxiliary: FieldDefinition<StringFieldModel> = this.schema.baseIntersectionFields.baseIntersectionAuxiliary;
    public readonly routeNumber: FieldDefinition<StringFieldModel> = this.schema.baseIntersectionFields.baseIntersectionRouteNumber;
    public readonly routeName: FieldDefinition<StringFieldModel> = this.schema.baseIntersectionFields.baseIntersectionRouteName;

    public getCategory(): StringFieldModel { return this.get<StringFieldModel>(this.category); }
    public getAuxiliary(): StringFieldModel { return this.get<StringFieldModel>(this.auxiliary); }
    public getRouteNumber(): StringFieldModel { return this.get<StringFieldModel>(this.routeNumber); }
    public getRouteName(): StringFieldModel { return this.get<StringFieldModel>(this.routeName); }
}
