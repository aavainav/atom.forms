import React, { useCallback } from "react";
import { useService } from "@common/react";
import { IOptionValue, ISectionBinding, IValueListController, FFieldControl, FFieldSelect, FFormStackPanel, FLabel, FSection } from "@forms/core";
import { ValueListId } from "@forms/value-lists";

import { DriverLicenseSectionModel } from "../../models/person-page/driver-license-section";
import { ITR310Service } from "../../services";
import { TR310ValueListId } from "../../value-lists";
import { CodedField, TextField } from "../fields";

interface IDriverLicenseSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<DriverLicenseSectionModel>;
    /** Caches the value lists backing this section's option fields, so they are only loaded once per form. */
    readonly valueListController: IValueListController;
}

/** Defines the driver licence section of the TR-310, which applies when the page records a driver rather than a non-motorist. */
export const DriverLicenseSection = ({ binding, valueListController }: IDriverLicenseSectionProps): React.JSX.Element => {
    const section = binding.get();
    const tr310Service = useService<ITR310Service>(ITR310Service);

    const state = section.getState();

    const loadStateOptions = useCallback(() => tr310Service.getStateOptions(), [tr310Service]);
    const loadJurisdictionOptions = useCallback(() => tr310Service.getLicenseJurisdictionOptions(), [tr310Service]);

    return (
        <FSection>
            <FLabel fontSize="6"><span className="fw-bold">DRIVER</span></FLabel>
            <FFormStackPanel direction="horizontal">
                <FFormStackPanel height={44} direction="horizontal">
                    <TextField field={section.getNumber()} width={260} maxlength={25} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.number, value)} />
                    <FFieldControl width={80} label={state.label} labelFor={state.id} borderEdges={["top", "left"]}>
                        <FFieldSelect
                            id={state.id}
                            cacheKey={ValueListId.state}
                            controller={valueListController}
                            disabled={!state.getIsEnabled()}
                            format="valueOnly"
                            invalid={state.getHasError()}
                            options={loadStateOptions}
                            searchable
                            value={state.getValue()}
                            onChange={(value) => binding.setValue(section.state, value as IOptionValue)}
                        />
                    </FFieldControl>
                    <TextField field={section.getClass()} width={90} borderEdges={["top", "left"]} onChange={(value) => binding.setValue(section.class, value)} />
                </FFormStackPanel>
                <CodedField
                    cacheKey={TR310ValueListId.licenseJurisdiction}
                    controller={valueListController}
                    field={section.getJurisdiction()}
                    load={loadJurisdictionOptions}
                    title="DL Jurisdiction"
                    borderEdges={["top", "left", "right"]}
                    onChange={(value) => binding.setValue(section.jurisdiction, value)}
                />
            </FFormStackPanel>
        </FSection>
    );
};
