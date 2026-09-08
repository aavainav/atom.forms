import React from "react";
import { useService } from "@common/react";
import { IControllerManager, IPageBinding, FDropzone } from "@forms/core";

import { FrontPageModel } from "../../models/front-page/front-page";
import { FrontPageOwnerDropzone } from "../../models/front-page/dropzones/front-page-owner-dropzone";
import { FrontPageVehicleDropzone } from "../../models/front-page/dropzones/front-page-vehicle-dropzone";
import { FrontPageViolatorDropzone } from "../../models/front-page/dropzones/front-page-violator-dropzone";
import { IS438CitationService } from "../../services";

import HeaderSection from "./header-section";
import ViolatorSection from "./violator-section";
import ViolationSection from "./violation-section";
import VehicleSection from "./vehicle-section";
import OwnerSection from "./owner-section";
import CourtSection from "./court-section";
import ViolationLocationSection from "./violation-location-section";
import ArrestingOfficerSection from "./arresting-officer-section";
import FooterSection from "./footer-section";

interface IFrontPageProps {
    /** The controllers belonging to the form this page is part of. */
    readonly controllers: IControllerManager;
    /** Binds this page instance to the form controller. */
    readonly binding: IPageBinding<FrontPageModel>;
    /** When true, the drag-and-drop import targets are not offered. */
    readonly isReadOnly?: boolean;
}

/** Defines the front page of the S438 citation form. */
export default function FrontPage({ controllers, binding, isReadOnly }: IFrontPageProps): React.JSX.Element {
    const dragAndDropController = controllers.getDragAndDropController();
    const s438CitationService = useService<IS438CitationService>(IS438CitationService);
    const frontPage = binding.get();

    return (
        <>
            <HeaderSection section={frontPage.getHeaderSection()} />
            <FDropzone
                controller={dragAndDropController}
                dropzone={frontPage.getDropzone(FrontPageViolatorDropzone)}
                onDrop={isReadOnly ? undefined : (dropzone) => binding.update((page) => s438CitationService.applyViolatorDropzone(page, dropzone))}
            >
                <ViolatorSection binding={binding.getSection(frontPage.violatorSection)} />
            </FDropzone>
            <ViolationSection binding={binding.getSection(frontPage.violationSection)} />
            <FDropzone
                controller={dragAndDropController}
                dropzone={frontPage.getDropzone(FrontPageVehicleDropzone)}
                onDrop={isReadOnly ? undefined : (dropzone) => binding.update((page) => s438CitationService.applyVehicleDropzone(page, dropzone))}
            >
                <VehicleSection binding={binding.getSection(frontPage.vehicleSection)} />
            </FDropzone>
            <FDropzone
                controller={dragAndDropController}
                dropzone={frontPage.getDropzone(FrontPageOwnerDropzone)}
                onDrop={isReadOnly ? undefined : (dropzone) => binding.update((page) => s438CitationService.applyOwnerDropzone(page, dropzone))}
            >
                <OwnerSection binding={binding.getSection(frontPage.ownerSection)} />
            </FDropzone>
            <div className="row g-0">
                <div className="col-12 text-center border border-dark border-bottom-0">
                    <small className="fw-bold">YOU ARE SUMMONED TO APPEAR BEFORE THE TRIAL COURT</small>
                </div>
            </div>
            <CourtSection binding={binding.getSection(frontPage.courtSection)} />
            <ViolationLocationSection binding={binding.getSection(frontPage.violationLocationSection)} />
            <ArrestingOfficerSection binding={binding.getSection(frontPage.arrestingOfficerSection)} />
            <FooterSection binding={binding.getSection(frontPage.footerSection)} />
        </>
    );
}
