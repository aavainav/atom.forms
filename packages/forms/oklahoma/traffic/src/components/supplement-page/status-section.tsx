import React, { useCallback } from "react";
import { useService } from "@common/react";
import { ISectionBinding, FFormStackPanel, FSection } from "@forms/core";

import { StatusSectionModel } from "../../models/supplement-page/status-section";
import { IOKTrafficService } from "../../services";
import { SelectBox, TextBox, YesNoBox } from "../fields";

interface IStatusSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<StatusSectionModel>;
}

/** The status flags of the supplement page. Every Y/N box here draws on the one registered yes-no list, so the whole section costs a single load however many are rendered. */
export const StatusSection = ({ binding }: IStatusSectionProps): React.JSX.Element => {
    const section = binding.get();
    const okTrafficService = useService<IOKTrafficService>(IOKTrafficService);

    const signed = section.getSigned();
    const requestWarrant = section.getRequestWarrant();
    const mainPhone = section.getMainPhone();
    const directionOfTravel = section.getDirectionOfTravel();
    const jailed = section.getJailed();
    const trailerTag = section.getTrailerTag();
    const releaseType = section.getReleaseType();
    const trailerState = section.getTrailerState();
    const tribe = section.getTribe();
    const schoolZone = section.getSchoolZone();
    const voidReason = section.getVoidReason();
    const constructionWorkZone = section.getConstructionWorkZone();
    const assignment = section.getAssignment();
    const ethnicity = section.getEthnicity();
    const transientStatus = section.getTransient();
    const witnessCaptured = section.getWitnessCaptured();
    const noLicensePlate = section.getNoLicensePlate();

    const loadStateOptions = useCallback(() => okTrafficService.getStateOptions(), [okTrafficService]);
    const loadYesNoOptions = useCallback(() => okTrafficService.getYesNoOptions(), [okTrafficService]);

    return (
        <FSection>
            <FFormStackPanel direction="horizontal">
                <YesNoBox field={signed} load={loadYesNoOptions} width={160} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.signed, value)} />
                <YesNoBox field={requestWarrant} load={loadYesNoOptions} width={180} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.requestWarrant, value)} />
                <TextBox field={mainPhone} width={190} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.mainPhone, value)} />
                <div className="w-100"><TextBox field={directionOfTravel} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.directionOfTravel, value)} /></div>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <TextBox field={jailed} width={160} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.jailed, value)} />
                <TextBox field={trailerTag} width={170} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.trailerTag, value)} />
                <TextBox field={releaseType} width={160} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.releaseType, value)} />
                <SelectBox
                    field={trailerState}
                    load={loadStateOptions}
                    format="valueOnly"
                    width={140}
                    borderEdges={["left", "top", "right"]}
                    onChange={(value) => binding.setValue(section.trailerState, value)}
                />
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <TextBox field={tribe} width={200} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.tribe, value)} />
                <YesNoBox field={schoolZone} load={loadYesNoOptions} width={150} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.schoolZone, value)} />
                <div className="w-100"><TextBox field={voidReason} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.voidReason, value)} /></div>
                <YesNoBox field={constructionWorkZone} load={loadYesNoOptions} width={120} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.constructionWorkZone, value)} />
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <TextBox field={assignment} width={180} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.assignment, value)} />
                <TextBox field={ethnicity} width={160} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.ethnicity, value)} />
                <YesNoBox field={transientStatus} load={loadYesNoOptions} width={130} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.transient, value)} />
                <YesNoBox field={witnessCaptured} load={loadYesNoOptions} width={260} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.witnessCaptured, value)} />
                <YesNoBox field={noLicensePlate} load={loadYesNoOptions} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.noLicensePlate, value)} />
            </FFormStackPanel>
        </FSection>
    );
}
