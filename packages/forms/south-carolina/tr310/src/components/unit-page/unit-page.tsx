import React from "react";
import { useService } from "@common/react";
import { IControllerManager, IPageBinding, FDropzone } from "@forms/core";

import { UnitPageModel } from "../../models/unit-page/unit-page";
import { UnitPageOwnerDropzone } from "../../models/unit-page/dropzones/unit-page-owner-dropzone";
import { UnitPageVehicleDropzone } from "../../models/unit-page/dropzones/unit-page-vehicle-dropzone";
import { ITR310Service } from "../../services";

import { UnitHeaderSection } from "./unit-header-section";
import { VehicleSection } from "./vehicle-section";
import { InsuranceSection } from "./insurance-section";
import { OwnerSection } from "./owner-section";
import { TravelSection } from "./travel-section";
import { DamageSection } from "./damage-section";
import { UnitTypeSection } from "./unit-type-section";
import { EventsSection } from "./events-section";
import { RoadwaySection } from "./roadway-section";
import { ViolationsSection } from "./violations-section";
import { UnitOfficerSection } from "./unit-officer-section";

interface IUnitPageProps {
    /** The controllers belonging to the form this page is part of. */
    readonly controllers: IControllerManager;
    /** Binds this page instance to the form controller. */
    readonly binding: IPageBinding<UnitPageModel>;
}

/** Defines one unit page of the TR-310, recording a vehicle involved in the collision and its owner. */
export default function UnitPage({ controllers, binding }: IUnitPageProps): React.JSX.Element {
    const dragAndDropController = controllers.getDragAndDropController();

    const tr310Service = useService<ITR310Service>(ITR310Service);
    const page = binding.get();

    return (
        <>
            <UnitHeaderSection binding={binding.getSection(page.unitHeaderSection)} />
            <FDropzone
                controller={dragAndDropController}
                dropzone={page.getDropzone(UnitPageVehicleDropzone)}
                // the dropped make and model arrive as names, and turning them into the codes the report stores
                // means consulting value lists that have to be loaded, so the dropzone is resolved before it is
                // applied rather than inside the update
                onDrop={binding.mode !== "editable" ? undefined : (dropzone) => {
                    tr310Service.resolveVehicleDropzone(dropzone)
                        .then((resolved) => binding.update((current) => tr310Service.applyVehicleDropzone(current, resolved)));
                }}
            >
                <VehicleSection binding={binding.getSection(page.vehicleSection)} />
            </FDropzone>
            <InsuranceSection binding={binding.getSection(page.insuranceSection)} />
            <FDropzone
                controller={dragAndDropController}
                dropzone={page.getDropzone(UnitPageOwnerDropzone)}
                onDrop={binding.mode !== "editable" ? undefined : (dropzone) => binding.update((current) => tr310Service.applyOwnerDropzone(current, dropzone))}
            >
                <OwnerSection binding={binding.getSection(page.ownerSection)} />
            </FDropzone>
            <TravelSection binding={binding.getSection(page.travelSection)} />
            <DamageSection binding={binding.getSection(page.damageSection)} />
            <UnitTypeSection binding={binding.getSection(page.unitTypeSection)} />
            <EventsSection binding={binding.getSection(page.eventsSection)} />
            <RoadwaySection binding={binding.getSection(page.roadwaySection)} />
            <ViolationsSection binding={binding.getSection(page.violationsSection)} />
            <UnitOfficerSection binding={binding.getSection(page.unitOfficerSection)} />
        </>
    );
}
