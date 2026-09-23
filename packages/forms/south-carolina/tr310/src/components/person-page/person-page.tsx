import React from "react";
import { useService } from "@common/react";
import { IControllerManager, IPageBinding, FDropzone } from "@forms/core";

import { PersonPageModel } from "../../models/person-page/person-page";
import { PersonPagePersonDropzone } from "../../models/person-page/dropzones/person-page-person-dropzone";
import { ITR310Service } from "../../services";

import { PersonHeaderSection } from "./person-header-section";
import { PersonSection } from "./person-section";
import { DriverLicenseSection } from "./driver-license-section";
import { DriverActionsSection } from "./driver-actions-section";
import { OccupantSection } from "./occupant-section";
import { NonMotoristSection } from "./non-motorist-section";
import { InjurySection } from "./injury-section";
import { SafetyEquipmentSection } from "./safety-equipment-section";
import { AlcoholDrugsSection } from "./alcohol-drugs-section";
import { PassengersSection } from "./passengers-section";
import { PersonOfficerSection } from "./person-officer-section";

interface IPersonPageProps {
    /** The controllers belonging to the form this page is part of. */
    readonly controllers: IControllerManager;
    /** Binds this page instance to the form controller. */
    readonly binding: IPageBinding<PersonPageModel>;
}

/** Defines one person page of the TR-310, recording a driver or a non-motorist and the passengers riding with them. */
export default function PersonPage({ controllers, binding }: IPersonPageProps): React.JSX.Element {
    const dragAndDropController = controllers.getDragAndDropController();

    const tr310Service = useService<ITR310Service>(ITR310Service);
    const page = binding.get();

    return (
        <>
            <PersonHeaderSection binding={binding.getSection(page.personHeaderSection)} />
            <FDropzone
                controller={dragAndDropController}
                dropzone={page.getDropzone(PersonPagePersonDropzone)}
                onDrop={binding.mode !== "editable" ? undefined : (dropzone) => binding.update({ update: (current) => tr310Service.applyPersonDropzone(current, dropzone) })}
            >
                <PersonSection binding={binding.getSection(page.personSection)} />
            </FDropzone>
            <DriverLicenseSection binding={binding.getSection(page.driverLicenseSection)} />
            <DriverActionsSection binding={binding.getSection(page.driverActionsSection)} />
            <OccupantSection binding={binding.getSection(page.occupantSection)} />
            <NonMotoristSection binding={binding.getSection(page.nonMotoristSection)} />
            <InjurySection binding={binding.getSection(page.injurySection)} />
            <SafetyEquipmentSection binding={binding.getSection(page.safetyEquipmentSection)} />
            <AlcoholDrugsSection binding={binding.getSection(page.alcoholDrugsSection)} />
            <PassengersSection binding={binding.getSection(page.passengersSection)} />
            <PersonOfficerSection binding={binding.getSection(page.personOfficerSection)} />
        </>
    );
}
