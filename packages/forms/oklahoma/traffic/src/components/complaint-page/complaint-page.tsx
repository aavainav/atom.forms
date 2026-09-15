import React from "react";
import { useService } from "@common/react";
import { IControllerManager, IPageBinding, FDropzone } from "@forms/core";

import { ComplaintPageModel } from "../../models/complaint-page/complaint-page";
import { ComplaintPageDefendantDropzone } from "../../models/complaint-page/dropzones/complaint-page-defendant-dropzone";
import { ComplaintPageVehicleDropzone } from "../../models/complaint-page/dropzones/complaint-page-vehicle-dropzone";
import { ComplaintPageViolationDropzone } from "../../models/complaint-page/dropzones/complaint-page-violation-dropzone";
import { IOKTrafficService } from "../../services";

import { ArraignmentSection } from "./arraignment-section";
import { DefendantSection } from "./defendant-section";
import { DescriptionSection } from "./description-section";
import { HeaderSection } from "./header-section";
import { LicenseSection } from "./license-section";
import { OffenseSection } from "./offense-section";
import { OfficerSection } from "./officer-section";
import { SwornSection } from "./sworn-section";
import { VehicleSection } from "./vehicle-section";
import { ViolationInformationSection } from "./violation-information-section";
import { ViolationSection } from "./violation-section";

interface IComplaintPageProps {
    /** The controllers belonging to the form this page is part of. */
    readonly controllers: IControllerManager;
    /** Binds this page instance to the form controller. */
    readonly binding: IPageBinding<ComplaintPageModel>;
    /** Whether the complaint page's fields are read-only. */
    readonly isReadOnly?: boolean;
}

/** Defines the complaint page of the Oklahoma City traffic citation form. */
export default function ComplaintPage({ controllers, binding, isReadOnly }: IComplaintPageProps): React.JSX.Element {
    const dragAndDropController = controllers.getDragAndDropController();

    const okTrafficService = useService<IOKTrafficService>(IOKTrafficService);
    const complaintPage = binding.get();

    return (
        <>
            <HeaderSection binding={binding.getSection(complaintPage.headerSection)} />

            <FDropzone
                controller={dragAndDropController}
                dropzone={complaintPage.getDropzone(ComplaintPageDefendantDropzone)}
                onDrop={isReadOnly ? undefined : (dropzone) => binding.update((page) => okTrafficService.applyDefendantDropzone(page, dropzone))}
            >
                <DefendantSection binding={binding.getSection(complaintPage.defendantSection)} />
            </FDropzone>

            <LicenseSection binding={binding.getSection(complaintPage.licenseSection)} />
            <DescriptionSection binding={binding.getSection(complaintPage.descriptionSection)} />

            <FDropzone
                controller={dragAndDropController}
                dropzone={complaintPage.getDropzone(ComplaintPageVehicleDropzone)}
                // the dropped make and model arrive as names, and turning them into the codes the form stores means
                // consulting value lists that have to be loaded, so the dropzone is resolved before it is applied
                // rather than inside the update
                onDrop={isReadOnly ? undefined : (dropzone) => {
                    okTrafficService.resolveVehicleDropzone(dropzone)
                        .then((resolved) => binding.update((page) => okTrafficService.applyVehicleDropzone(page, resolved)));
                }}
            >
                <VehicleSection binding={binding.getSection(complaintPage.vehicleSection)} />
            </FDropzone>

            <FDropzone
                controller={dragAndDropController}
                dropzone={complaintPage.getDropzone(ComplaintPageViolationDropzone)}
                onDrop={isReadOnly ? undefined : (dropzone) => binding.update((page) => okTrafficService.applyViolationDropzone(page, dropzone))}
            >
                <ViolationSection binding={binding.getSection(complaintPage.violationSection)} />
            </FDropzone>
            <OffenseSection binding={binding.getSection(complaintPage.offenseSection)} />
            <ViolationInformationSection binding={binding.getSection(complaintPage.violationInformationSection)} />
            <OfficerSection binding={binding.getSection(complaintPage.officerSection)} />
            <SwornSection binding={binding.getSection(complaintPage.swornSection)} />
            <ArraignmentSection binding={binding.getSection(complaintPage.arraignmentSection)} />
        </>
    );
}
