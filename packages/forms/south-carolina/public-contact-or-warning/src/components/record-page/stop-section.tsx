import React, { useCallback } from "react";
import { useService } from "@common/react";
import { IOptionValue, ISectionBinding, FFieldControl, FFieldInput, FFieldSelect, FFormStackPanel, FSection } from "@forms/core";

import { StopSectionModel } from "../../models/record-page/stop-section";
import { IPublicContactOrWarningService } from "../../services";

interface IStopSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<StopSectionModel>;
}

/** Defines the stop section (CTY/Date/Time/CAD Call Number) of the public contact/warning record. */
export const StopSection = ({ binding }: IStopSectionProps): React.JSX.Element => {
    const section = binding.get();
    const publicContactOrWarningService = useService<IPublicContactOrWarningService>(IPublicContactOrWarningService);

    const county = section.getCounty();
    const date = section.getDate();
    const time = section.getTime();
    const cadCallNumber = section.getCadCallNumber();

    const loadCountyOptions = useCallback(() => publicContactOrWarningService.getCountyOptions(), [publicContactOrWarningService]);

    return (
        <FSection>
            <FFormStackPanel direction="horizontal" height={44}>
                <FFieldControl borderEdges={["top", "bottom"]} label={county.label} labelFor={county.id} width={75}>
                    <FFieldSelect
                        id={county.id}
                        disabled={!county.getIsEnabled()}
                        format="valueOnly"
                        invalid={county.getHasError()}
                        options={loadCountyOptions}
                        value={county.getValue()}
                        onChange={(value) => binding.setValue(section.county, value as IOptionValue)}
                    />
                </FFieldControl>
                <FFieldControl borderEdges={["left", "top", "bottom"]} label={date.label} labelFor={date.id} width={178}>
                    <FFieldInput
                        id={date.id}
                        disabled={!date.getIsEnabled()}
                        invalid={date.getHasError()}
                        type="date"
                        value={date.getValue()}
                        onChange={(value) => binding.setValue(section.date, value)}
                    />
                </FFieldControl>
                <FFieldControl borderEdges={["left", "top", "bottom"]} label={time.label} labelFor={time.id} width={130}>
                    <FFieldInput
                        id={time.id}
                        disabled={!time.getIsEnabled()}
                        invalid={time.getHasError()}
                        value={time.getValue()}
                        onChange={(value) => binding.setValue(section.time, value)}
                    />
                </FFieldControl>
                <FFieldControl borderEdges={["left", "top", "bottom"]} label={cadCallNumber.label} labelFor={cadCallNumber.id} width={205}>
                    <FFieldInput
                        id={cadCallNumber.id}
                        disabled={!cadCallNumber.getIsEnabled()}
                        invalid={cadCallNumber.getHasError()}
                        value={cadCallNumber.getValue()}
                        onChange={(value) => binding.setValue(section.cadCallNumber, value)}
                    />
                </FFieldControl>
            </FFormStackPanel>
        </FSection>
    );
};
