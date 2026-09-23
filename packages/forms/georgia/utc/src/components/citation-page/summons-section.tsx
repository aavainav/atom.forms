import React from "react";
import { ISectionBinding, FBorder, FFormStackPanel, FSection } from "@forms/core";

import { SummonsSectionModel } from "../../models/citation-page/summons-section";
import { OptionBox, TextBox, twoDigitBoxWidth } from "../fields";

interface ISummonsSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<SummonsSectionModel>;
}

/** Defines Section IV (Summons) of the Georgia uniform traffic citation. */
export const SummonsSection = ({ binding }: ISummonsSectionProps): React.JSX.Element => {
    const section = binding.get();
    const appearanceDay = section.getAppearanceDay();
    const appearanceMonth = section.getAppearanceMonth();
    const appearanceYear = section.getAppearanceYear();
    const hour = section.getHour();
    const minute = section.getMinute();
    const am = section.getAm();
    const pm = section.getPm();
    const courtName = section.getCourtName();
    const city = section.getCity();
    const copy = section.getCopy();
    const jail = section.getJail();
    const licenseDisplayedYes = section.getLicenseDisplayedYes();
    const licenseDisplayedNo = section.getLicenseDisplayedNo();
    const releaseTo = section.getReleaseTo();
    const signature = section.getSignature();

    return (
        <FSection>
            <div className="text-center fw-bold mt-3">SECTION IV - SUMMONS</div>
            <p className="small m-3 mb-1">You are hereby ordered to appear in court to answer this charge on the</p>
            <FFormStackPanel direction="horizontal">
                <TextBox field={appearanceDay} width={twoDigitBoxWidth} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.appearanceDay, value)} />
                <div className="w-100"><TextBox field={appearanceMonth} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.appearanceMonth, value)} /></div>
                <TextBox field={appearanceYear} width={twoDigitBoxWidth} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.appearanceYear, value)} />
                <TextBox field={hour} label="At" width={twoDigitBoxWidth} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.hour, value)} />
                <TextBox field={minute} width={twoDigitBoxWidth} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.minute, value)} />
                <div className="p-2">
                    <OptionBox field={am} onSelect={() => binding.update({ update: (current) => current.selectMeridiem(current.am) })} />
                    <OptionBox field={pm} onSelect={() => binding.update({ update: (current) => current.selectMeridiem(current.pm) })} />
                </div>
            </FFormStackPanel>
            <FFormStackPanel direction="horizontal">
                <div className="w-100"><TextBox field={courtName} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.courtName, value)} /></div>
                <div className="w-100"><TextBox field={city} label="City (Georgia)" borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.city, value)} /></div>
            </FFormStackPanel>
            <FBorder border="visible">
                <div className="p-2">
                    <OptionBox field={copy} onSelect={() => binding.update({ update: (current) => current.selectDisposition(current.copy) })} />
                    <OptionBox field={jail} onSelect={() => binding.update({ update: (current) => current.selectDisposition(current.jail) })} />
                </div>
            </FBorder>
            <FBorder border="visible">
                <p className="small m-3">
                    <span className="fw-bold">NOTICE:</span> This citation shall constitute official notice to you that failure to appear
                    in Court at the date and time stated on this citation to dispose of the cited charges against you shall cause the
                    designated Court to forward your driver's license number to the Department of Driver Services, and your driver's
                    license may be suspended (Georgia Code 17-6-11 and 40-5-56). The suspension shall remain in effect until such time as
                    there is a satisfactory disposition in this matter or the Court notifies the Department of Driver Services.
                </p>
            </FBorder>
            <FBorder border="visible">
                <div className="p-2">
                    <span className="small fw-bold me-2">LICENSE DISPLAYED IN LIEU OF BAIL</span>
                    <OptionBox field={licenseDisplayedYes} onSelect={() => binding.update({ update: (current) => current.selectLicenseDisplayed(current.licenseDisplayedYes) })} />
                    <OptionBox field={licenseDisplayedNo} onSelect={() => binding.update({ update: (current) => current.selectLicenseDisplayed(current.licenseDisplayedNo) })} />
                </div>
            </FBorder>
            <FFormStackPanel direction="horizontal">
                <div className="w-100"><TextBox field={releaseTo} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.releaseTo, value)} /></div>
            </FFormStackPanel>
            <p className="small m-3 mb-1">Signature acknowledges service of this summons and receipt of copy of same.</p>
            <FFormStackPanel direction="horizontal">
                <div className="w-100"><TextBox field={signature} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.signature, value)} /></div>
            </FFormStackPanel>
        </FSection>
    );
};
