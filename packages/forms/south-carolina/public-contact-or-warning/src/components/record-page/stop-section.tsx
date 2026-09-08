import React, { useCallback } from "react";
import { useService } from "@common/react";
import { IOptionValue, ISectionBinding, IValueListController, FFieldControl, FFieldInput, FFieldSelect, FFormStackPanel, FSection } from "@forms/core";

import { StopSectionModel } from "../../models/record-page/stop-section";
import { IPublicContactOrWarningService } from "../../services";
import { PublicContactOrWarningValueListId } from "../../value-lists";

interface IStopSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<StopSectionModel>;
    /** Caches the value lists backing this section's option fields, so they are only loaded once per form. */
    readonly valueListController: IValueListController;
}

/** Defines the stop section (CTY/Date/Time/CAD Call Number) of the public contact/warning record. */
export const StopSection = ({ binding, valueListController }: IStopSectionProps): React.JSX.Element => {
    const section = binding.get();
    const publicContactOrWarningService = useService<IPublicContactOrWarningService>(IPublicContactOrWarningService);

    const county = section.getCounty();
    const date = section.getDate();
    const time = section.getTime();
    const cadCallNumber = section.getCadCallNumber();

    const loadCountyOptions = useCallback(() => publicContactOrWarningService.getCountyOptions(), [publicContactOrWarningService]);

    return (
        <FSection>
            <FFormStackPanel height={44} direction="horizontal">
                <FFieldControl width={75} label={county.label} labelFor={county.id} borderEdges={["top", "bottom"]}>
                    <FFieldSelect
                        id={county.id}
                        cacheKey={PublicContactOrWarningValueListId.county}
                        controller={valueListController}
                        disabled={!county.getIsEnabled()}
                        format="descriptionOnly"
                        invalid={county.getHasError()}
                        options={loadCountyOptions}
                        value={county.getValue()}
                        onChange={(value) => binding.setValue(section.county, value as IOptionValue)}
                    />
                </FFieldControl>
                <FFieldControl width={178} label={date.label} labelFor={date.id} borderEdges={["left", "top", "bottom"]}>
                    <FFieldInput
                        type="date"
                        id={date.id}
                        disabled={!date.getIsEnabled()}
                        invalid={date.getHasError()}
                        value={date.getValue()}
                        onChange={(value) => binding.setValue(section.date, value)}
                    />
                </FFieldControl>
                <FFieldControl width={130} label={time.label} labelFor={time.id} borderEdges={["left", "top", "bottom"]}>
                    <FFieldInput
                        id={time.id}
                        disabled={!time.getIsEnabled()}
                        invalid={time.getHasError()}
                        value={time.getValue()}
                        onChange={(value) => binding.setValue(section.time, value)}
                    />
                </FFieldControl>
                <FFieldControl width={205} label={cadCallNumber.label} labelFor={cadCallNumber.id} borderEdges={["left", "top", "bottom"]}>
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
