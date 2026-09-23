import React from "react";
import { ISectionBinding, FBorder, FFormStackPanel, FSection } from "@forms/core";

import { ConditionsSectionModel } from "../../models/citation-page/conditions-section";
import { CheckBox, OptionBox } from "../fields";

interface IConditionsSectionProps {
    /** Binds this section to the form controller, supplying its current values and applying changes back to the form. */
    readonly binding: ISectionBinding<ConditionsSectionModel>;
}

/** The conditions bar at the foot of Section II, laid out as the paper lays it out -- five columns, each heading its own boxes, plus a commercial violation column of three independent flags. */
export const ConditionsSection = ({ binding }: IConditionsSectionProps): React.JSX.Element => {
    const section = binding.get();

    return (
        <FSection>
            <FBorder border="visible">
                <FFormStackPanel direction="horizontal">
                    <div className="w-100 p-2">
                        <div className="small fw-bold">WEATHER</div>
                        <OptionBox field={section.getWeatherClear()} onSelect={() => binding.update({ update: (current) => current.selectWeather(current.weatherClear) })} />
                        <OptionBox field={section.getWeatherCloudy()} onSelect={() => binding.update({ update: (current) => current.selectWeather(current.weatherCloudy) })} />
                        <OptionBox field={section.getWeatherRaining()} onSelect={() => binding.update({ update: (current) => current.selectWeather(current.weatherRaining) })} />
                        <OptionBox field={section.getWeatherOther()} onSelect={() => binding.update({ update: (current) => current.selectWeather(current.weatherOther) })} />
                    </div>
                    <div className="w-100 p-2">
                        <div className="small fw-bold">(A) ROAD</div>
                        <OptionBox field={section.getRoadDry()} onSelect={() => binding.update({ update: (current) => current.selectRoad(current.roadDry) })} />
                        <OptionBox field={section.getRoadWet()} onSelect={() => binding.update({ update: (current) => current.selectRoad(current.roadWet) })} />
                        <OptionBox field={section.getRoadIce()} onSelect={() => binding.update({ update: (current) => current.selectRoad(current.roadIce) })} />
                        <OptionBox field={section.getRoadOther()} onSelect={() => binding.update({ update: (current) => current.selectRoad(current.roadOther) })} />
                    </div>
                    <div className="w-100 p-2">
                        <div className="small fw-bold">ROAD (B)</div>
                        <OptionBox field={section.getSurfaceConcrete()} onSelect={() => binding.update({ update: (current) => current.selectSurface(current.surfaceConcrete) })} />
                        <OptionBox field={section.getSurfaceBlacktop()} onSelect={() => binding.update({ update: (current) => current.selectSurface(current.surfaceBlacktop) })} />
                        <OptionBox field={section.getSurfaceDirt()} onSelect={() => binding.update({ update: (current) => current.selectSurface(current.surfaceDirt) })} />
                        <OptionBox field={section.getSurfaceOther()} onSelect={() => binding.update({ update: (current) => current.selectSurface(current.surfaceOther) })} />
                    </div>
                    <div className="w-100 p-2">
                        <div className="small fw-bold">TRAFFIC</div>
                        <OptionBox field={section.getTrafficLight()} onSelect={() => binding.update({ update: (current) => current.selectTraffic(current.trafficLight) })} />
                        <OptionBox field={section.getTrafficMedium()} onSelect={() => binding.update({ update: (current) => current.selectTraffic(current.trafficMedium) })} />
                        <OptionBox field={section.getTrafficHeavy()} onSelect={() => binding.update({ update: (current) => current.selectTraffic(current.trafficHeavy) })} />
                    </div>
                    <div className="w-100 p-2">
                        <div className="small fw-bold">LIGHTING</div>
                        <OptionBox field={section.getLightingDaylight()} onSelect={() => binding.update({ update: (current) => current.selectLighting(current.lightingDaylight) })} />
                        <OptionBox field={section.getLightingDarkness()} onSelect={() => binding.update({ update: (current) => current.selectLighting(current.lightingDarkness) })} />
                        <OptionBox field={section.getLightingOther()} onSelect={() => binding.update({ update: (current) => current.selectLighting(current.lightingOther) })} />
                    </div>
                    <div className="w-100 p-2">
                        <div className="small fw-bold">COMMERCIAL VIOLATION INFORMATION</div>
                        <CheckBox field={section.getSixteenPlusPassengers()} onChange={(checked) => binding.setValue(section.sixteenPlusPassengers, checked)} />
                        <CheckBox field={section.getCommercialVehicle()} onChange={(checked) => binding.setValue(section.commercialVehicle, checked)} />
                        <CheckBox field={section.getHazardousMaterial()} onChange={(checked) => binding.setValue(section.hazardousMaterial, checked)} />
                    </div>
                </FFormStackPanel>
            </FBorder>
        </FSection>
    );
};
