import React from "react";
import { ISectionBinding, FBorder, FFormStackPanel, FSection } from "@forms/core";

import { StatusSectionModel } from "../../models/citation-page/status-section";
import { OptionBox } from "../fields";

interface IStatusSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<StatusSectionModel>;
}

/** Defines the CDL, accident, injuries and fatalities row at the foot of Section I. */
export const StatusSection = ({ binding }: IStatusSectionProps): React.JSX.Element => {
    const section = binding.get();
    const cdlYes = section.getCdlYes();
    const cdlNo = section.getCdlNo();
    const accidentYes = section.getAccidentYes();
    const accidentNo = section.getAccidentNo();
    const injuriesYes = section.getInjuriesYes();
    const injuriesNo = section.getInjuriesNo();
    const fatalitiesYes = section.getFatalitiesYes();
    const fatalitiesNo = section.getFatalitiesNo();

    return (
        <FSection>
            <FBorder border="visible">
                <FFormStackPanel direction="horizontal">
                    <div className="p-2">
                        <span className="small fw-bold me-2">CDL</span>
                        <OptionBox field={cdlYes} onSelect={() => binding.update({ update: (current) => current.selectCdl(current.cdlYes) })} />
                        <OptionBox field={cdlNo} onSelect={() => binding.update({ update: (current) => current.selectCdl(current.cdlNo) })} />
                    </div>
                    <div className="p-2">
                        <span className="small fw-bold me-2">ACCIDENT</span>
                        <OptionBox field={accidentYes} onSelect={() => binding.update({ update: (current) => current.selectAccident(current.accidentYes) })} />
                        <OptionBox field={accidentNo} onSelect={() => binding.update({ update: (current) => current.selectAccident(current.accidentNo) })} />
                    </div>
                    <div className="p-2">
                        <span className="small fw-bold me-2">INJURIES</span>
                        <OptionBox field={injuriesYes} onSelect={() => binding.update({ update: (current) => current.selectInjuries(current.injuriesYes) })} />
                        <OptionBox field={injuriesNo} onSelect={() => binding.update({ update: (current) => current.selectInjuries(current.injuriesNo) })} />
                    </div>
                    <div className="p-2">
                        <span className="small fw-bold me-2">FATALITIES</span>
                        <OptionBox field={fatalitiesYes} onSelect={() => binding.update({ update: (current) => current.selectFatalities(current.fatalitiesYes) })} />
                        <OptionBox field={fatalitiesNo} onSelect={() => binding.update({ update: (current) => current.selectFatalities(current.fatalitiesNo) })} />
                    </div>
                </FFormStackPanel>
            </FBorder>
        </FSection>
    );
};
