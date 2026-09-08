import React from "react";
import { ISectionBinding, FFormStackPanel, FSection } from "@forms/core";

import { HeaderSectionModel } from "../../models/citation-page/header-section";
import { OptionBox, TextBox, twoDigitBoxWidth } from "../fields";

interface IHeaderSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<HeaderSectionModel>;
}

/** Defines the header of the Georgia uniform traffic citation, above Section I. */
export const HeaderSection = ({ binding }: IHeaderSectionProps): React.JSX.Element => {
    const section = binding.get();
    const cicaNumber = section.getCicaNumber();
    const ncicNumber = section.getNcicNumber();
    const citationNumber = section.getCitationNumber();
    const month = section.getMonth();
    const day = section.getDay();
    const year = section.getYear();
    const hour = section.getHour();
    const minute = section.getMinute();
    const am = section.getAm();
    const pm = section.getPm();

    return (
        <FSection>
            <div className="text-center fw-bold mt-3">
                <div>GEORGIA</div>
                <div>UNIFORM TRAFFIC CITATION, SUMMONS, AND ACCUSATION</div>
                <div className="small fw-normal">CITY OF ATLANTA - DEPARTMENT OF POLICE</div>
            </div>
            <FFormStackPanel direction="horizontal">
                <div className="w-100"><TextBox field={cicaNumber} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.cicaNumber, value)} /></div>
                <div className="w-100"><TextBox field={ncicNumber} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.ncicNumber, value)} /></div>
                <div className="w-100"><TextBox field={citationNumber} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.citationNumber, value)} /></div>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <TextBox field={month} width={130} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.month, value)} />
                <TextBox field={day} width={twoDigitBoxWidth} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.day, value)} />
                <TextBox field={year} width={twoDigitBoxWidth} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.year, value)} />
                <TextBox field={hour} label="At" width={twoDigitBoxWidth} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.hour, value)} />
                <TextBox field={minute} width={twoDigitBoxWidth} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.minute, value)} />
                <div className="p-2">
                    <OptionBox field={am} onSelect={() => binding.update((current) => current.selectMeridiem(current.am))} />
                    <OptionBox field={pm} onSelect={() => binding.update((current) => current.selectMeridiem(current.pm))} />
                </div>
            </FFormStackPanel>
        </FSection>
    );
};
