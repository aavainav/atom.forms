import React from "react";
import { ISectionBinding, FBorder, FFormStackPanel, FSection } from "@forms/core";

import { CertificationSectionModel } from "../../models/citation-page/certification-section";
import { TextBox, twoDigitBoxWidth } from "../fields";

interface ICertificationSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<CertificationSectionModel>;
}

/** Defines Section V (Arresting Officer's Certification) of the Georgia uniform traffic citation. */
export const CertificationSection = ({ binding }: ICertificationSectionProps): React.JSX.Element => {
    const section = binding.get();
    const officerSignature = section.getOfficerSignature();
    const swornDay = section.getSwornDay();
    const swornMonth = section.getSwornMonth();
    const swornYear = section.getSwornYear();
    const signatureAndTitle = section.getSignatureAndTitle();

    return (
        <FSection>
            <div className="text-center fw-bold mt-3">ARRESTING OFFICER'S CERTIFICATION</div>
            <FBorder border="visible">
                <p className="small m-3">
                    The undersigned, being duly sworn, upon his or her oath and under penalty of perjury, deposes and states that he or
                    she has just and reasonable grounds to believe, and does believe, that the person named herein has committed the
                    offense set forth, contrary to law.
                </p>
            </FBorder>
            <FFormStackPanel direction="horizontal">
                <div className="w-100"><TextBox field={officerSignature} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.officerSignature, value)} /></div>
            </FFormStackPanel>
            <p className="small m-3 mb-1">Sworn to and subscribed before me on</p>
            <FFormStackPanel direction="horizontal">
                <TextBox field={swornDay} width={twoDigitBoxWidth} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.swornDay, value)} />
                <div className="w-100"><TextBox field={swornMonth} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.swornMonth, value)} /></div>
                <TextBox field={swornYear} label="20 (Yr.)" width={twoDigitBoxWidth} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.swornYear, value)} />
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <div className="w-100"><TextBox field={signatureAndTitle} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.signatureAndTitle, value)} /></div>
            </FFormStackPanel>
            <div className="text-muted small mt-3">
                Authorized and approved pursuant to: CODE 40-13-1 D.P.S REG. 375-3-4-.01 Form APD 008E Rev 4/10 = DPS-32C (1/02)
            </div>
        </FSection>
    );
};
