import React from "react";
import { useService } from "@common/react";
import { IControllerManager, IPageBinding, FDropzone } from "@forms/core";

import { CitationPageModel } from "../../models/citation-page/citation-page";
import { CitationPageVehicleDropzone } from "../../models/citation-page/dropzones/citation-page-vehicle-dropzone";
import { CitationPageViolationDropzone } from "../../models/citation-page/dropzones/citation-page-violation-dropzone";
import { CitationPageViolatorDropzone } from "../../models/citation-page/dropzones/citation-page-violator-dropzone";
import { IGAUTCService } from "../../services";

import { CertificationSection } from "./certification-section";
import { ConditionsSection } from "./conditions-section";
import { DuiSection } from "./dui-section";
import { HeaderSection } from "./header-section";
import { LocationSection } from "./location-section";
import { OffenseSection } from "./offense-section";
import { OfficerSection } from "./officer-section";
import { StatusSection } from "./status-section";
import { SummonsSection } from "./summons-section";
import { VehicleSection } from "./vehicle-section";
import { ViolationSection } from "./violation-section";
import { ViolatorSection } from "./violator-section";

interface ICitationPageProps {
    /** The controllers belonging to the form this page is part of. */
    readonly controllers: IControllerManager;
    /** Binds this page instance to the form controller. */
    readonly binding: IPageBinding<CitationPageModel>;
}

/** Defines the citation page of the Georgia uniform traffic citation - the face of the printed form. */
export default function CitationPage({ controllers, binding }: ICitationPageProps): React.JSX.Element {
    const dragAndDropController = controllers.getDragAndDropController();

    const gaUtcService = useService<IGAUTCService>(IGAUTCService);
    const citationPage = binding.get();

    return (
        <>
            <HeaderSection binding={binding.getSection(citationPage.headerSection)} />

            <FDropzone
                controller={dragAndDropController}
                dropzone={citationPage.getDropzone(CitationPageViolatorDropzone)}
                onDrop={binding.mode !== "editable" ? undefined : (dropzone) => binding.update({ update: (page) => gaUtcService.applyViolatorDropzone(page, dropzone) })}
            >
                <ViolatorSection binding={binding.getSection(citationPage.violatorSection)} />
            </FDropzone>

            <FDropzone
                controller={dragAndDropController}
                dropzone={citationPage.getDropzone(CitationPageVehicleDropzone)}
                // the dropped make and model arrive as names, and turning them into the codes the citation stores
                // means consulting value lists that have to be loaded, so the dropzone is resolved before it is
                // applied rather than inside the update
                onDrop={binding.mode !== "editable" ? undefined : (dropzone) => {
                    gaUtcService.resolveVehicleDropzone(dropzone)
                        .then((resolved) => binding.update({ update: (page) => gaUtcService.applyVehicleDropzone(page, resolved) }));
                }}
            >
                <VehicleSection binding={binding.getSection(citationPage.vehicleSection)} />
            </FDropzone>

            <StatusSection binding={binding.getSection(citationPage.statusSection)} />
            <ViolationSection binding={binding.getSection(citationPage.violationSection)} />
            <DuiSection binding={binding.getSection(citationPage.duiSection)} />
            <FDropzone
                controller={dragAndDropController}
                dropzone={citationPage.getDropzone(CitationPageViolationDropzone)}
                onDrop={binding.mode !== "editable" ? undefined : (dropzone) => binding.update({ update: (page) => gaUtcService.applyViolationDropzone(page, dropzone) })}
            >
                <OffenseSection binding={binding.getSection(citationPage.offenseSection)} />
            </FDropzone>
            <ConditionsSection binding={binding.getSection(citationPage.conditionsSection)} />
            <LocationSection binding={binding.getSection(citationPage.locationSection)} />
            <OfficerSection binding={binding.getSection(citationPage.officerSection)} />
            <SummonsSection binding={binding.getSection(citationPage.summonsSection)} />
            <CertificationSection binding={binding.getSection(citationPage.certificationSection)} />
        </>
    );
}
