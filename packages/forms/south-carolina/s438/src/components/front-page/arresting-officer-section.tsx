import React from "react";
import { ISectionBinding, FFieldControl, FFieldInput, FFormStackPanel, FSection } from "@forms/core";

import { ArrestingOfficerSectionModel } from "../../models/front-page/arresting-officer-section";

interface IArrestingOfficerSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<ArrestingOfficerSectionModel>;
}

/** Defines the arresting officer section for the front page of the S438 citation form. */
export default function ArrestingOfficerSection({ binding }: IArrestingOfficerSectionProps): React.JSX.Element {
    const section = binding.get();
    const name = section.getOfficerName();
    const rank = section.getOfficerRank();
    const sccjaOfficerNumber = section.getSccjaOfficerNumber();
    const bailDeposited = section.getBailDeposited();
    const dateOfArrest = section.getDateOfArrest();
    const bondAmountRequested = section.getBondAmountRequested();

    return (
        <FSection>
            <FFormStackPanel direction="horizontal">
                <div className="w-100">
                    <FFieldControl label={name.label} labelFor={name.id} borderEdges={["left", "top"]}>
                        <FFieldInput
                            id={name.id}
                            disabled={!name.getIsEnabled()}
                            invalid={name.getHasError()}
                            value={name.getValue()}
                            onChange={(value) => binding.setValue(section.officerName, value)}
                        />
                    </FFieldControl>
                </div>
                <div className="w-100">
                    <FFieldControl label={rank.label} labelFor={rank.id} borderEdges={["left", "top"]}>
                        <FFieldInput
                            id={rank.id}
                            disabled={!rank.getIsEnabled()}
                            invalid={rank.getHasError()}
                            value={rank.getValue()}
                            onChange={(value) => binding.setValue(section.officerRank, value)}
                        />
                    </FFieldControl>
                </div>
                <div className="w-100">
                    <FFieldControl label={sccjaOfficerNumber.label} labelFor={sccjaOfficerNumber.id} borderEdges={["left", "top", "right"]}>
                        <FFieldInput
                            id={sccjaOfficerNumber.id}
                            disabled={!sccjaOfficerNumber.getIsEnabled()}
                            invalid={sccjaOfficerNumber.getHasError()}
                            value={sccjaOfficerNumber.getValue()}
                            onChange={(value) => binding.setValue(section.sccjaOfficerNumber, value)}
                        />
                    </FFieldControl>
                </div>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <div className="w-100">
                    <FFieldControl label={bailDeposited.label} labelFor={bailDeposited.id} borderEdges={["left", "top"]}>
                        <FFieldInput
                            id={bailDeposited.id}
                            disabled={!bailDeposited.getIsEnabled()}
                            invalid={bailDeposited.getHasError()}
                            value={bailDeposited.getValue()}
                            onChange={(value) => binding.setValue(section.bailDeposited, value)}
                        />
                    </FFieldControl>
                </div>
                <div className="w-100">
                    <FFieldControl label={dateOfArrest.label} labelFor={dateOfArrest.id} borderEdges={["left", "top"]}>
                        <FFieldInput
                            id={dateOfArrest.id}
                            disabled={!dateOfArrest.getIsEnabled()}
                            invalid={dateOfArrest.getHasError()}
                            value={dateOfArrest.getValue()}
                            onChange={(value) => binding.setValue(section.dateOfArrest, value)}
                        />
                    </FFieldControl>
                </div>
                <div className="w-100">
                    <FFieldControl label={bondAmountRequested.label} labelFor={bondAmountRequested.id} borderEdges={["left", "top", "right"]}>
                        <FFieldInput
                            id={bondAmountRequested.id}
                            disabled={!bondAmountRequested.getIsEnabled()}
                            invalid={bondAmountRequested.getHasError()}
                            value={bondAmountRequested.getValue()}
                            onChange={(value) => binding.setValue(section.bondAmountRequested, value)}
                        />
                    </FFieldControl>
                </div>
            </FFormStackPanel>
        </FSection>
    );
}
