import React from "react";
import { useService } from "@common/react";
import { IControllerManager, IPageBinding, FDropzone, FLabel } from "@forms/core";

import { DetailPageModel } from "../../models/detail-page/detail-page";
import { DetailPageOwnerDropzone } from "../../models/detail-page/dropzones/detail-page-owner-dropzone";
import { IOKParkingService } from "../../services";

import { NotesSection } from "./notes-section";
import { RecordSection } from "./record-section";
import { RegisteredOwnerSection } from "./registered-owner-section";
import { VehicleDetailSection } from "./vehicle-detail-section";

interface IDetailPageProps {
    /** The controllers belonging to the form this page is part of. */
    readonly controllers: IControllerManager;
    /** Binds this page instance to the form controller. */
    readonly binding: IPageBinding<DetailPageModel>;
}

/** Defines the detail page of the Oklahoma City parking violation form. */
export default function DetailPage({ controllers, binding }: IDetailPageProps): React.JSX.Element {
    const dragAndDropController = controllers.getDragAndDropController();

    const okParkingService = useService<IOKParkingService>(IOKParkingService);
    const detailPage = binding.get();

    return (
        <>
            <div className="text-center mb-3">
                <FLabel fontSize="5" textAlignment="center">Parking Citation Number</FLabel>
            </div>

            <RecordSection binding={binding.getSection(detailPage.recordSection)} />

            <FDropzone
                controller={dragAndDropController}
                dropzone={detailPage.getDropzone(DetailPageOwnerDropzone)}
                onDrop={binding.mode !== "editable" ? undefined : (dropzone) => binding.update({ update: (page) => okParkingService.applyOwnerDropzone(page, dropzone), reason: { kind: "dropped", type: dropzone.type } })}
            >
                <RegisteredOwnerSection binding={binding.getSection(detailPage.registeredOwnerSection)} />
            </FDropzone>

            <VehicleDetailSection binding={binding.getSection(detailPage.vehicleDetailSection)} />
            <NotesSection binding={binding.getSection(detailPage.notesSection)} />
        </>
    );
}
