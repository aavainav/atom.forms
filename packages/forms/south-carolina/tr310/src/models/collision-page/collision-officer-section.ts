import { ISection, FieldDefinition, SectionModel, StringFieldModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface ICollisionOfficerSection extends ISection {
}

export interface ICollisionOfficerSectionModel extends ICollisionOfficerSection {
}

/** Represents the model for the collision page's officer footer, which carries the reviewer as well as the investigating officer. */
export class CollisionOfficerSectionModel extends SectionModel implements ICollisionOfficerSectionModel {
    private formSchema: TR310FormSchema = this.getSchema<TR310FormSchema>();

    public readonly officerName: FieldDefinition<StringFieldModel> = this.formSchema.collisionOfficerFields.collisionOfficerName;
    public readonly rank: FieldDefinition<StringFieldModel> = this.formSchema.collisionOfficerFields.collisionOfficerRank;
    public readonly cjaNumber: FieldDefinition<StringFieldModel> = this.formSchema.collisionOfficerFields.collisionOfficerCjaNumber;
    public readonly jurisdiction: FieldDefinition<StringFieldModel> = this.formSchema.collisionOfficerFields.collisionOfficerJurisdiction;
    public readonly reviewerName: FieldDefinition<StringFieldModel> = this.formSchema.collisionOfficerFields.collisionOfficerReviewerName;
    public readonly reviewerRank: FieldDefinition<StringFieldModel> = this.formSchema.collisionOfficerFields.collisionOfficerReviewerRank;
    public readonly reviewDate: FieldDefinition<StringFieldModel> = this.formSchema.collisionOfficerFields.collisionOfficerReviewDate;
    public readonly internalAgency: FieldDefinition<StringFieldModel> = this.formSchema.collisionOfficerFields.collisionOfficerInternalAgency;

    public getOfficerName(): StringFieldModel { return this.get<StringFieldModel>(this.officerName); }
    public getRank(): StringFieldModel { return this.get<StringFieldModel>(this.rank); }
    public getCjaNumber(): StringFieldModel { return this.get<StringFieldModel>(this.cjaNumber); }
    public getJurisdiction(): StringFieldModel { return this.get<StringFieldModel>(this.jurisdiction); }
    public getReviewerName(): StringFieldModel { return this.get<StringFieldModel>(this.reviewerName); }
    public getReviewerRank(): StringFieldModel { return this.get<StringFieldModel>(this.reviewerRank); }
    public getReviewDate(): StringFieldModel { return this.get<StringFieldModel>(this.reviewDate); }
    public getInternalAgency(): StringFieldModel { return this.get<StringFieldModel>(this.internalAgency); }
}
