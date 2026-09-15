import { FieldDefinition, FormModel, ISection, SectionModel, StringFieldModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface ISecondIntersectionSection extends ISection {
}

export interface ISecondIntersectionSectionModel extends ISecondIntersectionSection {
}

/** Represents the model for the second intersection, recorded when the collision occurred where two routes meet. */
export class SecondIntersectionSectionModel extends SectionModel implements ISecondIntersectionSectionModel {
    private schema: TR310FormSchema = FormModel.getSchema<TR310FormSchema>(SecondIntersectionSectionModel);

    public readonly category: FieldDefinition<StringFieldModel> = this.schema.secondIntersectionFields.secondIntersectionCategory;
    public readonly auxiliary: FieldDefinition<StringFieldModel> = this.schema.secondIntersectionFields.secondIntersectionAuxiliary;
    public readonly routeNumber: FieldDefinition<StringFieldModel> = this.schema.secondIntersectionFields.secondIntersectionRouteNumber;
    public readonly routeName: FieldDefinition<StringFieldModel> = this.schema.secondIntersectionFields.secondIntersectionRouteName;

    public getCategory(): StringFieldModel { return this.get<StringFieldModel>(this.category); }
    public getAuxiliary(): StringFieldModel { return this.get<StringFieldModel>(this.auxiliary); }
    public getRouteNumber(): StringFieldModel { return this.get<StringFieldModel>(this.routeNumber); }
    public getRouteName(): StringFieldModel { return this.get<StringFieldModel>(this.routeName); }
}