import { FieldDefinition, FormModel, ISection, SectionModel, StringFieldModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface ICollisionOfficerSection extends ISection {
}

export interface ICollisionOfficerSectionModel extends ICollisionOfficerSection {
}

/** Represents the model for the collision page's officer footer, which carries the reviewer as well as the investigating officer. */
export class CollisionOfficerSectionModel extends SectionModel implements ICollisionOfficerSectionModel {
    private schema: TR310FormSchema = FormModel.getSchema<TR310FormSchema>(CollisionOfficerSectionModel);

    public readonly officerName: FieldDefinition<StringFieldModel> = this.schema.collisionOfficerFields.collisionOfficerName;
    public readonly rank: FieldDefinition<StringFieldModel> = this.schema.collisionOfficerFields.collisionOfficerRank;
    public readonly cjaNumber: FieldDefinition<StringFieldModel> = this.schema.collisionOfficerFields.collisionOfficerCjaNumber;
    public readonly jurisdiction: FieldDefinition<StringFieldModel> = this.schema.collisionOfficerFields.collisionOfficerJurisdiction;
    public readonly reviewerName: FieldDefinition<StringFieldModel> = this.schema.collisionOfficerFields.collisionOfficerReviewerName;
    public readonly reviewerRank: FieldDefinition<StringFieldModel> = this.schema.collisionOfficerFields.collisionOfficerReviewerRank;
    public readonly reviewDate: FieldDefinition<StringFieldModel> = this.schema.collisionOfficerFields.collisionOfficerReviewDate;
    public readonly internalAgency: FieldDefinition<StringFieldModel> = this.schema.collisionOfficerFields.collisionOfficerInternalAgency;

    public getOfficerName(): StringFieldModel { return this.get<StringFieldModel>(this.officerName); }
    public getRank(): StringFieldModel { return this.get<StringFieldModel>(this.rank); }
    public getCjaNumber(): StringFieldModel { return this.get<StringFieldModel>(this.cjaNumber); }
    public getJurisdiction(): StringFieldModel { return this.get<StringFieldModel>(this.jurisdiction); }
    public getReviewerName(): StringFieldModel { return this.get<StringFieldModel>(this.reviewerName); }
    public getReviewerRank(): StringFieldModel { return this.get<StringFieldModel>(this.reviewerRank); }
    public getReviewDate(): StringFieldModel { return this.get<StringFieldModel>(this.reviewDate); }
    public getInternalAgency(): StringFieldModel { return this.get<StringFieldModel>(this.internalAgency); }
}
