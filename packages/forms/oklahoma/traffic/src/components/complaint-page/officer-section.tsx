import React, { useCallback } from "react";
import { useService } from "@common/react";
import { ISectionBinding, IValueListController, FBorder, FFormStackPanel, FSection } from "@forms/core";

import { OfficerSectionModel } from "../../models/complaint-page/officer-section";
import { IOKTrafficService } from "../../services";
import { TextBox, YesNoBox } from "../fields";

interface IOfficerSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<OfficerSectionModel>;
    /** Caches the value lists backing this section's option fields, so they are only loaded once per form. */
    readonly valueListController: IValueListController;
}

/** Defines the officer section of the Oklahoma City traffic citation form's complaint page. */
export const OfficerSection = ({ binding, valueListController }: IOfficerSectionProps): React.JSX.Element => {
    const section = binding.get();
    const okTrafficService = useService<IOKTrafficService>(IOKTrafficService);

    const complainantSignature = section.getComplainantSignature();
    const officerName = section.getOfficerName();
    const commissionNumber = section.getCommissionNumber();
    const bodyWornCamera = section.getBodyWornCamera();
    const secondOfficerName = section.getSecondOfficerName();
    const secondCommissionNumber = section.getSecondCommissionNumber();
    const secondBodyWornCamera = section.getSecondBodyWornCamera();

    const loadYesNoOptions = useCallback(() => okTrafficService.getYesNoOptions(), [okTrafficService]);

    return (
        <FSection>
            <FBorder border="visible">
                <p className="small m-3">
                    I, the undersigned issuing officer, hereby certify and swear that I have read the foregoing
                    information and know the facts and contents thereof and that the facts supporting the criminal
                    charge stated therein are true.
                </p>
            </FBorder>
            <FFormStackPanel direction="horizontal">
                <div className="w-100"><TextBox field={complainantSignature} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.complainantSignature, value)} /></div>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <div className="w-100"><TextBox field={officerName} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.officerName, value)} /></div>
                <TextBox field={commissionNumber} width={170} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.commissionNumber, value)} />
                <YesNoBox controller={valueListController} field={bodyWornCamera} load={loadYesNoOptions} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.bodyWornCamera, value)} />
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <div className="w-100"><TextBox field={secondOfficerName} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.secondOfficerName, value)} /></div>
                <TextBox field={secondCommissionNumber} width={170} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.secondCommissionNumber, value)} />
                <YesNoBox controller={valueListController} field={secondBodyWornCamera} load={loadYesNoOptions} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.secondBodyWornCamera, value)} />
            </FFormStackPanel>
            <div className="text-center fw-bold mt-3">
                <div>Oklahoma City Police Department</div>
                <div>700 Colcord Drive, Oklahoma City, OK 73102</div>
            </div>
        </FSection>
    );
}
