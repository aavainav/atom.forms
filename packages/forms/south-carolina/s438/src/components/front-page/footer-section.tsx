import React from "react";
import { ISectionBinding, FFieldControl, FFieldInput, FFormStackPanel, FSection } from "@forms/core";

import { FooterSectionModel } from "../../models/front-page/footer-section";

interface IFooterSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<FooterSectionModel>;
}

const smallTextStyle: React.CSSProperties = { fontSize: "0.65rem" };

/** Defines the footer section for the front page of the S438 citation form. */
export default function FooterSection({ binding }: IFooterSectionProps): React.JSX.Element {
    const section = binding.get();
    const ticketNumber = section.getTicketNumber();

    return (
        <FSection>
            <div className="row border border-dark border-bottom-0 p-3 g-0">
                <p className="text-uppercase" style={smallTextStyle}>
                    Present this summons to the trial court shown above <br />
                    be sure you understand from the arresting officer the exact time <br />
                    and before whom you are to appear. If this ticket is written for a <br />
                    traffic violation and you forfeit bail, plead guilty or <br />
                    nolo contendere, or are convicted after a trial, this violation will be <br />
                    placed against your driving record, or forwarded to your home <br />
                    state. Points for out of state violator will be assessed by your <br />
                    home state licensing authority and may differ from state to state <br />
                    failure to comply with the terms of this summons may result in <br />
                    the suspension of your driver's license by your home state. You are <br />
                    required by law to appear in court for certain offenses.
                </p>
                <p className="text-uppercase m-0" style={smallTextStyle}>See important information on the reverse side of this ticket.</p>
            </div>
            <FFormStackPanel direction="horizontal">
                <div className="w-100">
                    <FFieldControl label={ticketNumber.label} labelFor={ticketNumber.id}>
                        <FFieldInput
                            id={ticketNumber.id}
                            disabled={!ticketNumber.getIsEnabled()}
                            invalid={ticketNumber.getHasError()}
                            value={ticketNumber.getValue()}
                            onChange={(value) => binding.setValue(section.ticketNumber, value)}
                        />
                    </FFieldControl>
                </div>
            </FFormStackPanel>
        </FSection>
    );
}
