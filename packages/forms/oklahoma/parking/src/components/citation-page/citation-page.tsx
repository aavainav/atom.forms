import React from "react";
import { useService } from "@common/react";
import { IControllerManager, IPageBinding, FDropzone, FLabel } from "@forms/core";

import { CitationPageModel } from "../../models/citation-page/citation-page";
import { CitationPageVehicleDropzone } from "../../models/citation-page/dropzones/citation-page-vehicle-dropzone";
import { CitationPageViolationDropzone } from "../../models/citation-page/dropzones/citation-page-violation-dropzone";
import { IOKParkingService } from "../../services";

import { CourtSection } from "./court-section";
import { OfficerSection } from "./officer-section";
import { PaymentSection } from "./payment-section";
import { VehicleSection } from "./vehicle-section";
import { ViolationSection } from "./violation-section";

interface ICitationPageProps {
    /** The controllers belonging to the form this page is part of. */
    readonly controllers: IControllerManager;
    /** Binds this page instance to the form controller. */
    readonly binding: IPageBinding<CitationPageModel>;
}

/** Defines the citation page of the Oklahoma City parking violation form. */
export default function CitationPage({ controllers, binding }: ICitationPageProps): React.JSX.Element {
    const dragAndDropController = controllers.getDragAndDropController();

    const okParkingService = useService<IOKParkingService>(IOKParkingService);
    const citationPage = binding.get();

    return (
        <>
            <div className="text-center mb-3">
                <FLabel fontSize="4" textAlignment="center">Parking Violation</FLabel>
                <div className="fw-bold">Oklahoma City Municipal Court</div>
            </div>

            <FDropzone
                binding={binding}
                controller={dragAndDropController}
                dropzone={citationPage.getDropzone(CitationPageViolationDropzone)}
                onDrop={(dropzone) => binding.update({ update: (page) => okParkingService.applyViolationDropzone(page, dropzone), reason: { kind: "dropped", type: dropzone.type } })}
            >
                <ViolationSection binding={binding.getSection(citationPage.violationSection)} />
            </FDropzone>
            <PaymentSection binding={binding.getSection(citationPage.paymentSection)} />
            <CourtSection binding={binding.getSection(citationPage.courtSection)} />

            <FDropzone
                binding={binding}
                controller={dragAndDropController}
                dropzone={citationPage.getDropzone(CitationPageVehicleDropzone)}
                // the dropped make arrives as a name, and turning it into the code the form stores means consulting
                // a value list that has to be loaded, so the dropzone is resolved before it is applied rather than
                // inside the update
                onDrop={(dropzone) => {
                    return okParkingService.resolveVehicleDropzone(dropzone)
                        .then((resolved) => binding.update({ update: (page) => okParkingService.applyVehicleDropzone(page, resolved), reason: { kind: "dropped", type: dropzone.type } }));
                }}
            >
                <VehicleSection binding={binding.getSection(citationPage.vehicleSection)} />
            </FDropzone>

            <OfficerSection binding={binding.getSection(citationPage.officerSection)} />
        </>
    );
}
