import React, { useCallback } from "react";
import { useService } from "@common/react";
import { ISectionBinding, FFormStackPanel, FLabel, FSection } from "@forms/core";

import { OccupantSectionModel } from "../../models/person-page/occupant-section";
import { ITR310Service } from "../../services";
import { CodedField, TextField } from "../fields";

interface IOccupantSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<OccupantSectionModel>;
}

/** Defines the occupant section of the TR-310 - where the person sat, whether they were ejected, and what restrained them. */
export const OccupantSection = ({ binding }: IOccupantSectionProps): React.JSX.Element => {
    const section = binding.get();
    const tr310Service = useService<ITR310Service>(ITR310Service);

    const loadEjectionOptions = useCallback(() => tr310Service.getEjectionOptions(), [tr310Service]);
    const loadTransportOptions = useCallback(() => tr310Service.getMedicalFacilityTransportOptions(), [tr310Service]);
    const loadHeadInjuryOptions = useCallback(() => tr310Service.getHeadInjuryOptions(), [tr310Service]);
    const loadAirBagOptions = useCallback(() => tr310Service.getAirBagDeploymentOptions(), [tr310Service]);
    const loadRestraintOptions = useCallback(() => tr310Service.getRestraintDeviceOptions(), [tr310Service]);

    return (
        <FSection>
            <FLabel fontSize="6"><span className="fw-bold">DRIVER / NON-MOTORIST</span></FLabel>
            <FFormStackPanel direction="horizontal">
                <TextField field={section.getSeatingLocation()} width={330} height={44} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.seatingLocation, value)} />
                <CodedField
                    columns={1}
                    field={section.getEjection()}
                    load={loadEjectionOptions}
                    title="Ejection"
                    borderEdges={["top", "left"]}
                    onChange={(value) => binding.setValue(section.ejection, value)}
                />
                <CodedField
                    field={section.getMedicalFacilityTransport()}
                    load={loadTransportOptions}
                    title="Transported To Medical Facility"
                    borderEdges={["top", "left", "right"]}
                    onChange={(value) => binding.setValue(section.medicalFacilityTransport, value)}
                />
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <CodedField
                    columns={1}
                    field={section.getHeadInjury()}
                    load={loadHeadInjuryOptions}
                    title="Motorcycle/Moped Head Injury-HI"
                    borderEdges={["top", "left"]}
                    onChange={(value) => binding.setValue(section.headInjury, value)}
                />
                <CodedField
                    field={section.getAirBagDeployment()}
                    load={loadAirBagOptions}
                    title="Air Bag Deployment-ABD"
                    borderEdges={["top", "left"]}
                    onChange={(value) => binding.setValue(section.airBagDeployment, value)}
                />
                <CodedField
                    field={section.getRestraintDevice()}
                    load={loadRestraintOptions}
                    title="Restraint Device-RD"
                    borderEdges={["top", "left", "right"]}
                    onChange={(value) => binding.setValue(section.restraintDevice, value)}
                />
            </FFormStackPanel>
        </FSection>
    );
};
