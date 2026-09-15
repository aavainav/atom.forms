import React, { useCallback } from "react";
import { useService } from "@common/react";
import { IOptionValue, ISectionBinding, FFieldControl, FFieldSelect, FFormStackPanel, FLabel, FSection } from "@forms/core";

import { OwnerSectionModel } from "../../models/unit-page/owner-section";
import { ITR310Service } from "../../services";
import { TextField } from "../fields";

interface IOwnerSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<OwnerSectionModel>;
}

/** Defines the registered owner section of the TR-310 unit page. */
export const OwnerSection = ({ binding }: IOwnerSectionProps): React.JSX.Element => {
    const section = binding.get();
    const tr310Service = useService<ITR310Service>(ITR310Service);

    const state = section.getState();
    const loadStateOptions = useCallback(() => tr310Service.getStateOptions(), [tr310Service]);

    return (
        <FSection>
            <FLabel fontSize="6"><span className="fw-bold">NAME OF OWNER</span></FLabel>
            <FFormStackPanel height={44} direction="horizontal">
                <TextField field={section.getFirstName()} width={170} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.firstName, value)} />
                <TextField field={section.getMiddleName()} width={54} maxlength={1} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.middleName, value)} />
                <TextField field={section.getLastName()} width={170} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.lastName, value)} />
                <TextField field={section.getAddress()} width={250} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.address, value)} />
                <TextField field={section.getCity()} width={150} borderEdges={["top", "left", "right"]} onChange={(value) => binding.setValue(section.city, value)} />
            </FFormStackPanel>
            <FFormStackPanel height={44} direction="horizontal">
                <FFieldControl width={80} label={state.label} labelFor={state.id} borderEdges={["top", "left"]}>
                    <FFieldSelect
                        id={state.id}
                        disabled={!state.getIsEnabled()}
                        format="valueOnly"
                        invalid={state.getHasError()}
                        options={loadStateOptions}
                        searchable
                        value={state.getValue()}
                        onChange={(value) => binding.setValue(section.state, value as IOptionValue)}
                    />
                </FFieldControl>
                <TextField field={section.getZipCode()} width={100} maxlength={10} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.zipCode, value)} />
                <TextField field={section.getDriverLicenseNumber()} width={260} borderEdges={["top", "left", "right"]} onChange={(value) => binding.setValue(section.driverLicenseNumber, value)} />
            </FFormStackPanel>
        </FSection>
    );
};
