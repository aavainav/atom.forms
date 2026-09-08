import React from "react";
import { ISectionBinding, FBorder, FFormStackPanel, FSection } from "@forms/core";

import { ViolationSectionModel } from "../../models/citation-page/violation-section";
import { CheckBox, NumberBox, OptionBox, TextBox } from "../fields";

interface IViolationSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<ViolationSectionModel>;
}

/** Defines the speeding boxes of Section II of the Georgia uniform traffic citation. */
export const ViolationSection = ({ binding }: IViolationSectionProps): React.JSX.Element => {
    const section = binding.get();
    const twoLaneRoad = section.getTwoLaneRoad();
    const driverRequestedAccuracyCheck = section.getDriverRequestedAccuracyCheck();
    const vascar = section.getVascar();
    const laser = section.getLaser();
    const radar = section.getRadar();
    const clockedByPatrolVehicle = section.getClockedByPatrolVehicle();
    const clockedByOther = section.getClockedByOther();
    const serialNumber = section.getSerialNumber();
    const calibrationCheck = section.getCalibrationCheck();
    const clockedSpeed = section.getClockedSpeed();
    const speedZone = section.getSpeedZone();

    return (
        <FSection>
            <div className="text-center fw-bold mt-3">SECTION II - VIOLATION</div>
            <FBorder border="visible">
                <div className="p-2">
                    <CheckBox field={twoLaneRoad} onChange={(checked) => binding.setValue(section.twoLaneRoad, checked)} />
                    <CheckBox field={driverRequestedAccuracyCheck} onChange={(checked) => binding.setValue(section.driverRequestedAccuracyCheck, checked)} />
                    <OptionBox field={vascar} onSelect={() => binding.update((current) => current.selectSpeedDetection(current.vascar))} />
                    <OptionBox field={laser} onSelect={() => binding.update((current) => current.selectSpeedDetection(current.laser))} />
                    <OptionBox field={radar} onSelect={() => binding.update((current) => current.selectSpeedDetection(current.radar))} />
                </div>
            </FBorder>
            <FBorder border="visible">
                <p className="small m-3 mb-1">Within the State of Georgia, did commit the following offense: SPEEDING - Clocked by</p>
                <div className="p-2 pt-0">
                    <OptionBox field={clockedByPatrolVehicle} onSelect={() => binding.update((current) => current.selectClockedBy(current.clockedByPatrolVehicle))} />
                    <OptionBox field={clockedByOther} onSelect={() => binding.update((current) => current.selectClockedBy(current.clockedByOther))} />
                </div>
            </FBorder>
            <FFormStackPanel direction="horizontal">
                <div className="w-100"><TextBox field={serialNumber} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.serialNumber, value)} /></div>
                <div className="w-100"><TextBox field={calibrationCheck} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.calibrationCheck, value)} /></div>
                <NumberBox field={clockedSpeed} label="At (MPH)" width={140} borderEdges={["left", "top"]} onChange={(value) => binding.setValue(section.clockedSpeed, value)} />
                <NumberBox field={speedZone} label="In a (Zone)" width={140} borderEdges={["left", "top", "right"]} onChange={(value) => binding.setValue(section.speedZone, value)} />
            </FFormStackPanel>
        </FSection>
    );
};
