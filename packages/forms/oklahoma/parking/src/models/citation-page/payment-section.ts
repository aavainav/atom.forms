import { ISection, FieldDefinition, NumberFieldModel, SectionModel, StringFieldModel } from "@forms/core";
import { OKParkingFormSchema } from "../parking-form-schema";

export interface IPaymentSection extends ISection {
}

export interface IPaymentSectionModel extends IPaymentSection {
}

/**
 * Represents the model for the payment section of the parking citation page.
 *
 * The form prints two amounts: the fine due on or before the court date, and the larger one due once the court
 * date has passed. Paying either in full means no appearance is required.
 */
export class PaymentSectionModel extends SectionModel implements IPaymentSectionModel {
    private formSchema: OKParkingFormSchema = this.getSchema<OKParkingFormSchema>();

    public readonly dueDate: FieldDefinition<StringFieldModel> = this.formSchema.paymentFields.paymentDueDate;
    public readonly amountDue: FieldDefinition<NumberFieldModel> = this.formSchema.paymentFields.paymentAmountDue;
    public readonly increasedDueDate: FieldDefinition<StringFieldModel> = this.formSchema.paymentFields.paymentIncreasedDueDate;
    public readonly increasedAmountDue: FieldDefinition<NumberFieldModel> = this.formSchema.paymentFields.paymentIncreasedAmountDue;

    public getAmountDue(): NumberFieldModel { return this.get<NumberFieldModel>(this.amountDue); }
    public getDueDate(): StringFieldModel { return this.get<StringFieldModel>(this.dueDate); }
    public getIncreasedAmountDue(): NumberFieldModel { return this.get<NumberFieldModel>(this.increasedAmountDue); }
    public getIncreasedDueDate(): StringFieldModel { return this.get<StringFieldModel>(this.increasedDueDate); }
}
