import { ISection, BooleanFieldModel, FieldDefinition, FormModel, OptionFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { TR310FormSchema } from "../tr310-form-schema";

export interface ICollisionSection extends ISection {
}

export interface ICollisionSectionModel extends ICollisionSection {
}

/** Represents the model for the collision section, carrying when and where the collision happened and the three yes/no questions asked about it. */
export class CollisionSectionModel extends SectionModel implements ICollisionSectionModel {
    private schema: TR310FormSchema = FormModel.getSchema<TR310FormSchema>(TR310FormSchema);

    public readonly date: FieldDefinition<StringFieldModel> = this.schema.collisionFields.collisionDate;
    public readonly time: FieldDefinition<StringFieldModel> = this.schema.collisionFields.collisionTime;
    public readonly county: FieldDefinition<OptionFieldModel> = this.schema.collisionFields.collisionCounty;
    public readonly cityOrTown: FieldDefinition<StringFieldModel> = this.schema.collisionFields.collisionCityOrTown;
    public readonly secondaryCrash: FieldDefinition<OptionFieldModel> = this.schema.collisionFields.collisionSecondaryCrash;
    public readonly privatePropertyCollision: FieldDefinition<OptionFieldModel> = this.schema.collisionFields.collisionPrivatePropertyCollision;
    public readonly totalDamageOverThreshold: FieldDefinition<OptionFieldModel> = this.schema.collisionFields.collisionTotalDamageOverThreshold;
    public readonly picturesTaken: FieldDefinition<BooleanFieldModel> = this.schema.collisionFields.collisionPicturesTaken;

    public getDate(): StringFieldModel { return this.get<StringFieldModel>(this.date); }
    public getTime(): StringFieldModel { return this.get<StringFieldModel>(this.time); }
    public getCounty(): OptionFieldModel { return this.get<OptionFieldModel>(this.county); }
    public getCityOrTown(): StringFieldModel { return this.get<StringFieldModel>(this.cityOrTown); }
    public getSecondaryCrash(): OptionFieldModel { return this.get<OptionFieldModel>(this.secondaryCrash); }
    public getPrivatePropertyCollision(): OptionFieldModel { return this.get<OptionFieldModel>(this.privatePropertyCollision); }
    public getTotalDamageOverThreshold(): OptionFieldModel { return this.get<OptionFieldModel>(this.totalDamageOverThreshold); }
    public getPicturesTaken(): BooleanFieldModel { return this.get<BooleanFieldModel>(this.picturesTaken); }
}
