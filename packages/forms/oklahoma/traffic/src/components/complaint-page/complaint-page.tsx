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
}

/** Defines the complaint page of the Oklahoma City traffic citation form. */
export default function ComplaintPage({ controllers, binding }: IComplaintPageProps): React.JSX.Element {
    const dragAndDropController = controllers.getDragAndDropController();

    const okTrafficService = useService<IOKTrafficService>(IOKTrafficService);
    const complaintPage = binding.get();

    return (
        <>
            <HeaderSection binding={binding.getSection(complaintPage.headerSection)} />

            <FDropzone
                binding={binding}
                controller={dragAndDropController}
                dropzone={complaintPage.getDropzone(ComplaintPageDefendantDropzone)}
                onDrop={(dropzone) => binding.update({ update: (page) => okTrafficService.applyDefendantDropzone(page, dropzone), reason: { kind: "dropped", type: dropzone.type } })}
            >
                <DefendantSection binding={binding.getSection(complaintPage.defendantSection)} />
            </FDropzone>

            <LicenseSection binding={binding.getSection(complaintPage.licenseSection)} />
            <DescriptionSection binding={binding.getSection(complaintPage.descriptionSection)} />

            <FDropzone
                binding={binding}
                controller={dragAndDropController}
                dropzone={complaintPage.getDropzone(ComplaintPageVehicleDropzone)}
                // the dropped make and model arrive as names, and turning them into the codes the form stores means
                // consulting value lists that have to be loaded, so the dropzone is resolved before it is applied
                // rather than inside the update
                onDrop={(dropzone) => {
                    return okTrafficService.resolveVehicleDropzone(dropzone)
                        .then((resolved) => binding.update({ update: (page) => okTrafficService.applyVehicleDropzone(page, resolved), reason: { kind: "dropped", type: dropzone.type } }));
                }}
            >
                <VehicleSection binding={binding.getSection(complaintPage.vehicleSection)} />
            </FDropzone>

            <FDropzone
                binding={binding}
                controller={dragAndDropController}
                dropzone={complaintPage.getDropzone(ComplaintPageViolationDropzone)}
                onDrop={(dropzone) => binding.update({ update: (page) => okTrafficService.applyViolationDropzone(page, dropzone), reason: { kind: "dropped", type: dropzone.type } })}
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
