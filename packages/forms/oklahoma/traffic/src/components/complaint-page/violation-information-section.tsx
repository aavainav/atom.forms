import React, { useCallback } from "react";
import { useService } from "@common/react";
import { ISectionBinding, IValueListController, FFormStackPanel, FSection } from "@forms/core";

import { ViolationInformationSectionModel } from "../../models/complaint-page/violation-information-section";
import { IOKTrafficService } from "../../services";
import { NumberBox, TextBox, YesNoBox } from "../fields";

interface IViolationInformationSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<ViolationInformationSectionModel>;
    /** Caches the value lists backing this section's option fields, so they are only loaded once per form. */
    readonly valueListController: IValueListController;
}

/** Defines the violation information section of the Oklahoma City traffic citation form's complaint page. */
export const ViolationInformationSection = ({ binding, valueListController }: IViolationInformationSectionProps): React.JSX.Element => {
    const section = binding.get();
    const okTrafficService = useService<IOKTrafficService>(IOKTrafficService);

    const incidentNumber = section.getIncidentNumber();
    const offenseLevel = section.getOffenseLevel();
    const highFatalitySpeed = section.getHighFatalitySpeed();
    const actualSpeed = section.getActualSpeed();
    const speedLimit = section.getSpeedLimit();
    const speedDetection = section.getSpeedDetection();
    const lidarDistance = section.getLidarDistance();

    const loadYesNoOptions = useCallback(() => okTrafficService.getYesNoOptions(), [okTrafficService]);

    return (
        <FSection>
            <div className="text-center fw-bold mt-3">VIOLATION INFORMATION</div>
            <FFormStackPanel direction="horizontal">
                <div className="w-100"><TextBox field={incidentNumber} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.incidentNumber, value)} /></div>
                <TextBox field={offenseLevel} width={170} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.offenseLevel, value)} />
                <YesNoBox controller={valueListController} field={highFatalitySpeed} load={loadYesNoOptions} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.highFatalitySpeed, value)} />
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <NumberBox field={actualSpeed} width={140} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.actualSpeed, value)} />
                <NumberBox field={speedLimit} width={110} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.speedLimit, value)} />
                <TextBox field={speedDetection} width={140} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.speedDetection, value)} />
                <TextBox field={lidarDistance} width={140} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.lidarDistance, value)} />
            </FFormStackPanel>
        </FSection>
    );
}
