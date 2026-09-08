import { ISection, FieldDefinition, FormModel, OptionFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { OKTrafficFormSchema } from "../traffic-form-schema";

export interface IRegisteredOwnerSection extends ISection {
}

export interface IRegisteredOwnerSectionModel extends IRegisteredOwnerSection {
}

/**
 * Represents the model for the registered owner section of the traffic citation form's supplement page.
 *
 * The owner is a single name box here rather than the first/middle/last the complaint page carries, which is why
 * the supplement page registers no person dropzone. When `sameAsSuspect` is answered yes the boxes are left
 * empty, and the defendant on page one is the owner.
 */
export class RegisteredOwnerSectionModel extends SectionModel implements IRegisteredOwnerSectionModel {
    private schema: OKTrafficFormSchema = FormModel.getSchema<OKTrafficFormSchema>(OKTrafficFormSchema);

    public readonly sameAsSuspect: FieldDefinition<OptionFieldModel> = this.schema.registeredOwnerFields.ownerSameAsSuspect;
    public readonly ownerName: FieldDefinition<StringFieldModel> = this.schema.registeredOwnerFields.ownerName;
    public readonly address: FieldDefinition<StringFieldModel> = this.schema.registeredOwnerFields.ownerAddress;
    public readonly city: FieldDefinition<StringFieldModel> = this.schema.registeredOwnerFields.ownerCity;
    public readonly state: FieldDefinition<OptionFieldModel> = this.schema.registeredOwnerFields.ownerState;
    public readonly zipCode: FieldDefinition<StringFieldModel> = this.schema.registeredOwnerFields.ownerZipCode;

    public getAddress(): StringFieldModel { return this.get<StringFieldModel>(this.address); }
    public getCity(): StringFieldModel { return this.get<StringFieldModel>(this.city); }
    public getOwnerName(): StringFieldModel { return this.get<StringFieldModel>(this.ownerName); }
    public getSameAsSuspect(): OptionFieldModel { return this.get<OptionFieldModel>(this.sameAsSuspect); }
    public getState(): OptionFieldModel { return this.get<OptionFieldModel>(this.state); }
    public getZipCode(): StringFieldModel { return this.get<StringFieldModel>(this.zipCode); }
}
