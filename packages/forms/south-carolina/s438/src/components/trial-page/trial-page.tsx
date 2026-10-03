import React from "react";
import { useService } from "@common/react";
import { IControllerManager, IPageBinding, FDropzone } from "@forms/core";

import { TrialPageModel } from "../../models/trial-page/trial-page";
import { TrialPageOwnerDropzone } from "../../models/trial-page/dropzones/trial-page-owner-dropzone";
import { TrialPageVehicleDropzone } from "../../models/trial-page/dropzones/trial-page-vehicle-dropzone";
import { TrialPageViolationDropzone } from "../../models/trial-page/dropzones/trial-page-violation-dropzone";
import { TrialPageViolatorDropzone } from "../../models/trial-page/dropzones/trial-page-violator-dropzone";
import { IS438CitationService } from "../../services";

import TrialArrestingOfficerSection from "./arresting-officer-section";
import TrialCourtInformationSection from "./court-information-section";
import TrialCourtSection from "./court-section";
import TrialFooterSection from "./footer-section";
import TrialHeaderSection from "./header-section";
import TrialOwnerSection from "./owner-section";
import TrialVehicleSection from "./vehicle-section";
import TrialViolationLocationSection from "./violation-location-section";
import TrialViolationSection from "./violation-section";
import TrialViolatorSection from "./violator-section";

interface ITrialPageProps {
    /** The controllers belonging to the form this page is part of. */
    readonly controllers: IControllerManager;
    /** Binds this page instance to the form controller. */
    readonly binding: IPageBinding<TrialPageModel>;
}

/** Defines the trial page of the S438 citation form -- the court's copy of the ticket. */
export default function TrialPage({ controllers, binding }: ITrialPageProps): React.JSX.Element {
    const dragAndDropController = controllers.getDragAndDropController();
    const s438CitationService = useService<IS438CitationService>(IS438CitationService);
    const trialPage = binding.get();

    return (
        <>
            <TrialHeaderSection binding={binding.getSection(trialPage.headerSection)} />
            <FDropzone
                binding={binding}
                controller={dragAndDropController}
                dropzone={trialPage.getDropzone(TrialPageViolatorDropzone)}
                onDrop={(dropzone) => binding.update({ update: (page) => s438CitationService.applyTrialViolatorDropzone(page, dropzone), reason: { kind: "dropped", type: dropzone.type } })}
            >
                <TrialViolatorSection binding={binding.getSection(trialPage.violatorSection)} />
            </FDropzone>
            <FDropzone
                binding={binding}
                controller={dragAndDropController}
                dropzone={trialPage.getDropzone(TrialPageVehicleDropzone)}
                onDrop={(dropzone) => binding.update({ update: (page) => s438CitationService.applyTrialVehicleDropzone(page, dropzone), reason: { kind: "dropped", type: dropzone.type } })}
            >
                <TrialVehicleSection binding={binding.getSection(trialPage.vehicleSection)} />
            </FDropzone>
            <FDropzone
                binding={binding}
                controller={dragAndDropController}
                dropzone={trialPage.getDropzone(TrialPageOwnerDropzone)}
                onDrop={(dropzone) => binding.update({ update: (page) => s438CitationService.applyTrialOwnerDropzone(page, dropzone), reason: { kind: "dropped", type: dropzone.type } })}
            >
                <TrialOwnerSection binding={binding.getSection(trialPage.ownerSection)} />
            </FDropzone>
            <div className="row g-0">
                <div className="col-12 text-center border border-dark border-bottom-0">
                    <small className="fw-bold">YOU ARE SUMMONED TO APPEAR BEFORE THE TRIAL COURT</small>
                </div>
            </div>
            <TrialCourtSection binding={binding.getSection(trialPage.courtSection)} />
            <FDropzone
                binding={binding}
                controller={dragAndDropController}
                dropzone={trialPage.getDropzone(TrialPageViolationDropzone)}
                onDrop={(dropzone) => binding.update({ update: (page) => s438CitationService.applyTrialViolationDropzone(page, dropzone), reason: { kind: "dropped", type: dropzone.type } })}
            >
                <TrialViolationSection binding={binding.getSection(trialPage.violationSection)} />
            </FDropzone>
            <TrialViolationLocationSection binding={binding.getSection(trialPage.violationLocationSection)} />
            <TrialArrestingOfficerSection binding={binding.getSection(trialPage.arrestingOfficerSection)} />
            <TrialCourtInformationSection binding={binding.getSection(trialPage.courtInformationSection)} />
            <TrialFooterSection binding={binding.getSection(trialPage.footerSection)} />
        </>
    );
}
