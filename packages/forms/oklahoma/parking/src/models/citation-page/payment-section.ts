import { FieldDefinition, FormModel, ISection, NumberFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { OKParkingFormSchema } from "../parking-form-schema";

export interface IPaymentSection extends ISection {
}

export interface IPaymentSectionModel extends IPaymentSection {
}

/** Model for the payment section of the citation page. The form prints two amounts: the fine due by the court date, and a larger one due after it passes. Paying either in full means no appearance is required. */
export class PaymentSectionModel extends SectionModel implements IPaymentSectionModel {
    private schema: OKParkingFormSchema = FormModel.getSchema<OKParkingFormSchema>(PaymentSectionModel);

    public readonly dueDate: FieldDefinition<StringFieldModel> = this.schema.paymentFields.paymentDueDate;
    public readonly amountDue: FieldDefinition<NumberFieldModel> = this.schema.paymentFields.paymentAmountDue;
    public readonly increasedDueDate: FieldDefinition<StringFieldModel> = this.schema.paymentFields.paymentIncreasedDueDate;
    public readonly increasedAmountDue: FieldDefinition<NumberFieldModel> = this.schema.paymentFields.paymentIncreasedAmountDue;

    public getAmountDue(): NumberFieldModel { return this.get<NumberFieldModel>(this.amountDue); }
    public getDueDate(): StringFieldModel { return this.get<StringFieldModel>(this.dueDate); }
    public getIncreasedAmountDue(): NumberFieldModel { return this.get<NumberFieldModel>(this.increasedAmountDue); }
    public getIncreasedDueDate(): StringFieldModel { return this.get<StringFieldModel>(this.increasedDueDate); }
}
