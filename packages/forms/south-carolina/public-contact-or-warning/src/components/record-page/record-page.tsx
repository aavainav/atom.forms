import React from "react";
import { useService } from "@common/react";
import { IControllerManager, IPageBinding, FDropzone, FFormStackPanel } from "@forms/core";

import { RecordPageModel } from "../../models/record-page/record-page";
import { RecordPagePersonDropzone } from "../../models/record-page/dropzones/record-page-person-dropzone";
import { RecordPageVehicleDropzone } from "../../models/record-page/dropzones/record-page-vehicle-dropzone";
import { IPublicContactOrWarningService } from "../../services";

import { AgencySection } from "./agency-section";
import { PersonSection } from "./person-section";
import { PersonRaceSection } from "./person-race-section";
import { LatitudeLongitudeSection } from "./latitude-longitude-section";
import { RouteSection } from "./route-section";
import { StopSection } from "./stop-section";
import { VehicleSection } from "./vehicle-section";
import { OfficerSection } from "./officer-section";
import { NatureOfContactSection } from "./nature-of-contact-section";
import { PrimaryReasonSection } from "./primary-reason-section";
import { SearchesSection } from "./searches-section";

interface IRecordPageProps {
    /** The controllers belonging to the form this page is part of. */
    readonly controllers: IControllerManager;
    /** Binds this page instance to the form controller. */
    readonly binding: IPageBinding<RecordPageModel>;
}

/** Defines the record page of the public contact/warning form. */
export default function RecordPage({ controllers, binding }: IRecordPageProps): React.JSX.Element {
    const dragAndDropController = controllers.getDragAndDropController();
    
    const publicContactOrWarningService = useService<IPublicContactOrWarningService>(IPublicContactOrWarningService);
    const recordPage = binding.get();

    return (
        <>
            <AgencySection binding={binding.getSection(recordPage.agencySection)} />
            <FDropzone
                controller={dragAndDropController}
                dropzone={recordPage.getDropzone(RecordPagePersonDropzone)}
                onDrop={binding.mode === "viewable" ? undefined : (dropzone) => binding.update((page) => publicContactOrWarningService.applyPersonDropzone(page, dropzone))}
            >
                <PersonSection binding={binding.getSection(recordPage.personSection)} />
            </FDropzone>

            <FFormStackPanel direction="horizontal">
                <PersonRaceSection binding={binding.getSection(recordPage.personSection)} />
                <LatitudeLongitudeSection binding={binding.getSection(recordPage.personSection)} />
            </FFormStackPanel>

            <RouteSection binding={binding.getSection(recordPage.routeSection)} />
            <StopSection binding={binding.getSection(recordPage.stopSection)} />
            <FDropzone
                controller={dragAndDropController}
                dropzone={recordPage.getDropzone(RecordPageVehicleDropzone)}
                // the dropped make and model arrive as names, and turning them into the codes the record stores
                // means consulting value lists that have to be loaded, so the dropzone is resolved before it is
                // applied rather than inside the update
                onDrop={binding.mode === "viewable" ? undefined : (dropzone) => {
                    publicContactOrWarningService.resolveVehicleDropzone(dropzone)
                        .then((resolved) => binding.update((page) => publicContactOrWarningService.applyVehicleDropzone(page, resolved)));
                }}
            >
                <VehicleSection binding={binding.getSection(recordPage.vehicleSection)} />
            </FDropzone>
            <OfficerSection binding={binding.getSection(recordPage.officerSection)} />
            <NatureOfContactSection binding={binding.getSection(recordPage.natureOfContactSection)} />
            <PrimaryReasonSection binding={binding.getSection(recordPage.primaryReasonSection)} />
            <SearchesSection binding={binding.getSection(recordPage.searchesSection)} />
        </>
    );
}
