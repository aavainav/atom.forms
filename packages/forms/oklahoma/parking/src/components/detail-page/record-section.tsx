import React, { useCallback } from "react";
import { useService } from "@common/react";
import { IOptionValue, ISectionBinding, IValueListController, FFieldControl, FFieldInput, FFieldSelect, FFormStackPanel, FSection } from "@forms/core";

import { RecordSectionModel } from "../../models/detail-page/record-section";
import { IOKParkingService } from "../../services";
import { OKParkingValueListId } from "../../value-lists";

interface IRecordSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<RecordSectionModel>;
    /** Caches the value lists backing this section's option fields, so they are only loaded once per form. */
    readonly valueListController: IValueListController;
}

/** Defines the record section of the Oklahoma City parking violation form's detail page. */
export const RecordSection = ({ binding, valueListController }: IRecordSectionProps): React.JSX.Element => {
    const section = binding.get();
    const okParkingService = useService<IOKParkingService>(IOKParkingService);

    const citationNumber = section.getCitationNumber();
    const county = section.getCounty();
    const beat = section.getBeat();
    const tribe = section.getTribe();
    const voidReason = section.getVoidReason();

    const loadCountyOptions = useCallback(() => okParkingService.getCountyOptions(), [okParkingService]);

    return (
        <FSection>
            <FFormStackPanel direction="horizontal">
                <FFieldControl width={260} label={citationNumber.label} labelFor={citationNumber.id} borderEdges={["left", "top"]}>
                    <FFieldInput
                        id={citationNumber.id}
                        alphanumeric
                        disabled={!citationNumber.getIsEnabled()}
                        invalid={citationNumber.getHasError()}
                        value={citationNumber.getValue()}
                        onChange={(value) => binding.setValue(section.citationNumber, value)}
                    />
                </FFieldControl>
                <FFieldControl width={220} label={county.label} labelFor={county.id} borderEdges={["left", "top", "right"]}>
                    <FFieldSelect
                        id={county.id}
                        cacheKey={OKParkingValueListId.county}
                        controller={valueListController}
                        disabled={!county.getIsEnabled()}
                        format="descriptionOnly"
                        invalid={county.getHasError()}
                        options={loadCountyOptions}
                        searchable
                        value={county.getValue()}
                        onChange={(value) => binding.setValue(section.county, value as IOptionValue)}
                    />
                </FFieldControl>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <FFieldControl width={130} label={beat.label} labelFor={beat.id} borderEdges={["left", "top"]}>
                    <FFieldInput
                        id={beat.id}
                        alphanumeric
                        disabled={!beat.getIsEnabled()}
                        invalid={beat.getHasError()}
                        value={beat.getValue()}
                        onChange={(value) => binding.setValue(section.beat, value)}
                    />
                </FFieldControl>
                <FFieldControl width={200} label={tribe.label} labelFor={tribe.id} borderEdges={["left", "top"]}>
                    <FFieldInput
                        id={tribe.id}
                        disabled={!tribe.getIsEnabled()}
                        invalid={tribe.getHasError()}
                        value={tribe.getValue()}
                        onChange={(value) => binding.setValue(section.tribe, value)}
                    />
                </FFieldControl>
                <div className="w-100">
                    <FFieldControl label={voidReason.label} labelFor={voidReason.id} borderEdges={["left", "top", "right"]}>
                        <FFieldInput
                            id={voidReason.id}
                            disabled={!voidReason.getIsEnabled()}
                            invalid={voidReason.getHasError()}
                            value={voidReason.getValue()}
                            onChange={(value) => binding.setValue(section.voidReason, value)}
                        />
                    </FFieldControl>
                </div>
            </FFormStackPanel>
        </FSection>
    );
}
