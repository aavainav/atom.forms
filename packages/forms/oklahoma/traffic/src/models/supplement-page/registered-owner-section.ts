import { FieldDefinition, FormModel, ISection, OptionFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { OKTrafficFormSchema } from "../traffic-form-schema";

export interface IRegisteredOwnerSection extends ISection {
}

export interface IRegisteredOwnerSectionModel extends IRegisteredOwnerSection {
}

/** Model for the registered owner section of the supplement page. The owner is a single name box, not the first/middle/last the complaint page carries, which is why this page registers no person dropzone. `sameAsSuspect` yes leaves the boxes empty, with the page-one defendant as owner. */
export class RegisteredOwnerSectionModel extends SectionModel implements IRegisteredOwnerSectionModel {
    private schema: OKTrafficFormSchema = FormModel.getSchema<OKTrafficFormSchema>(RegisteredOwnerSectionModel);

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
