import React from "react";
import { ISectionBinding, FFieldControl, FFieldInput, FFormStackPanel, FSection } from "@forms/core";

import { PaymentSectionModel } from "../../models/citation-page/payment-section";

interface IPaymentSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<PaymentSectionModel>;
}

/** The payment section of the citation page. The two amounts are number fields; the converter below puts them on the page as the currency the form prints while the model keeps holding a number. */
export const PaymentSection = ({ binding }: IPaymentSectionProps): React.JSX.Element => {
    const section = binding.get();
    const dueDate = section.getDueDate();
    const amountDue = section.getAmountDue();
    const increasedDueDate = section.getIncreasedDueDate();
    const increasedAmountDue = section.getIncreasedAmountDue();

    return (
        <FSection>
            <div className="small mt-2">If paid on or before the court date, no appearance is required:</div>
            <FFormStackPanel direction="horizontal">
                <FFieldControl width={160} label={dueDate.label} labelFor={dueDate.id} borderEdges={["left", "top"]}>
                    <FFieldInput
                        id={dueDate.id}
                        type="date"
                        disabled={!dueDate.getIsEnabled()}
                        invalid={dueDate.getHasError()}
                        value={dueDate.getValue()}
                        onChange={(value) => binding.setValue(section.dueDate, value)}
                    />
                </FFieldControl>
                <FFieldControl width={160} label={amountDue.label} labelFor={amountDue.id} borderEdges={["left", "top", "right"]}>
                    <FFieldInput
                        id={amountDue.id}
                        type="number"
                        disabled={!amountDue.getIsEnabled()}
                        invalid={amountDue.getHasError()}
                        value={amountDue.getValue()}
                        onChange={(value) => binding.setValue(section.amountDue, value === "" ? null : Number(value))}
                    />
                </FFieldControl>
            </FFormStackPanel>
            <div className="small mt-2">If the increased amount is paid in full after the court date, no appearance is required:</div>
            <FFormStackPanel direction="horizontal">
                <FFieldControl width={160} label={increasedDueDate.label} labelFor={increasedDueDate.id} borderEdges={["left", "top"]}>
                    <FFieldInput
                        id={increasedDueDate.id}
                        type="date"
                        disabled={!increasedDueDate.getIsEnabled()}
                        invalid={increasedDueDate.getHasError()}
                        value={increasedDueDate.getValue()}
                        onChange={(value) => binding.setValue(section.increasedDueDate, value)}
                    />
                </FFieldControl>
                <FFieldControl width={220} label={increasedAmountDue.label} labelFor={increasedAmountDue.id} borderEdges={["left", "top", "right"]}>
                    <FFieldInput
                        id={increasedAmountDue.id}
                        type="number"
                        disabled={!increasedAmountDue.getIsEnabled()}
                        invalid={increasedAmountDue.getHasError()}
                        value={increasedAmountDue.getValue()}
                        onChange={(value) => binding.setValue(section.increasedAmountDue, value === "" ? null : Number(value))}
                    />
                </FFieldControl>
            </FFormStackPanel>
        </FSection>
    );
}
