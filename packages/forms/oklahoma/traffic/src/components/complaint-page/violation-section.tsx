import React, { useCallback } from "react";
import { useService } from "@common/react";
import { ISectionBinding, FFormStackPanel, FSection } from "@forms/core";

import { ViolationSectionModel } from "../../models/complaint-page/violation-section";
import { IOKTrafficService } from "../../services";
import { SelectBox, TextBox, YesNoBox } from "../fields";

interface IViolationSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<ViolationSectionModel>;
}

/** Defines the violation section of the Oklahoma City traffic citation form's complaint page. */
export const ViolationSection = ({ binding }: IViolationSectionProps): React.JSX.Element => {
    const section = binding.get();
    const okTrafficService = useService<IOKTrafficService>(IOKTrafficService);

    const date = section.getDate();
    const time = section.getTime();
    const county = section.getCounty();
    const isBlock = section.getIsBlock();
    const location = section.getLocation();
    const municipalCode = section.getMunicipalCode();
    const offenseCode = section.getOffenseCode();
    const byActOf = section.getByActOf();

    const loadCountyOptions = useCallback(() => okTrafficService.getCountyOptions(), [okTrafficService]);
    const loadYesNoOptions = useCallback(() => okTrafficService.getYesNoOptions(), [okTrafficService]);

    return (
        <FSection>
            <div className="text-center fw-bold mt-3">
                <div>VIOLATION</div>
                <div>WITHIN THE CORPORATE LIMITS OF THE CITY OF OKLAHOMA CITY DID COMMIT THE FOLLOWING OFFENSE</div>
            </div>
            <FFormStackPanel direction="horizontal">
                <TextBox field={date} type="date" width={170} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.date, value)} />
                <TextBox field={time} width={140} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.time, value)} />
                <SelectBox
                    field={county}
                    load={loadCountyOptions}
                    width={200}
                    borderEdges={["left", "top"]}
                    onChange={(value) => binding.setValue(section.county, value)}
                />
                <YesNoBox field={isBlock} load={loadYesNoOptions} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.isBlock, value)} />
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <div className="w-100"><TextBox field={location} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.location, value)} /></div>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <TextBox field={municipalCode} width={170} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.municipalCode, value)} />
                <TextBox field={offenseCode} width={170} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.offenseCode, value)} />
                <div className="w-100"><TextBox field={byActOf} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.byActOf, value)} /></div>
            </FFormStackPanel>
        </FSection>
    );
}
